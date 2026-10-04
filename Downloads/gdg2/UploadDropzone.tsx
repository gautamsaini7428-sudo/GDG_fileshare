import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileUp, LoaderCircle, UploadCloud, XCircle } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ALLOWED_EXTENSIONS, fileExtension, formatBytes, uploadFile, validateFile } from "@/services/files";

interface UploadItem { id: string; name: string; type: string; size: number; progress: number; status: "uploading" | "success" | "error"; message?: string; }

export function UploadDropzone() {
  const { user, configured } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);

  function update(id: string, patch: Partial<UploadItem>) { setItems(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); }

  async function processFiles(selected: File[]) {
    if (!configured) { toast.error("Supabase is not configured yet."); return; }
    if (!user) { toast.error("Please log in before uploading."); return; }
    const valid: File[] = [];
    for (const file of selected) {
      const error = validateFile(file);
      if (error) toast.error(`${file.name}: ${error}`);
      else valid.push(file);
    }
    if (!valid.length) return;
    setBusy(true);
    for (const file of valid) {
      const id = crypto.randomUUID();
      setItems(current => [{ id, name: file.name, type: fileExtension(file.name).toUpperCase(), size: file.size, progress: 2, status: "uploading" as const }, ...current].slice(0, 8));
      try {
        await uploadFile(user, file, progress => update(id, { progress }));
        update(id, { progress: 100, status: "success" });
        toast.success("File uploaded successfully.");
        await queryClient.invalidateQueries({ queryKey: ["usar-files", user.id] });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
        update(id, { status: "error", message });
        toast.error(message.includes("authorized") ? "You are not authorized to access this file." : `Upload failed: ${message}`);
      }
    }
    setBusy(false);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files ?? []); void processFiles(files); event.target.value = ""; }
  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); void processFiles(Array.from(event.dataTransfer.files ?? [])); }

  return <div className="upload-block">
    <div className={`upload-dropzone ${dragging ? "upload-dropzone-active" : ""} ${busy ? "upload-dropzone-busy" : ""}`} onDragEnter={event => { event.preventDefault(); setDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={onDrop} onClick={() => !busy && inputRef.current?.click()} role="button" tabIndex={busy ? -1 : 0} aria-label="Choose or drop files to upload" onKeyDown={event => { if ((event.key === "Enter" || event.key === " ") && !busy) { event.preventDefault(); inputRef.current?.click(); } }}>
      <input ref={inputRef} className="sr-only" type="file" multiple accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(",")} onChange={onChange} disabled={busy} />
      <motion.span className="upload-icon-wrap" animate={dragging ? { scale: 1.06, y: -3 } : { scale: 1, y: 0 }}><UploadCloud size={26} strokeWidth={1.7} /></motion.span>
      <strong>{dragging ? "Drop your files here" : "Drag & Drop your files here"}</strong><span className="upload-or">or</span><button className="button button-primary button-small" type="button" disabled={busy} onClick={event => { event.stopPropagation(); inputRef.current?.click(); }}><FileUp size={15} /> Browse Files</button><small>PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, PNG, JPG, ZIP, TXT · Up to 25 MB each</small>
    </div>
    <AnimatePresence initial={false}>{items.length > 0 && <motion.div className="upload-queue" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{items.map(item => <motion.div className="upload-queue-row" key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span className="upload-queue-icon">{item.status === "success" ? <CheckCircle2 size={18} /> : item.status === "error" ? <XCircle size={18} /> : <LoaderCircle size={18} className="subtle-spin" />}</span><span className="upload-queue-copy"><strong title={item.name}>{item.name}</strong><small>{item.status === "error" ? item.message : `${item.type} · ${formatBytes(item.size)} · ${item.status === "success" ? "Uploaded" : "Uploading"}`}</small><span className="progress-track"><motion.span className={`progress-fill ${item.status === "error" ? "progress-error" : ""}`} animate={{ width: `${item.progress}%` }} transition={{ duration: 0.25 }} /></span></span><span className="upload-percent">{item.status === "success" ? "Done" : item.status === "error" ? "Failed" : `${item.progress}%`}</span></motion.div>)}</motion.div>}</AnimatePresence>
  </div>;
}
