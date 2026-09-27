import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./button";
import styles from "./ui.module.css";

export interface PaginationProps {
  readonly ariaLabel?: string;
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly totalPages: number;
}

export function Pagination({
  ariaLabel = "Paginasi",
  currentPage,
  onPageChange,
  totalPages,
}: PaginationProps) {
  const pages = pageItems(Math.max(1, currentPage), Math.max(1, totalPages));
  const page = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  return (
    <nav aria-label={ariaLabel} className={styles.pagination}>
      <Button
        aria-label="Sebelumnya"
        disabled={page <= 1}
        iconBefore={<ChevronLeft aria-hidden="true" size={16} strokeWidth={1.9} />}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        variant="secondary"
      >
        Sebelumnya
      </Button>
      <div className={styles.pageList}>
        {pages.map((item, index) => item === "ellipsis" ? (
          <span aria-hidden="true" className={styles.pageEllipsis} key={`ellipsis-${index}`}>…</span>
        ) : (
          <button
            aria-current={item === page ? "page" : undefined}
            aria-label={`Halaman ${item}`}
            className={[styles.pageButton, item === page ? styles.pageButtonCurrent : ""].filter(Boolean).join(" ")}
            key={item}
            onClick={() => onPageChange(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <Button
        aria-label="Berikutnya"
        disabled={page >= totalPages}
        iconAfter={<ChevronRight aria-hidden="true" size={16} strokeWidth={1.9} />}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        variant="secondary"
      >
        Berikutnya
      </Button>
    </nav>
  );
}

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: Array<number | "ellipsis"> = [1];
  if (current > 3) items.push("ellipsis");
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) items.push(page);
  if (current < total - 2) items.push("ellipsis");
  items.push(total);
  return items;
}
