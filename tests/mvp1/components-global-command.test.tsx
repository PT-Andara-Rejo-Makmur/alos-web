import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NotificationCenter } from "@/features/mvp1/components/global-command";

describe("NotificationCenter", () => {
  it("renders an accessible bell without the removed global search", () => {
    const html = renderToStaticMarkup(<NotificationCenter />);

    expect(html).toContain('aria-label="Notifikasi"');
    expect(html).toContain("<svg");
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain("Cari proyek");
  });
});


