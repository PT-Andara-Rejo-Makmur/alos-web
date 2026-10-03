import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BusinessSummaryPanel } from "@/features/business-records/business-summary";
import { BusinessRecordActions } from "@/features/business-records/business-record-actions";
import { ProcessRequest } from "@/features/business-records/process-request";
import { ProcessPacket } from "@/features/shared-work/processes/process-packet";
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

it("submits workforce needs without selecting reviewers in the browser", async () => {
  const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((_path, options) =>
    options?.method === "POST" ? Promise.resolve({ process_id: "process-1", steps: [], next_action: "Pemeriksaan kepala divisi" })
      : Promise.reject(new api.ApiRequestError("Belum ada pengajuan", 404)),
  );
  render(<ProcessRequest domain="hr" resource="recruitments" identity="recruitment-1" />);
  const submit = screen.getByRole("button", { name: "Ajukan Pemeriksaan" });
  expect(submit).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Alasan pengajuan"), { target: { value: "  Penambahan tenaga proyek  " } });
  fireEvent.click(submit);
  expect(await screen.findByRole("status")).toHaveTextContent("Pemeriksaan kepala divisi");
  expect(request).toHaveBeenCalledWith("/api/v1/processes", { method: "POST", body: {
    business_type: "RECRUITMENT", subject_id: "recruitment-1", reason: "Penambahan tenaga proyek",
  } });
});

it("shows workforce facts for review while withholding unknown packet fields", () => {
  render(<ProcessPacket packet={{ position_title: "Teknisi", employment_type: "CONTRACT", headcount: 3,
    reason: "Pekerjaan tambahan", requesting_workspace_id: "workspace-private", secret: "not-for-display" }} />);
  expect(screen.getByLabelText("Informasi pengajuan")).toBeInTheDocument();
  expect(screen.getByText("Teknisi")).toBeInTheDocument();
  expect(screen.getByText("Kontrak")).toBeInTheDocument();
  expect(screen.getByText("3")).toBeInTheDocument();
  expect(screen.getByText("Pekerjaan tambahan")).toBeInTheDocument();
  expect(screen.queryByText("workspace-private")).not.toBeInTheDocument();
  expect(screen.queryByText("not-for-display")).not.toBeInTheDocument();
});
