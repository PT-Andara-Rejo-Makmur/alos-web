import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef, useState } from "react";
import { Check, X } from "lucide-react";

import {
  Alert,
  Avatar,
  Button,
  DataTable,
  Dialog,
  Drawer,
  EmptyState,
  FormField,
  IconButton,
  LoadingState,
  Metric,
  PageHeader,
  Pagination,
  Section,
  Status,
  Tabs,
  Toolbar,
} from "@/components/ui";

afterEach(() => cleanup());

describe("ALOS UI primitives", () => {
  it("renders button variants, icon button names, and loading state", () => {
    render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading loadingLabel="Menyimpan…">Simpan</Button>
        <IconButton icon={<X size={16} />} label="Tutup" />
      </>,
    );

    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Secondary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Danger" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menyimpan…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tutup" })).toBeInTheDocument();
  });

  it("uses initials for avatar fallback and semantic page heading", () => {
    render(
      <>
        <Avatar alt="Rani Andara" initials="RA" />
        <PageHeader description="Keterangan contoh" eyebrow="CONTOH" title="Halaman contoh" />
      </>,
    );

    expect(screen.getByRole("img", { name: "Rani Andara: RA" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Halaman contoh" })).toBeInTheDocument();
    expect(screen.getByText("Keterangan contoh")).toBeInTheDocument();
  });

  it("renders sections, metrics, statuses, toolbar, and alert content", () => {
    const dismiss = vi.fn();
    render(
      <>
        <Section actions={<Button>Contoh aksi</Button>} description="Ritme contoh" title="Bagian contoh">
          <Metric label="Label" supportingText="Belum tersedia" value="—" />
          <Status icon={<Check size={14} />} label="Aktif" variant="success" />
          <Toolbar search={<input aria-label="Cari" />} />
        </Section>
        <Alert action={<Button>Coba lagi</Button>} message="Data belum dapat dimuat." onDismiss={dismiss} title="Informasi" variant="warning" />
      </>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Bagian contoh" })).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Aktif" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Toolbar" })).toBeInTheDocument();
    expect(screen.getByText("Data belum dapat dimuat.").closest('[role="status"]')).toHaveTextContent("Data belum dapat dimuat.");
    fireEvent.click(screen.getByRole("button", { name: "Tutup pesan" }));
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it("renders a semantic table, empty state, and loading state", () => {
    render(
      <>
        <DataTable
          caption="Contoh tabel"
          columns={[{ header: "Nama", key: "name", render: (row: { name: string }) => row.name }]}
          rows={[{ name: "Item A" }]}
        />
        <DataTable columns={[{ header: "Nama", key: "name", render: () => "" }]} emptyState={<EmptyState description="Data akan tersedia." title="Belum ada data" />} rows={[]} />
        <DataTable columns={[{ header: "Nama", key: "name", render: () => "" }]} loading loadingLabel="Memuat tabel" rows={[]} />
        <LoadingState label="Memuat halaman" variant="page" />
      </>,
    );

    expect(screen.getByRole("table", { name: "Contoh tabel" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader", { name: "Nama" })[0]).toHaveAttribute("scope", "col");
    expect(screen.getByRole("heading", { name: "Belum ada data" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Memuat halaman" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Memuat tabel" })).toBeInTheDocument();
  });

  it("supports tabs selection and keyboard navigation", () => {
    render(
      <Tabs
        items={[
          { content: "Konten satu", id: "satu", label: "Satu" },
          { content: "Konten dua", id: "dua", label: "Dua" },
          { content: "Konten tiga", id: "tiga", label: "Tiga" },
        ]}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tabs[1], { key: "End" });
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tabs[2], { key: "Home" });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Konten tiga");
  });

  it("associates form labels, helper text, and errors", () => {
    render(
      <FormField description="Gunakan teks yang mudah dipahami." error="Isian ini wajib diisi." label="Nama contoh" required>
        <input />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Nama contoh" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
    expect(screen.getByText("Gunakan teks yang mudah dipahami.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Isian ini wajib diisi.");
  });

  it("renders empty state action and pagination with accessible current page", () => {
    const onPageChange = vi.fn();
    render(
      <>
        <EmptyState action={<Button>Tindakan</Button>} description="Data akan ditampilkan setelah tersedia." title="Belum ada data" />
        <Pagination currentPage={2} onPageChange={onPageChange} totalPages={3} />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Belum ada data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Halaman 2" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "Sebelumnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it.each([
    ["Dialog", Dialog],
    ["Drawer", Drawer],
  ])("opens, traps focus, closes with Escape, and restores focus for %s", async (_name, Overlay) => {
    function Harness() {
      const [open, setOpen] = useState(false);
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={triggerRef} onClick={() => setOpen(true)} type="button">Buka overlay</button>
          <Overlay
            description="Deskripsi contoh"
            footer={<button onClick={() => setOpen(false)} type="button">Tindakan</button>}
            onClose={() => setOpen(false)}
            open={open}
            title="Overlay contoh"
            triggerRef={triggerRef}
          >
            <button onClick={() => undefined} type="button">Konten</button>
          </Overlay>
        </>
      );
    }

    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Buka overlay" });
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "Overlay contoh" });
    await waitFor(() => expect(screen.getByRole("button", { name: /Tutup (dialog|drawer)/ })).toHaveFocus());

    const close = screen.getByRole("button", { name: /Tutup (dialog|drawer)/ });
    const content = screen.getByRole("button", { name: "Konten" });
    const action = screen.getByRole("button", { name: "Tindakan" });
    action.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();
    close.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(action).toHaveFocus();
    content.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(content).toHaveFocus();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole("dialog", { name: "Overlay contoh" })).not.toBeInTheDocument();
  });
});
