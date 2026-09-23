import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NotificationCenter } from "@/features/notifications/notification-center";

describe("NotificationCenter", () => {
  it("renders an accessible bell without the removed global search", () => {
    const html = renderToStaticMarkup(<NotificationCenter />);

    expect(html).toContain('aria-label="Notifikasi"');
    expect(html).toContain("<svg");
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain("Cari proyek");
  });
});
