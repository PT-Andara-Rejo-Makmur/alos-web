import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  EvidenceItemView,
  EvidenceListView,
  projectEvidenceRef,
  sanitizeCitationLocator,
  sanitizeExcerpt,
} from "@/features/evidence";
import type { EvidenceRef } from "@/lib/contracts";

afterEach(cleanup);

describe("Source & Evidence UX", () => {
  it("membedakan sumber INTERNAL dan EXTERNAL secara visual", () => {
    const internalRef: EvidenceRef = {
      evidence_id: "evi_int_01",
      source_id: "INTERNAL_POLICY_DOC",
      uri: "https://intranet.andara.com/policy/sop-1",
      captured_at: "2026-09-19T08:00:00Z",
      content_hash: "hash_int_1",
      source_type: "INTERNAL",
      data_classification: "CONFIDENTIAL",
      freshness: "CURRENT",
      validation_status: "VALID",
      reliability: "HIGH",
      content_trust: "GOVERNED",
      anchor: "Pasal 3 Ayat 1",
      excerpt: "Kebijakan resmi operasional.",
    };

    const externalRef: EvidenceRef = {
      evidence_id: "evi_ext_02",
      source_id: "EXTERNAL_MARKET_ARTICLE",
      uri: "https://market-news.test/article/real-estate-trends",
      captured_at: "2026-09-19T08:30:00Z",
      content_hash: "hash_ext_2",
      source_type: "EXTERNAL",
      data_classification: "PUBLIC",
      freshness: "STALE",
      validation_status: "PENDING",
      reliability: "MEDIUM",
      content_trust: "UNTRUSTED",
      anchor: "Paragraf 4",
      excerpt: "Tren pertumbuhan properti Q3.",
    };

    const { rerender } = render(
      <EvidenceItemView item={projectEvidenceRef(internalRef)} />,
    );

    expect(screen.getByText("INTERNAL (Tergovernansi)")).toBeInTheDocument();
    expect(screen.getByText("CONFIDENTIAL")).toBeInTheDocument();
    expect(screen.getByText("Freshness: CURRENT")).toBeInTheDocument();
    expect(screen.getByText("Status: VALID")).toBeInTheDocument();
    expect(screen.getByText(/GOVERNED/)).toBeInTheDocument();

    rerender(<EvidenceItemView item={projectEvidenceRef(externalRef)} />);

    expect(screen.getByText("EXTERNAL (Untrusted Input)")).toBeInTheDocument();
    expect(screen.getByText("PUBLIC")).toBeInTheDocument();
    expect(screen.getByText("Freshness: STALE")).toBeInTheDocument();
    expect(screen.getByText("Status: PENDING")).toBeInTheDocument();
    expect(screen.getByText(/UNTRUSTED/)).toBeInTheDocument();
  });

  it("merender EvidenceListView dengan ringkasan statistik dan honest empty state", () => {
    const { rerender } = render(<EvidenceListView evidenceRefs={[]} />);

    expect(
      screen.getByText(
        "Belum ada evidence atau rujukan yang diterbitkan oleh ALOS Backend untuk konteks ini.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Total: 0")).toBeInTheDocument();

    const refs: EvidenceRef[] = [
      {
        evidence_id: "evi_1",
        source_id: "SRC_INT_1",
        uri: "https://example.com/1",
        captured_at: "2026-09-19T00:00:00Z",
        content_hash: "h1",
        source_type: "INTERNAL",
      },
      {
        evidence_id: "evi_2",
        source_id: "SRC_EXT_2",
        uri: "https://example.com/2",
        captured_at: "2026-09-19T00:00:00Z",
        content_hash: "h2",
        source_type: "EXTERNAL",
      },
    ];

    rerender(<EvidenceListView evidenceRefs={refs} />);

    expect(screen.getByText("Total: 2")).toBeInTheDocument();
    expect(screen.getByText("Internal: 1")).toBeInTheDocument();
    expect(screen.getByText("Eksternal: 1")).toBeInTheDocument();
    expect(screen.getByText("Unknown: 0")).toBeInTheDocument();
    expect(screen.getAllByTestId("evidence-item")).toHaveLength(2);
  });

  it("tidak mengarang provenance ketika metadata Backend tidak tersedia", () => {
    const item = projectEvidenceRef({
      evidence_id: "evi_unknown_01",
      source_id: "SOURCE_WITHOUT_PROVENANCE",
      uri: "reference-01",
      captured_at: "2026-09-19T00:00:00Z",
      content_hash: "hash_unknown",
    });

    expect(item.sourceType).toBe("UNKNOWN");
    expect(item.dataClassification).toBe("UNKNOWN");
    expect(item.validationStatus).toBe("UNKNOWN");
    expect(item.contentTrust).toBe("UNKNOWN");

    render(<EvidenceItemView item={item} />);
    expect(
      screen.getByText("SOURCE UNKNOWN (Metadata tidak tersedia)"),
    ).toBeInTheDocument();
  });

  it("menyaring metadata sensitif, token, dan stack trace dari excerpt", () => {
    const sensitiveExcerpt =
      "Dokumen diverifikasi dengan bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz dan password='supersecret'. Traceback (most recent call last): at Object.<anonymous> (/var/app/server.js:42:15). Laporan kuartal stabil.";

    const clean = sanitizeExcerpt(sensitiveExcerpt);

    expect(clean).not.toContain("eyJhbGci");
    expect(clean).not.toContain("supersecret");
    expect(clean).not.toContain("Traceback");
    expect(clean).not.toContain("/var/app/server.js");
    expect(clean).toContain("[TERLINDUNGI]");
    expect(clean).toContain("Laporan kuartal stabil.");
  });

  it("menyaring raw private URL dan credential dari citation locator", () => {
    const privateBackendUrl =
      "http://alos-backend:8000/internal/v1/vault/documents/secret.pdf";
    const cleanBackend = sanitizeCitationLocator(privateBackendUrl);
    expect(cleanBackend).toBe("Rujukan Terproteksi (Internal Backend)");
    expect(cleanBackend).not.toContain("alos-backend");
    expect(cleanBackend).not.toContain("secret.pdf");

    const urlWithToken = "https://external-api.test/data?token=secret123&page=1";
    const cleanUrl = sanitizeCitationLocator(urlWithToken);
    expect(cleanUrl).not.toContain("secret123");
    expect(cleanUrl).toContain("REDACTED");
    expect(cleanUrl).toContain("page=1");
  });
});
