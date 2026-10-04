import { AnimatePresence, motion } from "framer-motion";
import { Archive, Download, File, FileImage, FileSpreadsheet, FileText, Presentation, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { deleteFile, downloadFile, type FileRecord, formatBytes } from "@/services/files";
import { EmptyState } from "@/components/EmptyState";

function IconForFile({ type }: { type: string }) {
  const ext = type.toLowerCase();
  const icon = ["png", "jpg", "jpeg"].includes(ext) ? FileImage
    : ["xls", "xlsx"].includes(ext) ? FileSpreadsheet
    : ["ppt", "pptx"].includes(ext) ? Presentation
    : ext === "zip" ? Archive
    : ["pdf", "doc", "docx", "txt"].includes(ext) ? FileText : File;
  const Icon = icon;
  return <span className={`file-icon file-icon-${ext}`}><Icon size={18} strokeWidth={1.7} /></span>;
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function Actions({ file, onDelete }: { file: FileRecord; onDelete: (file: FileRecord) => void }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  async function handleDownload() {
    if (!user) return;
    setBusy(true);
    try { await downloadFile(user, file); toast.success("Download started."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Download failed."); }
    finally { setBusy(false); }
  }
  return <div className="file-actions">
    <button type="button" className="row-action" title="Download file" aria-label={`Download ${file.file_name}`} disabled={busy} onClick={handleDownload}><Download size={16} /><span>Download</span></button>
    <button type="button" className="row-action row-action-danger" title="Delete file" aria-label={`Delete ${file.file_name}`} onClick={() => onDelete(file)}><Trash2 size={16} /><span>Delete</span></button>
  </div>;
}

export function FileList({ files, compact = false, loading = false }: { files: FileRecord[]; compact?: boolean; loading?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<FileRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pending || !user) return;
    setDeleting(true);
    try {
      await deleteFile(user, pending);
      toast.success("File deleted successfully.");
      setPending(null);
      await queryClient.invalidateQueries({ queryKey: ["usar-files", user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally { setDeleting(false); }
  }

  if (loading) return <div className="loading-panel" aria-busy="true">{[0, 1, 2].map(item => <div className="skeleton-row" key={item}><span className="skeleton skeleton-icon" /><span className="skeleton skeleton-line" /><span className="skeleton skeleton-short" /></div>)}</div>;
  if (!files.length) return <EmptyState title={compact ? "Your library is ready" : "No files match your search"} description={compact ? "Upload a course file to start building your personal library." : "Try a different search or filter, or upload a file to get started."} action={compact} />;

  const visibleFiles = compact ? files.slice(0, 5) : files;
  return <>
    <div className={`file-table-wrap ${compact ? "file-table-compact" : ""}`}>
      <table className="file-table">
        <thead><tr><th>FILE</th><th>TYPE</th><th>SIZE</th><th>UPLOADED</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>
          <AnimatePresence initial={false}>
            {visibleFiles.map(file => <motion.tr key={file.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12, height: 0 }} transition={{ duration: 0.24 }}>
              <td><div className="file-name-cell"><IconForFile type={file.file_type} /><span className="file-name-text" title={file.file_name}>{file.file_name}</span></div></td>
              <td><span className="type-pill">{file.file_type}</span></td>
              <td className="muted-cell">{formatBytes(Number(file.file_size))}</td>
              <td className="muted-cell">{dateLabel(file.uploaded_at)}</td>
              <td><Actions file={file} onDelete={setPending} /></td>
            </motion.tr>)}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
    <div className="mobile-file-list">
      <AnimatePresence initial={false}>{visibleFiles.map(file => <motion.article className="mobile-file-card" key={file.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}>
        <div className="mobile-file-main"><IconForFile type={file.file_type} /><div className="mobile-file-text"><strong title={file.file_name}>{file.file_name}</strong><span>{file.file_type} · {formatBytes(Number(file.file_size))} · {dateLabel(file.uploaded_at)}</span></div></div>
        <Actions file={file} onDelete={setPending} />
      </motion.article>)}</AnimatePresence>
    </div>
    <AnimatePresence>{pending && <motion.div className="modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget && !deleting) setPending(null); }}>
      <motion.div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}>
        <button className="modal-close icon-button" type="button" aria-label="Close" disabled={deleting} onClick={() => setPending(null)}><X size={18} /></button>
        <span className="modal-warning"><Trash2 size={19} /></span>
        <h2 id="delete-title">Delete this file?</h2>
        <p>Are you sure you want to delete this file? <strong>{pending.file_name}</strong> will be removed from your private library.</p>
        <div className="modal-actions"><button type="button" className="button button-secondary" disabled={deleting} onClick={() => setPending(null)}>Cancel</button><button type="button" className="button button-danger" disabled={deleting} onClick={confirmDelete}>{deleting ? "Deleting…" : "Delete"}</button></div>
      </motion.div>
    </motion.div>}</AnimatePresence>
  </>;
}
