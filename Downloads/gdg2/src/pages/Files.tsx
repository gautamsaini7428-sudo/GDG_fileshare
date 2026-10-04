import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, UploadCloud, X } from "lucide-react";
import { Link } from "wouter";
import { FileList } from "@/components/FileList";
import { useFiles } from "@/hooks/useFiles";
import { useAuth } from "@/contexts/AuthContext";

export function FilesPage() {
  const { files, loading, error } = useFiles();
  const { configured } = useAuth();
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("search") ?? "");
  const [type, setType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const types = useMemo(() => Array.from(new Set(files.map(file => file.file_type))).sort(), [files]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const result = files.filter(file => {
      const matchesName = !needle || file.file_name.toLocaleLowerCase().includes(needle);
      const matchesType = type === "all" || file.file_type === type;
      const date = new Date(file.uploaded_at);
      const age = Date.now() - date.getTime();
      const matchesDate = dateRange === "all" || (dateRange === "7" && age <= 7 * 86400000) || (dateRange === "30" && age <= 30 * 86400000) || (dateRange === "year" && date.getFullYear() === new Date().getFullYear());
      return matchesName && matchesType && matchesDate;
    });
    return result.sort((a, b) => {
      if (sort === "oldest") return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      if (sort === "name-asc") return a.file_name.localeCompare(b.file_name);
      if (sort === "name-desc") return b.file_name.localeCompare(a.file_name);
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    });
  }, [dateRange, files, search, sort, type]);

  return <div className="page-content">
    <div className="page-heading-row"><div><span className="page-kicker">YOUR PERSONAL LIBRARY</span><h1>My Files</h1><p>Search, filter and manage the files in your space.</p></div><Link href="/upload" className="button button-primary"><UploadCloud size={16} /> Upload files</Link></div>
    {error && <div className="inline-error" role="alert">Couldn’t load your files. Check the Supabase schema and RLS policies, then refresh.</div>}
    <section className="workspace-panel files-panel">
      <div className="files-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by filename" aria-label="Search files by filename" />{search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="filter-label"><SlidersHorizontal size={15} /><span>Filter by</span></div>
        <select aria-label="Filter by file type" value={type} onChange={event => setType(event.target.value)}><option value="all">All types</option>{types.map(value => <option value={value} key={value}>{value}</option>)}</select>
        <select aria-label="Filter by upload date" value={dateRange} onChange={event => setDateRange(event.target.value)}><option value="all">Any date</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="year">This year</option></select>
        <select aria-label="Sort files" value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select>
      </div>
      <div className="files-result-line"><span>{loading ? "Loading files…" : `${filtered.length} ${filtered.length === 1 ? "file" : "files"}`}{search ? ` matching “${search}”` : ""}</span><span>Private to your account</span></div>
      {!configured ? <div className="inline-error">Connect Supabase in the secure project settings to load your files.</div> : <FileList files={filtered} loading={loading} />}
    </section>
  </div>;
}
