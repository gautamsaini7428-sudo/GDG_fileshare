import { motion } from "framer-motion";
import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { UploadDropzone } from "@/components/UploadDropzone";

const accepted = ["PDF", "DOC", "DOCX", "PPT", "PPTX", "XLS", "XLSX", "PNG", "JPG", "ZIP", "TXT"];

export function UploadPage() {
  return <div className="page-content">
    <div className="page-heading-row"><div><span className="page-kicker">ADD TO YOUR LIBRARY</span><h1>Upload files</h1><p>Bring the course material you want to keep close.</p></div><Link href="/files" className="quiet-link">Back to My Files</Link></div>
    <motion.section className="workspace-panel upload-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="panel-heading"><div><span className="panel-kicker">YOUR PRIVATE SPACE</span><h2>Choose what to bring in</h2><p>One file at a time is fine. You can also select a few and add them together.</p></div><span className="private-badge"><LockKeyhole size={13} /> Private</span></div>
      <UploadDropzone />
      <div className="upload-details"><div className="upload-detail-heading"><ShieldCheck size={17} /><strong>A few helpful details</strong></div><ul>{[
        "Files up to 25 MB each are accepted.",
        "Supported formats: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG/JPG, ZIP and TXT.",
        "Files are stored in a private bucket and checked against your account’s access policy.",
        "Delete removes the stored object and its library record.",
      ].map(text => <li key={text}><Check size={14} /><span>{text}</span></li>)}</ul><div className="accepted-types">{accepted.map(item => <span key={item}>{item}</span>)}</div></div>
    </motion.section>
    <p className="upload-note"><LockKeyhole size={14} /> Uploads are available only after you sign in.</p>
  </div>;
}
