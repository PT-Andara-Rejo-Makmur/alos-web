import { cleanup, fireEvent, render, screen, waitFor, within, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { EntitySelect, FormField, FormJourney, Tabs } from "@/components/ui";
import { businessMetricValue, readableValue, statusLabel } from "@/lib/presentation";
import { isBusinessPerformance, isBusinessWorkQueue } from "@/lib/business-projection";
import { ProcessInbox } from "@/features/shared-work/processes/process-inbox";
import { ProcessItem } from "@/features/shared-work/processes/process-queue";
import { AraProgress } from "@/features/ara/ara-progress";
import { ReviewedTask } from "@/features/ara/reviewed-task";
import { CapabilityRequests } from "@/features/ara/capability-requests";
import { ProcessRequest } from "@/features/business-records/process-request";
import { documentFileError, DocumentUploadStatus, uploadDocumentFile } from "@/features/shared-work/documents/document-upload";
import * as api from "@/lib/api";
import type { BusinessMetric, DocumentUpload } from "@/lib/contracts";
import { processFixture, performanceFixture } from "./helpers/business-projections";

describe("business review requests", () => {
  it.each([
    ["property", "change_orders", "CHANGE_ORDER"],
    ["property", "payment_certificates", "PAYMENT_CERTIFICATE"],
    ["sales", "bookings", "BOOKING"],
    ["hr", "recruitments", "RECRUITMENT"],
    ["hr", "onboardings", "ONBOARDING"],
    ["hr", "employees", "OFFBOARDING"],
    ["hr", "employment_contracts", "EMPLOYMENT_CONTRACT"],
  ])("submits %s/%s to the existing review route", async (domain, resource, businessType) => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation((_path, options) => options?.method === "POST"
      ? Promise.resolve({ ...processFixture, business_type: businessType })
      : Promise.reject(new api.ApiError(404, "Not found", null)));
    render(<ProcessRequest domain={domain} resource={resource} identity="business-record-1" />);
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/processes/subjects/" + businessType + "/business-record-1"));
    const button = screen.getByRole("button", { name: businessType === "OFFBOARDING" ? "Ajukan Pengakhiran Kerja" : "Ajukan Pemeriksaan" });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Alasan pengajuan"), { target: { value: "  Pemeriksaan diperlukan untuk kesiapan pekerjaan  " } });
    fireEvent.click(button);
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/processes", { method: "POST", body: {
      business_type: businessType, subject_id: "business-record-1", reason: "Pemeriksaan diperlukan untuk kesiapan pekerjaan",
    } }));
    expect(await screen.findByRole("status")).toHaveTextContent(processFixture.next_action);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
  it("uses the decision action permitted by Backend with its unchanged snapshot", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ ...processFixture, status: "COMPLETED", steps: [] });
    render(<ProcessItem initial={processFixture} workspaceKey="finance" />);
    expect(screen.getByRole("button", { name: "Simpan Hasil Pemeriksaan" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Hasil pemeriksaan atau alasan/), { target: { value: "Anggaran dan dokumen telah diperiksa" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Hasil Pemeriksaan" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/processes/process_1/steps/step_1/actions", { method: "POST", body: {
      action: "COMPLETE", subject_snapshot: "opaque-digest", reason: "Anggaran dan dokumen telah diperiksa",
    } }));
    expect(await screen.findByText("Selesai")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Simpan Hasil Pemeriksaan" })).not.toBeInTheDocument();
  });
  it("records an assistant need using only the authorized business fields", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ items: [], can_create: true, can_resolve: false });
    render(<CapabilityRequests />);
    fireEvent.click(screen.getByRole("button", { name: "Minta bantuan baru" }));
    const need = await screen.findByLabelText(/Apa yang ingin dibantu ALOS/);
    fireEvent.change(need, { target: { value: "  Periksa kelengkapan dokumen pekerjaan  " } });
    fireEvent.change(screen.getByLabelText(/Tujuan/), { target: { value: "  Mengurangi pengajuan yang perlu diperbaiki  " } });
    fireEvent.change(screen.getByLabelText("Konteks tambahan"), { target: { value: "  Pemeriksaan sebelum pembayaran  " } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan kebutuhan" }));
    await waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/business/capability-requests", { method: "POST", body: {
      need: "Periksa kelengkapan dokumen pekerjaan", goal: "Mengurangi pengajuan yang perlu diperbaiki", business_context: "Pemeriksaan sebelum pembayaran",
    } }));
    expect(screen.queryByText(/Kemampuan sudah tersedia/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Factory|AgentDraft|Registry State/)).not.toBeInTheDocument();
  });
});

vi.mock("next/navigation", () => ({ useParams: () => ({ workspaceKey: "finance" }) }));
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("business presentation", () => {
  it("preserves exact monetary strings beyond JavaScript numeric precision", () => {
    const metric: BusinessMetric = {code:"payables",label:"Utang",value:"9007199254740993.50",unit:"AMOUNT",available:true,source:"finance.payables"};
    expect(businessMetricValue(metric)).toBe("Rp 9.007.199.254.740.993,50");
    expect(businessMetricValue({...metric,available:false})).toBe("Belum tersedia");
    expect(businessMetricValue({...metric,value:0})).toBe("Rp 0");
  });
  it("keeps business codes readable while localizing canonical enums", () => {
    expect(readableValue("THEPARK")).toBe("THEPARK");
    expect(statusLabel("UNDER_REVIEW")).toBe("Sedang Diperiksa");
    expect(statusLabel("RECORDED_ISSUES")).toBe("Ada Masalah Tercatat");
    expect(statusLabel("UNKNOWN_INTERNAL_STATE")).toBe("Belum Tersedia");
  });
  it("rejects malformed operational projections without substituting zeros", () => {
    expect(isBusinessPerformance(performanceFixture)).toBe(true);
    expect(isBusinessPerformance({...performanceFixture,decisions:[{process_id:"only-id"}]})).toBe(false);
    expect(isBusinessPerformance({...performanceFixture,domains:[{domain:"finance",metrics:[]}]})).toBe(false);
    expect(isBusinessPerformance({...performanceFixture,target_details:[{target:null}]})).toBe(false);
    expect(isBusinessWorkQueue({ processes: [processFixture], tasks: [], approvals: [], findings: [], notifications: [] })).toBe(true);
    expect(isBusinessWorkQueue({ items: [], total: 0 })).toBe(false);
    expect(isBusinessWorkQueue({ processes: [{process_id: "only-id"}], tasks: [], approvals: [], findings: [], notifications: [] })).toBe(false);
  });
  it("preserves safe account guidance and hides runtime diagnostics", () => {
    expect(api.apiMessage(new Error("Tautan aktivasi tidak valid atau telah kedaluwarsa."))).toBe("Tautan aktivasi tidak valid atau telah kedaluwarsa.");
    expect(api.apiMessage(new TypeError("Failed to parse URL from /api/backend/private-path"))).not.toMatch(/URL|backend|private-path/);
    expect(api.apiMessage(new api.ApiError(400, "Periksa tanggal akhir rencana.", null))).toBe("Periksa tanggal akhir rencana.");
    expect(api.apiMessage(new api.ApiError(400, "OWNER_ROLE_INVALID", null))).not.toMatch(/OWNER_ROLE/);
  });
});

describe("guided forms and keyboard navigation", () => {
  it("validates each visible step, retains values, and submits only from review", () => {
    const saved=vi.fn();
    function Example() {
      const [name,setName]=useState("");
      return <FormJourney onSubmit={event=>{event.preventDefault();saved(name);}} onCancel={vi.fn()} steps={[
        {title:"Identitas",content:<FormField label="Nama" required><input value={name} required onChange={event=>setName(event.target.value)} /></FormField>},
        {title:"Tinjau",content:<p>{name}</p>},
      ]} />;
    }
    render(<Example />);
    fireEvent.click(screen.getByRole("button",{name:"Lanjut"}));
    expect(screen.getByLabelText(/Nama/)).toBeVisible();
    expect(saved).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Nama/),{target:{value:"The Park"}});
    fireEvent.click(screen.getByRole("button",{name:"Lanjut"}));
    expect(screen.getByRole("heading",{name:"Tinjau"})).toHaveFocus();
    expect(screen.getByLabelText(/Nama/)).toBeDisabled();
    fireEvent.click(screen.getByRole("button",{name:"Kembali"}));
    expect(screen.getByLabelText(/Nama/)).toHaveValue("The Park");
    fireEvent.click(screen.getByRole("button",{name:"Lanjut"}));
    fireEvent.click(screen.getByRole("button",{name:"Simpan"}));
    expect(saved).toHaveBeenCalledExactlyOnceWith("The Park");
  });
  it("searches human labels and preserves the canonical selected value", () => {
    const changed=vi.fn();
    render(<FormField label="Proyek"><EntitySelect label="Proyek" value="project-private-0" onChange={changed} options={Array.from({length:12},(_,i)=>({value:"project-private-"+i,label:"Proyek "+i}))} /></FormField>);
    fireEvent.change(screen.getByRole("searchbox"),{target:{value:"Proyek 11"}});
    expect(screen.getByLabelText("Proyek")).toHaveValue("project-private-0");
    expect(screen.getByRole("option",{name:"Proyek 0"})).toBeInTheDocument();
    expect(screen.queryByRole("option",{name:"Proyek 5"})).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Proyek"),{target:{value:"project-private-11"}});
    expect(changed).toHaveBeenCalledExactlyOnceWith("project-private-11");
    expect(screen.queryByText("project-private-11")).not.toBeInTheDocument();
  });
  it("uses keyboard tabs without references to nonexistent panels", () => {
    render(<Tabs items={[{id:"all",label:"Semua"},{id:"mine",label:"Saya"}]} />);
    const first=screen.getByRole("tab",{name:"Semua"});
    expect(first).not.toHaveAttribute("aria-controls");
    first.focus();fireEvent.keyDown(first,{key:"ArrowRight"});
    expect(screen.getByRole("tab",{name:"Saya"})).toHaveFocus();
    expect(screen.getByRole("tab",{name:"Saya"})).toHaveAttribute("aria-selected","true");
  });
});

describe("process review authority", () => {
  it("filters the actionable inbox and withholds internal identifiers", () => {
    render(<ProcessInbox workspaceKey="finance" queue={{processes:[processFixture],tasks:[],approvals:[],findings:[],notifications:[]}} />);
    expect(screen.getByRole("heading",{name:"Perlu Tindakan"})).toBeInTheDocument();
    expect(screen.getByText("PC-018")).toBeInTheDocument();
    expect(screen.queryByText(processFixture.process_id)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Perlu Diperbaiki"}));
    expect(screen.queryByText("PC-018")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Perlu Keputusan"}));
    expect(screen.getByRole("link",{name:/Tinjau Keputusan/})).toHaveAttribute("href","/workspace/finance/processes/process_1");
  });
  it("sends the unchanged Backend snapshot when returning a process", async () => {
    const request=vi.spyOn(api,"authenticatedApiRequest").mockResolvedValue({...processFixture,status:"RETURNED",steps:[],can_request_direction:false});
    render(<ProcessItem initial={processFixture} workspaceKey="finance" />);
    fireEvent.change(screen.getByLabelText(/Hasil pemeriksaan atau alasan/),{target:{value:"  Lampirkan pemeriksaan anggaran  "}});
    fireEvent.click(screen.getByRole("button",{name:"Kembalikan untuk Perbaikan"}));
    await waitFor(()=>expect(request).toHaveBeenCalledWith("/api/v1/processes/process_1/steps/step_1/actions",{method:"POST",body:{action:"RETURN",subject_snapshot:"opaque-digest",reason:"Lampirkan pemeriksaan anggaran"}}));
    expect(await screen.findByText("Perlu Diperbaiki")).toBeInTheDocument();
  });
  it("retains the director request dialog after Backend denies the action", async () => {
    const request=vi.spyOn(api,"authenticatedApiRequest").mockRejectedValue(new api.ApiError(403,"AUTHORITY_BOUNDARY_CONFLICT",null));
    render(<ProcessItem initial={processFixture} workspaceKey="finance" />);
    fireEvent.click(screen.getByRole("button",{name:"Minta Arahan Direktur"}));
    const dialog=screen.getByRole("dialog");
    expect(within(dialog).getByRole("button",{name:"Kirim Permintaan Arahan"})).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText(/Alasan meminta arahan Direktur/),{target:{value:"Kasus membutuhkan arahan"}});
    fireEvent.click(within(dialog).getByRole("button",{name:"Kirim Permintaan Arahan"}));
    await waitFor(()=>expect(request).toHaveBeenCalledWith("/api/v1/processes/process_1/request-direction",{method:"POST",body:{reason:"Kasus membutuhkan arahan"}}));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("tidak memiliki kewenangan");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.queryByText("AUTHORITY_BOUNDARY_CONFLICT")).not.toBeInTheDocument();
  });
  it("does not mark completed processes as overdue", () => {
    render(<ProcessItem initial={{...processFixture,status:"COMPLETED",due_at:"2020-01-01T00:00:00Z",steps:[],can_request_direction:false}} workspaceKey="finance" />);
    expect(screen.queryByText(/Terlambat/)).not.toBeInTheDocument();
  });
});

describe("document ingestion", () => {
  it("accepts only the real supported formats and file size", () => {
    expect(documentFileError(new File(["a"],"readme.TXT"))).toBeNull();
    expect(documentFileError(new File(["a"],"agreement.docx"))).toBeNull();
    expect(documentFileError(new File(["a"],"agreement.pdf"))).toContain("DOCX dan TXT");
    expect(documentFileError(new File([],"empty.txt"))).toContain("10 MB");
    const file=new File(["a"],"large.txt");Object.defineProperty(file,"size",{value:10*1024*1024+1});
    expect(documentFileError(file)).toContain("10 MB");
  });
  it("uploads the raw file with canonical document ID and version", async () => {
    const request=vi.spyOn(api,"authenticatedApiRequest").mockResolvedValue({});
    const file=new File(["agreement"],"agreement.docx");
    await uploadDocumentFile("document-1",file,"1.2");
    expect(request).toHaveBeenCalledExactlyOnceWith("/api/v1/documents/document-1/uploads?filename=agreement.docx&version=1.2",{method:"POST",body:file,headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}});
  });
  it("stops polling after ingestion succeeds and notifies readiness once", async () => {
    vi.useFakeTimers();
    const upload:DocumentUpload={upload_id:"upload-1",document_id:"document-1",version:"1.2",filename:"a.txt",content_hash:"hidden",size_bytes:1,status:"QUEUED",attempts:0,safe_error_code:null,source_id:null};
    const request=vi.spyOn(api,"authenticatedApiRequest").mockResolvedValue({...upload,status:"SUCCEEDED"});
    const ready=vi.fn();render(<DocumentUploadStatus initial={upload} onReady={ready} />);
    await act(()=>vi.advanceTimersByTimeAsync(2000));
    expect(request).toHaveBeenCalledTimes(1);expect(ready).toHaveBeenCalledTimes(1);
    await act(()=>vi.advanceTimersByTimeAsync(10000));
    expect(request).toHaveBeenCalledTimes(1);expect(ready).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Versi siap diperiksa")).toBeInTheDocument();
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });
  it("cancels ingestion polling when leaving the document", async () => {
    vi.useFakeTimers();
    const request=vi.spyOn(api,"authenticatedApiRequest");
    const view=render(<DocumentUploadStatus initial={{upload_id:"upload-1",document_id:"document-1",version:"1",filename:"a.txt",content_hash:"",size_bytes:1,status:"RUNNING",attempts:1,safe_error_code:null,source_id:null}} />);
    view.unmount();await act(()=>vi.advanceTimersByTimeAsync(10000));
    expect(request).not.toHaveBeenCalled();
  });
});

describe("governed assistant", () => {
  it("marks only received progress events as completed", () => {
    render(<AraProgress label="ARA sedang bekerja" events={[{event_id:1,kind:"UNDERSTANDING",occurred_at:"2026-10-03T00:00:00Z"},{event_id:2,kind:"ANALYZING",occurred_at:"2026-10-03T00:00:01Z"}]} />);
    const items=screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("selesai");
    expect(items[1]).toHaveTextContent("belum dimulai");
    expect(items[2]).toHaveTextContent("sedang diproses");
    expect(items[3]).toHaveTextContent("belum dimulai");
  });
  it("requires human review and Backend revalidation before making a proposed task", async () => {
    const request=vi.spyOn(api,"authenticatedApiRequest").mockImplementation((_path,options)=>options?.method==="POST"?Promise.resolve({task_id:"task-new",review_reason:"Dokumen perlu diperiksa"}):Promise.reject(new api.ApiError(404,"not found",null)));
    const proposal={proposal_id:"proposal-1",kind:"TASK" as const,status:"NEEDS_REVIEW" as const,summary:"Periksa PC-018",required_permission:"task.create",executed:false as const};
    render(<ReviewedTask proposal={proposal} threadId="thread-1" runId="run-1" />);
    fireEvent.click(await screen.findByRole("button",{name:"Tinjau"}));
    expect(request.mock.calls.filter(([,options])=>options?.method==="POST")).toHaveLength(0);
    fireEvent.change(screen.getByLabelText(/Judul tugas/),{target:{value:"Periksa PC-018"}});
    expect(screen.getByRole("button",{name:"Periksa dan buat tugas"})).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Alasan setelah pemeriksaan/),{target:{value:"Dokumen perlu diperiksa"}});
    fireEvent.click(screen.getByRole("button",{name:"Periksa dan buat tugas"}));
    await waitFor(()=>expect(request).toHaveBeenCalledWith("/api/v1/ara/threads/thread-1/runs/run-1/proposals/proposal-1/task",{method:"POST",body:{review_reason:"Dokumen perlu diperiksa",task:{title:"Periksa PC-018",priority:"NORMAL"}}}));
    expect(await screen.findByRole("link",{name:"Buka tugas"})).toHaveAttribute("href","/workspace/finance/tasks/task-new");
    expect(proposal.executed).toBe(false);
  });
});
