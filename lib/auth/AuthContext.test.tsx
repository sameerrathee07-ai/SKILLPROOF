import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth, AuthUser } from "@/lib/auth/AuthContext";

const { mockPush, sessionRef } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  sessionRef: { current: null as unknown },
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useSession: () => sessionRef.current,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const AUTH_STORAGE_KEY = "skillproof_auth_user";

const fetchedUser: AuthUser = {
  id: "u1",
  name: "Test User",
  email: "x@y.com",
  role: "SOLVER",
  tokens: 50,
  credibilityScore: 1.0,
};

function Consumer() {
  const { user, loading, login, signup, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user-name">{user ? user.name : "none"}</span>
      <span data-testid="user-identity">
        {user ? `${user.id}|${user.role}|${user.email}|${user.tokens}` : "none"}
      </span>
      <button onClick={() => login("x@y.com")}>login</button>
      <button onClick={() => signup({ name: "N", email: "x@y.com", role: "SOLVER" })}>signup</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  const alertMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    alertMock.mockReset();
    mockPush.mockReset();
    sessionRef.current = { data: null, status: "unauthenticated" };
    vi.stubGlobal("alert", alertMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stays signed out when nothing is stored", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user-name").textContent).toBe("none");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("clears the demo user persisted by older builds", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        id: "solver_default",
        name: "Aryan Verma",
        email: "aryan@solver.skillproof.dev",
        role: "SOLVER",
        tokens: 50,
        credibilityScore: 1.2,
      })
    );
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user-name").textContent).toBe("none");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("restores a stored user on mount", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fetchedUser));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user-name").textContent).toBe("Test User");
  });

  it("logs in successfully and stores the user", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user: fetchedUser }) });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("user-name").textContent).toBe("Test User"));
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}").name).toBe("Test User");
  });

  it("alerts on login failure and returns without changing user", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Invalid credentials" }) });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("login"));
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Invalid credentials"));
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });

  it("alerts on network error during login", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("login"));
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Network error during login"));
  });

  it("signs up successfully and stores the user", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user: fetchedUser }) });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("signup"));
    await waitFor(() => expect(screen.getByTestId("user-name").textContent).toBe("Test User"));
  });

  it("alerts on signup failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Signup failed" }) });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("signup"));
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Signup failed"));
  });

  it("alerts on network error during signup", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("signup"));
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith("Network error during signup"));
  });

  it("logs out, clears storage, and redirects to /login", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fetchedUser));
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("logout"));
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(screen.getByTestId("user-name").textContent).toBe("none");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("keeps the Google session identity over a stale local login", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        id: "local-1",
        name: "Local",
        email: "local@example.com",
        role: "POSTER",
        tokens: 99,
        credibilityScore: 1,
      })
    );
    sessionRef.current = {
      status: "authenticated",
      data: {
        user: {
          id: "google-1",
          name: "Google",
          email: "google@example.com",
          role: "SOLVER",
          tokens: 3,
          credibilityScore: 2,
        },
      },
    };

    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId("user-identity").textContent).toBe(
        "google-1|SOLVER|google@example.com|3"
      )
    );
  });

  it("uses the Google session when nothing is stored locally", async () => {
    sessionRef.current = {
      status: "authenticated",
      data: {
        user: {
          id: "google-1",
          name: "Google",
          email: "google@example.com",
          role: "ADMIN",
          tokens: 10,
          credibilityScore: 4,
        },
      },
    };

    renderAuth();

    await waitFor(() =>
      expect(screen.getByTestId("user-identity").textContent).toBe(
        "google-1|ADMIN|google@example.com|10"
      )
    );
  });
});

describe("useAuth outside AuthProvider", () => {
  it("returns the default context value", () => {
    render(<Consumer />);
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });
});
