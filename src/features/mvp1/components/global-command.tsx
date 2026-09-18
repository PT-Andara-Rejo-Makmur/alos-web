"use client";

import { useEffect, useRef, useState } from "react";

import { apiRequest, withQuery } from "@/lib/api";
import { type Notification } from "@/features/mvp1/lib/operational";

export function NotificationCenter() {
  const centerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadNotifications() {
      setLoading(true);
      setLoadFailed(false);
      try {
        setNotifications(await apiRequest<Notification[]>(
          withQuery("/api/v1/notifications", { unread_only: false }),
          { signal: controller.signal },
        ));
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadNotifications();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setNotificationsOpen(false);
    }
    function closeOnOutsideClick(event: PointerEvent) {
      if (
        notificationsOpen &&
        event.target instanceof Node &&
        !centerRef.current?.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [notificationsOpen]);

  async function markRead(item: Notification) {
    if (item.read_at) return;
    try {
      const updated = await apiRequest<Notification>(
        `/api/v1/notifications/${item.notification_id}/read`,
        { method: "POST" },
      );
      setNotifications((current) => current.map((entry) =>
        entry.notification_id === updated.notification_id ? updated : entry
      ));
    } catch {
      // Keep the item unread so the user can retry without losing it.
    }
  }

  const unread = notifications.filter((item) => !item.read_at).length;
  return (
    <div className="alos-notification-center" ref={centerRef}>
      <button
        aria-expanded={notificationsOpen}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        className="alos-notifications"
        onClick={() => setNotificationsOpen((current) => !current)}
        title="Notifikasi"
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unread > 0 ? <strong>{unread > 99 ? "99+" : unread}</strong> : null}
      </button>
      {notificationsOpen ? (
        <div aria-label="Daftar notifikasi" className="alos-notification-panel" role="dialog">
          <header><strong>Notifikasi</strong><small>{unread} belum dibaca</small></header>
          {loading ? <p>Memuat notifikasi…</p> : null}
          {loadFailed ? <p>Notifikasi belum dapat dimuat. Tutup lalu coba lagi.</p> : null}
          {!loading && !loadFailed ? notifications.map((item) => (
            <button
              className={item.read_at ? "read" : ""}
              key={item.notification_id}
              onClick={() => void markRead(item)}
              type="button"
            >
              <strong>{item.title}</strong>
              <span>{item.body}</span>
              <small>{formatNotificationTime(item.created_at)}</small>
            </button>
          )) : null}
          {!loading && !loadFailed && notifications.length === 0
            ? <p>Belum ada notifikasi.</p>
            : null}
        </div>
      ) : null}
    </div>
  );
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}



