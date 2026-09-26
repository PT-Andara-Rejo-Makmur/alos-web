import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DirectorReviewProjection } from "@/features/reviews/director-review-projection";

describe("ReviewPackage projections", () => {
  it("menonaktifkan decision command tanpa Backend state", () => {
    render(<DirectorReviewProjection />);
    for (const label of ["APPROVE", "RETURN", "REJECT", "HOLD"]) {
      expect(screen.getByRole("button", { name: label })).toBeDisabled();
    }
    expect(screen.queryByText(/raw json/i)).not.toBeInTheDocument();
  });
});
