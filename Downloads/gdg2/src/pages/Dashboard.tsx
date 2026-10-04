import { motion } from "framer-motion";
import { ArrowRight, Clock3, FileStack, HardDrive, Search, UploadCloud } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState, LoadingPanel } from "@/components/EmptyState";
import { FileList } from "@/components/FileList";
import { useFiles } from "@/hooks/useFiles";
import { formatBytes } from "@/services/files";

function todayLabel() { return new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" }).format(new Date()); }

export function DashboardPage() {
  const { displayName } = useAuth();
  const { files, loading, error } = useFiles();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const totalBytes = files.reduce((sum, file) => sum + Number(file.file_size), 0);
  const recentCount = files.filter(file => Date.now() - new Date(file.uploaded_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const stats = [
    { label: "TOTAL FILES", value: loading ? "—" : String(files.length), caption: "Personal uploads", icon: FileStack, color: "stat-icon-green" },
    { label: "STORAGE USED", value: loading ? "—" : formatBytes(totalBytes), caption: "Across your files", icon: HardDrive, color: "stat-icon-blue" },
    { label: "RECENT UPLOADS", value: loading ? "—" : String(recentCount), caption: "In the last 7 days", icon: Clock3, color: "stat-icon-amber" },
  ];
  function openSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLocation(`/files${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`); }

  return <div className="page-content">
    <motion.div className="page-heading-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div><span className="page-kicker">{todayLabel()}</span><h1>Welcome back, <em>{displayName}</em></h1><p>Your files, ready when you are.</p></div><Link href="/upload" className="button button-primary"><UploadCloud size={16} /> Upload files</Link></motion.div>
    {error && <div className="inline-error" role="alert">Couldn’t load your files. Check the Supabase schema and RLS policies, then refresh.</div>}
    <section className="stats-grid" aria-label="Your file statistics">{stats.map((stat, index) => <motion.article className="stat-card" key={stat.label} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: index * .07 }}><span className={`stat-icon ${stat.color}`}><stat.icon size={18} /></span><div><small>{stat.label}</small><strong>{stat.value}</strong><span>{stat.caption}</span></div></motion.article>)}</section>
    <form className="dashboard-search" onSubmit={openSearch}><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your files by filename" aria-label="Search your files by filename" /><button className="button button-secondary button-small" type="submit">Search</button></form>
    <section className="workspace-panel recent-panel"><div className="panel-heading"><div><span className="panel-kicker">YOUR LIBRARY</span><h2>Recent files</h2></div><Link href="/files" className="quiet-link">View all <ArrowRight size={15} /></Link></div>{loading ? <LoadingPanel rows={4} /> : files.length ? <FileList files={files} compact /> : <EmptyState />}</section>
    <section className="dashboard-callout"><span className="dashboard-callout-icon"><UploadCloud size={20} /></span><div><strong>Have something to keep?</strong><p>Add a note, deck or project file to your personal library.</p></div><Link href="/upload" className="button button-secondary">Upload a file <ArrowRight size={15} /></Link></section>
  </div>;
}
