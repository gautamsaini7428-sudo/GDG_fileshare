import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Files, LayoutDashboard, LogOut, Menu, UploadCloud, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Brand } from "@/components/Brand";
import { toast } from "sonner";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/files", label: "My Files", icon: Files },
  { href: "/upload", label: "Upload", icon: UploadCloud },
];

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "S"; }

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { displayName, user, signOut } = useAuth();
  const active = (href: string) => location === href || (href === "/files" && location.startsWith("/files"));
  async function handleLogout() {
    try { await signOut(); toast.success("You’ve been signed out."); setLocation("/"); }
    catch { toast.error("Sign out failed. Please try again."); }
  }
  const navContent = <><div className="sidebar-brand"><Brand compact /></div><div className="sidebar-label">YOUR WORKSPACE</div><nav className="side-nav" aria-label="Main navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`side-link ${active(href) ? "side-link-active" : ""}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{href === "/upload" && <ArrowUpRight className="side-link-arrow" size={14} />}</Link>)}</nav><div className="sidebar-spacer" /><div className="sidebar-note"><span className="privacy-dot" /><div><strong>Private by design</strong><small>Your files belong to you.</small></div></div><button type="button" className="side-link logout-link" onClick={handleLogout}><LogOut size={18} strokeWidth={1.8} /><span>Sign out</span></button></>;

  return <div className="app-frame">
    <aside className="desktop-sidebar">{navContent}</aside>
    <div className="app-main-column">
      <header className="app-topbar"><button className="icon-button mobile-menu-trigger" type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button><div className="topbar-context"><span className="topbar-kicker">GGSIPU · USAR</span><span className="topbar-current">{links.find(item => active(item.href))?.label ?? "Workspace"}</span></div><div className="profile-chip" title={user?.email ?? displayName}><span className="avatar-mark">{initials(displayName)}</span><span className="profile-name">{displayName}</span></div></header>
      <AnimatePresence>{mobileOpen && <><motion.button className="mobile-scrim" aria-label="Close navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} /><motion.aside className="mobile-sidebar" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.22, ease: "easeOut" }}><button className="mobile-close icon-button" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={19} /></button>{navContent}</motion.aside></>}</AnimatePresence>
      <AnimatePresence mode="wait"><motion.main className="workspace-content" key={location} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>{children}</motion.main></AnimatePresence>
      <footer className="app-footer"><span>USAR FileShare</span><span>GGSIPU · University School of Automation & Robotics</span></footer>
    </div>
  </div>;
}
