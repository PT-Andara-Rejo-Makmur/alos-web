import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { researchDomains, SharedResearchWorkspace } from "@/features/research";

afterEach(cleanup);

describe("shared R&D workspace", () => {
  it("menyediakan INTERNAL dan EXTERNAL sebagai request mode", () => {
    render(<SharedResearchWorkspace />);

    expect(screen.getByLabelText("INTERNAL")).toBeChecked();
    fireEvent.click(screen.getByLabelText("EXTERNAL"));
    expect(screen.getByLabelText("EXTERNAL")).toBeChecked();
    expect(screen.getByText(/EXTERNAL adalah untrusted input/)).toBeInTheDocument();
  });

  it("menyediakan tepat empat domain dalam satu selector", () => {
    render(<SharedResearchWorkspace />);

    expect(researchDomains.map((domain) => domain.label)).toEqual([
      "Teknologi",
      "Model Bisnis Properti",
      "Manajemen Perusahaan",
      "Properti",
    ]);
    expect(screen.getAllByRole("option")).toHaveLength(4);
    fireEvent.change(screen.getByLabelText("R&D domain"), {
      target: { value: "PROPERTY_BUSINESS" },
    });
    expect(screen.getByText(/unit economics/)).toBeInTheDocument();
  });
});
