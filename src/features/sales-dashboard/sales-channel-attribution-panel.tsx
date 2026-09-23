import type { SalesChannelAttributionItem } from "./types";
import styles from "./sales-dashboard.module.css";

const CHANNEL_SKELETON_WIDTHS: readonly string[] = ["85%", "60%", "45%", "30%"];

export function SalesChannelAttributionPanel({
  channels,
}: {
  readonly channels: readonly SalesChannelAttributionItem[];
}) {
  return (
    <article aria-label="Atribusi Kanal Pemasaran" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Marketing Attribution</span>
        <h2 className={styles.panelTitle}>Kanal Pemasaran Terbanyak</h2>
        <p className={styles.panelSubtitle}>
          Atribusi volume prospek &amp; kualitas lead per kanal
        </p>
      </header>

      <div className={styles.attributionList}>
        {channels.map((channel, idx) => (
          <div className={styles.attributionRow} key={channel.channelId}>
            <div className={styles.attributionRowHeader}>
              <span className={styles.attributionChannelName}>{channel.channelName}</span>
              <span className={styles.attributionValue}>
                {channel.leadShare !== null ? `${channel.leadShare}%` : "—"}
              </span>
            </div>
            <div className={styles.funnelBarContainer}>
              <div
                className={styles.funnelBarSkeleton}
                style={{ width: CHANNEL_SKELETON_WIDTHS[idx % CHANNEL_SKELETON_WIDTHS.length] }}
              />
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.panelFootnote}>
        * Engine atribusi (ALOS-AGT-005) belum terhubung ke database ads.
      </footer>
    </article>
  );
}
