import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const { prismaMock, getSessionUserMock } = vi.hoisted(() => ({
  prismaMock: { tokenPurchase: { create: vi.fn() } },
  getSessionUserMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getSessionUser: getSessionUserMock }));

const req = (body: unknown) =>
  new Request("http://localhost/api/tokens/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/tokens/purchase", () => {
  beforeEach(() => {
    prismaMock.tokenPurchase.create.mockReset();
    getSessionUserMock.mockReset();
  });

  it("returns 401 when there is no session", async () => {
    getSessionUserMock.mockResolvedValue(null);

    const res = await POST(req({ tier: "50" }), undefined);

    expect(res.status).toBe(401);
    expect(prismaMock.tokenPurchase.create).not.toHaveBeenCalled();
  });

  it("returns 400 for an unknown tier", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u1", role: "SOLVER" });

    const res = await POST(req({ tier: "999" }), undefined);

    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
    expect(prismaMock.tokenPurchase.create).not.toHaveBeenCalled();
  });

  it("records a pending purchase with the tier's amount and tokens", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u1", role: "SOLVER" });
    const purchase = {
      id: "tp1",
      userId: "u1",
      tier: "50",
      amount: 99,
      tokens: 50,
      status: "PENDING",
    };
    prismaMock.tokenPurchase.create.mockResolvedValue(purchase);

    const res = await POST(req({ tier: "50" }), undefined);

    expect(res.status).toBe(201);
    expect(prismaMock.tokenPurchase.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        tier: "50",
        amount: 99,
        tokens: 50,
        status: "PENDING",
      },
    });
    expect((await res.json()).purchase).toEqual(purchase);
  });

  it("uses the selected tier's price, not a fixed one", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u1", role: "SOLVER" });
    prismaMock.tokenPurchase.create.mockResolvedValue({ id: "tp2" });

    await POST(req({ tier: "100" }), undefined);

    expect(prismaMock.tokenPurchase.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tier: "100", amount: 179, tokens: 100 }),
      })
    );
  });
});
