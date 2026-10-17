import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth, AuthUser } from "@/lib/auth/AuthContext";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const AUTH_STORAGE_KEY = "skillproof_auth_user";

const defaultUser: AuthUser = {
  id: "solver_default",
  name: "Aryan Verma",
  email: "aryan@solver.skillproof.dev",
  role: "SOLVER",
  tokens: 50,
  credibilityScore: 1.2,
};

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
    vi.stubGlobal("alert", alertMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("seeds a default demo user when nothing is stored", async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user-name").textContent).toBe(defaultUser.name);
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}").name).toBe(defaultUser.name);
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
    expect(screen.getByTestId("user-name").textContent).toBe(defaultUser.name);
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
    renderAuth();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    fireEvent.click(screen.getByText("logout"));
    expect(screen.getByTestId("user-name").textContent).toBe("none");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});

describe("useAuth outside AuthProvider", () => {
  it("returns the default context value", () => {
    render(<Consumer />);
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });
});