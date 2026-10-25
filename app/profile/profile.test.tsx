import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "./page";
import { AuthProvider } from "@/lib/auth/AuthContext";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/profile",
  useSearchParams: () => new URLSearchParams(),
}));

const AUTH_STORAGE_KEY = "skillproof_auth_user";

describe("Profile Page Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows sign in required when user is not logged in", async () => {
    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Sign In Required/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Sign In to Access Profile/i })).toBeInTheDocument();
  });

  it("renders profile form with pfp, name, age, company, and role fields when signed in", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        id: "usr_123",
        name: "Alex Morgan",
        email: "alex@example.com",
        role: "SOLVER",
        tokens: 50,
        credibilityScore: 1.0,
        age: 26,
        company: "Acme Labs",
      })
    );

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /User Profile/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Profile Picture \(PFP\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Platform Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Biography/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
  });
});
