import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";
import { resetRateLimitsForTests } from "./lib/api/rate-limit";

beforeEach(() => {
  resetRateLimitsForTests();
});

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// jsdom under the vmThreads pool has no crypto.subtle; Web Crypto keeps auth tests working.
import { webcrypto } from "node:crypto";
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
}

// Mock IntersectionObserver for Motion / jsdom
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}
