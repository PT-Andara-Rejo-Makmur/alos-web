"use client";

import type { ReactNode } from "react";
import { formatDocumentDate } from "@/features/documents/policy";
import {
  genesisFollowUpFailureTitle,
  genesisFollowUpLoadingText,
  type GenesisFollowUpFailure,
  type GenesisHistoryMessage,
} from "@/features/genesis-workspace/follow-up";

type GenesisIconName =
  | "alert"
  | "bolt"
  | "bot"
  | "chart"
  | "check"
  | "chevron"
  | "database"
  | "document"
  | "edit"
  | "lightbulb"
  | "message"
  | "sparkles";

const genesisCapabilities: Array<{ icon: GenesisIconName; title: string; description: string; prompt: string }> = [
  { icon: "document", title: "Analisis Dokumen", description: "Menganalisis isi dokumen dan mengekstraksi insight penting", prompt: "Analisa kelengkapan dokumen ini dan identifikasi gap utamanya." },
  { icon: "chart", title: "Ringkas Laporan", description: "Merangkum laporan panjang menjadi insight yang jelas", prompt: "Buat ringkasan eksekutif dari dokumen ini dengan poin keputusan utamanya." },
  { icon: "edit", title: "Susun Draft SOP", description: "Membantu menyusun draft dokumen dan SOP", prompt: "Susun rekomendasi struktur SOP berdasarkan dokumen ini untuk ditinjau manusia." },
  { icon: "lightbulb", title: "Riset Strategis", description: "Memberikan analisis dan rekomendasi berbasis data", prompt: "Analisa risiko strategis, KPI, owner, dan evidence yang belum tersedia pada dokumen ini." },
];

export function GenesisEmptyWelcome({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <section className="alos-genesis-empty-welcome" aria-label="Mulai percakapan dengan GENESIS">
      <div className="alos-genesis-welcome-hero">
        <div className="alos-genesis-welcome-copy">
          <p>AI UNTUK KEPUTUSAN YANG LEBIH BAIK</p>
          <h3>Mulai percakapan dengan GENESIS</h3>
          <span>Ajukan pertanyaan atau minta bantuan untuk menganalisis sumber internal. GENESIS siap membantu Anda dengan insight yang relevan dan terpercaya.</span>
        </div>
        <div className="alos-genesis-welcome-art" aria-hidden="true">
          <i />
          <i />
          <i />
          <strong><GenesisIcon name="sparkles" /></strong>
          <span>Dari data<br />menuju keputusan<br />yang lebih baik.</span>
        </div>
      </div>
      <div className="alos-genesis-capabilities">
        <h4>GENESIS dapat membantu Anda:</h4>
        <div>
          {genesisCapabilities.map((capability) => (
            <button key={capability.title} onClick={() => onSelectPrompt(capability.prompt)} type="button">
              <span aria-hidden="true"><GenesisIcon name={capability.icon} /></span>
              <div>
                <strong>{capability.title}</strong>
                <small>{capability.description}</small>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GenesisAttachButton({ disabled, onClick, uploading }: { disabled: boolean; onClick: () => void; uploading: boolean }) {
  return (
    <button
      aria-label={uploading ? "Sedang mengunggah dokumen" : "Unggah dokumen"}
      className="alos-genesis-attach-button"
      disabled={disabled}
      onClick={onClick}
      title="Unggah dokumen"
      type="button"
    >
      <PaperclipIcon />
    </button>
  );
}

export function GenesisKnowledgeSource() {
  return (
    <span aria-label="Sumber pengetahuan: Internal ALOS" className="alos-genesis-knowledge-source">
      <GenesisIcon name="database" />
      <span>Sumber: <strong>Internal ALOS</strong></span>
    </span>
  );
}

export function GenesisFollowUpMessage({ actorInitial, message }: { actorInitial: string; message: GenesisHistoryMessage }) {
  if (message.actor_kind === "HUMAN") {
    return (
      <div className="alos-genesis-user-message alos-genesis-followup-message">
        <span>{actorInitial}</span>
        <div>
          <div className="alos-genesis-message-meta">
            <strong>Direktur Utama</strong>
            <small>{formatDocumentDate(message.created_at)}</small>
          </div>
          <p>{message.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="alos-genesis-assistant-message alos-genesis-followup-message">
      <span aria-label="Genesis"><GenesisIcon name="sparkles" /></span>
      <div>
        <div className="alos-genesis-message-meta alos-genesis-assistant-meta">
          <strong>GENESIS</strong>
          <small>{formatDocumentDate(message.created_at)}</small>
          <em>Read-only</em>
        </div>
        <GenesisMarkdown content={message.content} />
      </div>
    </div>
  );
}

export function GenesisFollowUpFeedback({ failure, sending }: { failure: GenesisFollowUpFailure | null; sending: boolean }) {
  if (failure) {
    return (
      <p className={`alos-genesis-follow-up-error ${failure.status.toLowerCase()}`}>
        <strong>{genesisFollowUpFailureTitle(failure.status)}</strong>
        <span>{failure.error.message}</span>
      </p>
    );
  }
  if (!sending) return null;
  return (
    <div aria-live="polite" className="alos-genesis-assistant-message alos-genesis-followup-loading">
      <span aria-label="Genesis"><GenesisIcon name="sparkles" /></span>
      <div>
        <div className="alos-genesis-message-meta alos-genesis-assistant-meta">
          <strong>GENESIS</strong>
          <small>Sedang bekerja</small>
        </div>
        <p><i aria-hidden="true" />{genesisFollowUpLoadingText}</p>
      </div>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m8.7 12.8 5.8-5.8a3.2 3.2 0 0 1 4.5 4.5l-7.4 7.4a5 5 0 0 1-7.1-7.1l7.1-7.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function GenesisIcon({ name }: { name: GenesisIconName }) {
  const paths: Record<GenesisIconName, ReactNode> = {
    alert: (
      <>
        <path d="M12 3 2.8 19h18.4L12 3Z" />
        <path d="M12 9v4M12 16.5h.01" />
      </>
    ),
    bolt: <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />,
    bot: (
      <>
        <rect height="10" rx="3" width="16" x="4" y="8" />
        <path d="M9 12h.01M15 12h.01M9 16h6M12 4v4M10.5 4h3M2 12h2M20 12h2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
        <path d="M2 20h22" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    document: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 12h6M9 16h6" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
        <path d="m14 7 3 3" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6M10 22h4" />
        <path d="M8.2 15.5A7 7 0 1 1 15.8 15.5c-.8.6-.8 1.5-.8 2.5H9c0-1 0-1.9-.8-2.5Z" />
      </>
    ),
    message: (
      <>
        <path d="M4 4h16v13H9l-5 4V4Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 2c.7 5.2 2.8 7.3 8 8-5.2.7-7.3 2.8-8 8-.7-5.2-2.8-7.3-8-8 5.2-.7 7.3-2.8 8-8Z" />
        <path d="M19 17c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" className="alos-genesis-icon" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function GenesisMarkdown({ content }: { content: string }) {
  const lines = normaliseGenesisMarkdown(content).split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = renderGenesisInline(heading[2]);
      blocks.push(level === 1 ? <h3 key={`heading-${index}`}>{text}</h3> : level === 2 ? <h4 key={`heading-${index}`}>{text}</h4> : <h5 key={`heading-${index}`}>{text}</h5>);
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(<aside key={`quote-${index}`}>{renderGenesisInline(quote.join(" "))}</aside>);
      continue;
    }

    const checklist = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (checklist) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim().match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
        if (!candidate) break;
        items.push(candidate[2]);
        index += 1;
      }
      blocks.push(
        <ul aria-label="Rekomendasi Genesis" className="alos-genesis-markdown-checklist" key={`checklist-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>
              <i aria-hidden="true">•</i>
              <span>{renderGenesisInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderGenesisInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`ordered-list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderGenesisInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index].trim();
      if (!candidate || /^(#{1,3})\s+/.test(candidate) || candidate.startsWith(">") || /^[-*]\s+/.test(candidate) || /^\d+\.\s+/.test(candidate)) break;
      paragraph.push(candidate);
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`}>{renderGenesisInline(paragraph.join(" "))}</p>);
  }

  return (
    <article className="alos-genesis-semantic-answer">
      <strong>Jawaban DRAFT Genesis</strong>
      <div className="alos-genesis-markdown">{blocks}</div>
      <small>Hanya berdasarkan versi sumber di atas. Periksa sitasi sebelum mengambil keputusan.</small>
    </article>
  );
}

function normaliseGenesisMarkdown(value: string): string {
  return value
    .replace(/\\([#*_\[\]])/g, "$1")
    .replace(/\r\n/g, "\n")
    .trim();
}

function renderGenesisInline(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[Sumber L\d+(?:-L?\d+)?\])/g);
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>;
    if (/^\[Sumber L\d+(?:-L?\d+)?\]$/.test(token)) return <mark className="alos-genesis-citation" key={`${token}-${index}`}>{token}</mark>;
    return <span key={`${token}-${index}`}>{token}</span>;
  });
}
