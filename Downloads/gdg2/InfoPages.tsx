import { ArrowLeft, ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";

function InfoLayout({ children }: { children: ReactNode }) {
  return <div className="info-page"><header className="info-nav"><Brand /><Link href="/" className="quiet-link"><ArrowLeft size={15} /> Back home</Link></header><main className="info-content">{children}</main><footer className="info-footer"><span>USAR FileShare · GGSIPU</span><Link href="/privacy">Privacy</Link></footer></div>;
}

export function AboutPage() {
  return <InfoLayout><span className="section-kicker">ABOUT FILESHARE</span><h1>A simpler home for your USAR course files.</h1><p className="info-lead">USAR FileShare is designed for GGSIPU University School of Automation and Robotics students who want one clear place to keep the files that help them learn and build.</p><div className="info-card"><span className="feature-icon"><LockKeyhole size={19} /></span><h2>A focused tool, not another feed</h2><p>Upload course notes, presentations and project documents; search by filename, narrow by type or date, then download or remove a file when you choose.</p></div><p>FileShare is an independent student file portal and is not an official GGSIPU admissions or academic-record system. For university information, visit <a href="https://www.ipu.ac.in/usar/" target="_blank" rel="noreferrer">the official USAR site <ArrowUpRight size={13} /></a>.</p><Link href="/register" className="button button-primary">Create your account</Link></InfoLayout>;
}

export function PrivacyPage() {
  return <InfoLayout><span className="section-kicker">PRIVACY NOTES</span><h1>Your files stay behind your sign-in.</h1><p className="info-lead">This page describes the current FileShare design. It is not a substitute for the terms or privacy policy of the service providers that operate the application.</p>
    <div className="privacy-list"><article><span><LockKeyhole size={18} /></span><div><h2>Account access</h2><p>Sign-in is handled by Supabase Auth. File records are queried for the signed-in account, and database Row Level Security is intended to enforce the same owner boundary on the server.</p></div></article><article><span><ShieldCheck size={18} /></span><div><h2>Private file storage</h2><p>Uploaded objects are kept in a non-public Storage bucket. Downloads are requested with your authenticated session, not exposed as permanent public links.</p></div></article><article><span><ArrowLeft size={18} /></span><div><h2>Your controls</h2><p>You can download or delete files from your library. Deletion removes the stored object and the associated metadata record when the configured policies allow it.</p></div></article><article><span><ArrowUpRight size={18} /></span><div><h2>What this service is not</h2><p>Do not upload sensitive, regulated or official records. The service has no promise of archival retention, backup or university endorsement.</p></div></article></div>
    <p className="privacy-footnote">The live database schema and RLS policies must be applied to the selected Supabase project before authentication and file actions can work.</p><Link href="/" className="button button-secondary">Back to FileShare</Link>
  </InfoLayout>;
}
