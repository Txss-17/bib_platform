import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiGrid } from "../KpiGrid";

describe("KpiGrid", () => {
  it("defaults to 4 columns layout", () => {
    render(
      <KpiGrid>
        <div data-testid="child" />
      </KpiGrid>,
    );
    const grid = screen.getByTestId("child").parentElement!;
    expect(grid.dataset.kpiGrid).toBe("4");
    expect(grid.className).toMatch(/grid-cols-2/);
    expect(grid.className).toMatch(/lg:grid-cols-4/);
    // Standard spacing tokens.
    expect(grid.className).toMatch(/gap-3/);
    expect(grid.className).toMatch(/sm:gap-4/);
    expect(grid.className).toMatch(/mb-6/);
  });

  it("supports a 3-column layout", () => {
    render(
      <KpiGrid cols={3}>
        <div data-testid="child" />
      </KpiGrid>,
    );
    const grid = screen.getByTestId("child").parentElement!;
    expect(grid.dataset.kpiGrid).toBe("3");
    expect(grid.className).toMatch(/lg:grid-cols-3/);
  });

  it("supports a 2-column layout", () => {
    render(
      <KpiGrid cols={2}>
        <div data-testid="child" />
      </KpiGrid>,
    );
    const grid = screen.getByTestId("child").parentElement!;
    expect(grid.dataset.kpiGrid).toBe("2");
    expect(grid.className).toMatch(/sm:grid-cols-2/);
  });
});