import { Link } from "wouter";
import { FileText } from "lucide-react";

export function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className={`brand-lockup ${light ? "brand-light" : ""}`} aria-label="My FileShare home">
      <span className="brand-mark" aria-hidden="true">
        <FileText size={21} strokeWidth={1.8} />
        <span className="brand-mark-dot" />
      </span>
      {!compact && <span className="brand-copy">
        <strong>My <span>FileShare</span></strong>
        <small>Your personal file library</small>
      </span>}
    </Link>
  );
}
