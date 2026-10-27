import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sendGateEvaluationResult,
  sendNewVettedProposalAlert,
  sendProposalStatusUpdate,
} from "./service";

const evaluation = {
  overallScore: 8.4,
  passed: true,
  knockedOut: false,
  knockoutReason: null,
  actionableFeedback: ["Add a budget line for hosting."],
  dimensions: {
    diagnosis: { score: 8, maxScore: 10, feedback: "Clear root cause." },
  },
} as any;

const originalKey = process.env.RESEND_API_KEY;

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("email service", () => {
  it("logs instead of sending when no API key is configured", async () => {
    delete process.env.RESEND_API_KEY;
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = await sendGateEvaluationResult({
      to: "solver@example.com",
      solverName: "Ada",
      problemTitle: "Attendance",
      evaluation,
    });

    expect(result).toEqual({ sent: false, fallback: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(
      "[email:fallback]",
      expect.stringContaining("solver@example.com")
    );
  });

  it("posts the rendered email to Resend", async () => {
    process.env.RESEND_API_KEY = "test-key";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    const result = await sendNewVettedProposalAlert({
      to: "owner@example.com",
      orgName: "Acme",
      problemTitle: "Attendance",
      solverName: "Ada",
      score: 8.4,
      proposalId: "pitch-1",
    });

    expect(result).toEqual({ sent: true, fallback: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);

    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer test-key");
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.subject).toContain("Attendance");
    expect(body.text).toContain("8.4/10");
    expect(body.html).toContain("pitch-1");
  });

  it("reports failure without throwing when Resend returns an error", async () => {
    process.env.RESEND_API_KEY = "test-key";
    fetchMock.mockResolvedValue({ ok: false, status: 422 });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await sendProposalStatusUpdate({
      to: "solver@example.com",
      solverName: "Ada",
      problemTitle: "Attendance",
      status: "SHORTLISTED",
    });

    expect(result).toEqual({ sent: false, fallback: false });
    expect(error).toHaveBeenCalledWith("[email:error]", expect.stringContaining("422"));
  });

  it("reports failure without throwing when the network call rejects", async () => {
    process.env.RESEND_API_KEY = "test-key";
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      sendProposalStatusUpdate({
        to: "solver@example.com",
        solverName: "Ada",
        problemTitle: "Attendance",
        status: "DECLINED",
      })
    ).resolves.toEqual({ sent: false, fallback: false });
  });

  it("escapes solver-supplied text in the HTML body", async () => {
    process.env.RESEND_API_KEY = "test-key";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    await sendProposalStatusUpdate({
      to: "solver@example.com",
      solverName: "<script>alert(1)</script>",
      problemTitle: "Attendance & payroll",
      status: "ACCEPTED",
      posterNotes: '<img src=x onerror="alert(1)">',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(body.html).not.toContain("<script>");
    expect(body.html).not.toContain('onerror="');
    expect(body.html).toContain("&lt;script&gt;");
    expect(body.html).toContain("Attendance &amp; payroll");
  });

  it("maps each status to a readable label", async () => {
    process.env.RESEND_API_KEY = "test-key";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    for (const status of ["SHORTLISTED", "ACCEPTED", "DECLINED"] as const) {
      fetchMock.mockClear();
      await sendProposalStatusUpdate({
        to: "solver@example.com",
        solverName: "Ada",
        problemTitle: "Attendance",
        status,
      });
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.subject.toLowerCase()).toContain(status.toLowerCase());
    }
  });
});
