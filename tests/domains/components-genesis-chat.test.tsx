import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GenesisChat } from "@/features/genesis-workspace/conversation-workspace";

const actor = {
  user_id: "00000000-0000-0000-0000-000000000001",
  organization_id: "00000000-0000-0000-0000-000000000002",
  roles: ["DIRECTOR"],
  division_codes: ["PROPERTY"],
  workspace_ids: ["00000000-0000-0000-0000-000000000003"],
  issued_at: "2026-09-09T00:00:00Z",
  expires_at: "2026-09-10T00:00:00Z",
};

describe("GENESIS workspace", () => {
  it("renders the company workspace navigation, chat, and inspector without UUID input", () => {
    const html = renderToStaticMarkup(<GenesisChat actor={actor} />);

    expect(html).not.toContain("Your AI Business Companion");
    expect(html).not.toContain("From data to decisions");
    expect(html).not.toContain("Workspace GENESIS");
    expect(html).toContain("Percakapan");
    expect(html).toContain("Percakapan Baru");
    expect(html).toContain("Konteks");
    expect(html).toContain("Agents");
    expect(html).toContain("Aktivitas");
    expect(html).toContain("Unggah dokumen");
    expect(html).toContain("<svg");
    expect(html).not.toContain("UUID entitas");
  });

  it("keeps adaptive chat as the primary interaction", () => {
    const html = renderToStaticMarkup(<GenesisChat actor={actor} />);

    expect(html).toContain("Apa yang ingin Anda ketahui?");
    expect(html).toContain("Ask GENESIS about the company");
    expect(html).not.toContain("Jawaban ringkas");
    expect(html).not.toContain("auto create task");
  });
});
