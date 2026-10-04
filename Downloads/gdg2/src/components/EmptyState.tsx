import { motion } from "framer-motion";
import { FileUp, FolderOpen } from "lucide-react";
import { Link } from "wouter";

export function EmptyState({ title = "Nothing here yet", description = "Files you upload will appear here.", action = true }: { title?: string; description?: string; action?: boolean }) {
  return (
    <motion.div className="empty-state" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <span className="empty-icon"><FolderOpen size={24} strokeWidth={1.6} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action && <Link href="/upload" className="text-action"><FileUp size={15} /> Upload a file</Link>}
    </motion.div>
  );
}

export function LoadingPanel({ rows = 3 }: { rows?: number }) {
  return <div className="loading-panel" aria-label="Loading" aria-busy="true">
    {Array.from({ length: rows }, (_, index) => <div className="skeleton-row" key={index}>
      <span className="skeleton skeleton-icon" /><span className="skeleton skeleton-line" /><span className="skeleton skeleton-short" />
    </div>)}
  </div>;
}

export function PageSpinner() {
  return <div className="page-spinner"><span className="spinner-ring" /><span>Opening your workspace…</span></div>;
}
