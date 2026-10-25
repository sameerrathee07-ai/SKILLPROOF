import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroOneDemo from "./demo";

describe("HeroOne Component Integration", () => {
  it("renders the hero component demo successfully", () => {
    render(<HeroOneDemo />);

    // Verify main heading and CTA
    expect(screen.getByText(/Building verified talent with/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();

    // Verify navigation links
    expect(screen.getByText("About us")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });
});
