import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DirectorReviewProjection } from "@/features/reviews/director-review-projection";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";

describe("ReviewPackage projections", () => {
  it("menandai AI review sebagai recommendation, bukan approval", () => {
    render(<ItReviewProjection />);
    expect(screen.getByText(/tidak pernah sebagai approval/i)).toBeInTheDocument();
  });

  it("menonaktifkan decision command tanpa Backend state", () => {
    render(<DirectorReviewProjection />);
    for (const label of ["APPROVE", "RETURN", "REJECT", "HOLD"]) {
      expect(screen.getByRole("button", { name: label })).toBeDisabled();
    }
    expect(screen.queryByText(/raw json/i)).not.toBeInTheDocument();
  });
});
