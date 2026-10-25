import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import GradientBarsBackground from "./gradient-bars-background";

describe("GradientBarsBackground", () => {
  it("renders the requested number of bars and its children", () => {
    const { container, getByText } = render(
      <GradientBarsBackground numBars={5}>
        <p>Hero content</p>
      </GradientBarsBackground>
    );

    expect(getByText("Hero content")).toBeInTheDocument();
    expect(container.querySelectorAll(".flex.h-full > div")).toHaveLength(5);
  });
});
