import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BusinessSummaryPanel } from "@/features/business-records/business-summary";
import { BusinessRecordActions } from "@/features/business-records/business-record-actions";
import { hrResources } from "@/features/hr/resources";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({ useParams: () => ({ workspaceKey: "people" }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("rejects malformed summary data without presenting invented values", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ counts: { employees: 0 } });
  render(<BusinessSummaryPanel domain="hr" />);
  expect(await screen.findByRole("alert")).toHaveTextContent("data yang sesuai");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("preserves authoritative zero and unavailable metrics separately", async () => {
  vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ domain: "hr", generated_at: "2026-10-03T00:00:00Z", metrics: [
    { code: "headcount", label: "Karyawan Aktif", value: 0, unit: "COUNT", available: true, source: "hr.employees" },
    { code: "turnover", label: "Turnover", value: null, unit: "PERCENT", available: false, source: null },
  ] });
  render(<BusinessSummaryPanel domain="hr" />);
  expect(await screen.findByText("Karyawan Aktif")).toBeInTheDocument();
  expect(screen.getByText("0")).toBeInTheDocument();
  expect(screen.getByText("Belum tersedia")).toBeInTheDocument();
});

it("requires an explicit human hiring decision and reads the resulting candidate", async () => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((path, options) => Promise.resolve(
    options?.method === "POST" ? { employee_id: "employee-1", employee_number: "EMP-104" }
      : path.endsWith("/candidate-1") ? { candidate_id: "candidate-1", status: "HIRED", employee_id: "employee-1" } : null,
  ));
  const onSaved = vi.fn();
  render(<BusinessRecordActions resource={hrResources.candidates} record={{ candidate_id: "candidate-1", status: "INTERVIEW" }} canHire onSaved={onSaved} />);
  const decision = screen.getByRole("button", { name: "Terima Kandidat sebagai Karyawan" });
  expect(decision).toBeDisabled();
  expect(request).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Nomor karyawan/), { target: { value: "EMP-104" } });
  fireEvent.change(screen.getByLabelText(/Tanggal mulai bekerja/), { target: { value: "2026-10-05" } });
  fireEvent.change(screen.getByLabelText(/Alasan penerimaan/), { target: { value: "Hasil wawancara memenuhi kebutuhan" } });
  fireEvent.click(decision);
  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ status: "HIRED", employee_id: "employee-1" })));
  expect(request).toHaveBeenCalledWith("/api/v1/hr/candidates/candidate-1/hire", { method: "POST", body: {
    employee_number: "EMP-104", join_date: "2026-10-05", reason: "Hasil wawancara memenuhi kebutuhan",
  } });
  expect(screen.getByRole("status")).toHaveTextContent("EMP-104");
});

it("withholds the hiring decision from division members", () => {
  render(<BusinessRecordActions resource={hrResources.candidates} record={{ candidate_id: "candidate-1", status: "INTERVIEW" }} onSaved={vi.fn()} />);
  expect(screen.queryByRole("button", { name: "Terima Kandidat sebagai Karyawan" })).not.toBeInTheDocument();
});
