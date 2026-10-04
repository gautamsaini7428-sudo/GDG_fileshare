import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, CloudUpload, FileSearch2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: LockKeyhole, title: "Secure Storage", body: "Keep your academic files safely stored in a private, account-only library." },
  { icon: CloudUpload, title: "Easy Upload", body: "Upload your files quickly and conveniently, with clear progress and helpful status." },
  { icon: FileSearch2, title: "Personal File Management", body: "View, search, download and delete the files that belong to your account." },
  { icon: ShieldCheck, title: "Access Control", body: "Users can only access files belonging to them, enforced by database and storage policies." },
];

export default function Home() {
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const primaryHref = user ? "/dashboard" : "/register";
  return <div className="marketing-page">
    <header className="marketing-nav"><div className="marketing-nav-inner"><Brand />
      <nav className="marketing-links" aria-label="Main navigation"><a href="#features">Why FileShare</a><a href="#how-it-works">How it works</a><Link href="/about">About</Link></nav>
      <div className="nav-actions"><Link className="nav-login" href={user ? "/dashboard" : "/login"}>{user ? "My workspace" : "Login"}</Link><Link className="button button-primary nav-cta" href={primaryHref}>{user ? "Open workspace" : "Get Started"}<ArrowUpRight size={15} /></Link></div>
    </div></header>
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <motion.div className="eyebrow-pill" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}><span className="eyebrow-dot" /> Built for GGSIPU • USAR</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}>Course files,<span className="hero-serif">right where you need them.</span></motion.h1>
          <motion.p className="hero-description" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}><strong>Securely store, manage and access your files.</strong> A simple and secure file-sharing platform for the GGSIPU USAR community.</motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}><Link href={primaryHref} className="button button-primary button-large">Get Started <ArrowRight size={17} /></Link><Link href={user ? "/dashboard" : "/login"} className="button button-text button-large">Login <ArrowUpRight size={15} /></Link></motion.div>
          <div className="hero-promise"><ShieldCheck size={16} /><span>Private storage. Personal access. Your choice to keep or delete.</span></div>
        </div>
        <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }} transition={{ opacity: { duration: 0.6, delay: 0.14 }, scale: { duration: 0.6, delay: 0.14 }, y: { duration: 9, repeat: Infinity, ease: "easeInOut" } }}>
          {!imageFailed ? <img src="/assets/usar-campus.jpg" alt="Campus exterior at the University School of Automation and Robotics, GGSIPU" onError={() => setImageFailed(true)} /> : <div className="campus-fallback"><span className="fallback-orb" /><div className="fallback-copy"><span>GGSIPU · USAR</span><strong>Campus photo unavailable</strong><small>Replace this labeled image area with an approved campus photo.</small></div></div>}
          <span className="hero-particle particle-one" /><span className="hero-particle particle-two" /><span className="hero-particle particle-three" />
          <div className="hero-image-shade" /><div className="hero-image-label"><span className="label-mark"><span /><span /><span /></span><span>USAR · EAST DELHI CAMPUS</span></div>
          <div className="floating-note"><div className="floating-note-icon"><LockKeyhole size={16} /></div><div><strong>Just yours</strong><small>Your own private file space</small></div><span className="floating-check">✓</span></div>
          <a className="photo-credit" href="https://knwdle.com/colleges/university-school-of-automation-and-robotics-new-delhi/gallery" target="_blank" rel="noreferrer">Campus photo · source gallery <ArrowUpRight size={12} /></a>
        </motion.div>
      </section>
      <section className="trust-strip"><div className="trust-strip-inner"><span><span className="trust-icon"><LockKeyhole size={16} /></span> Account-only access</span><i /><span><span className="trust-icon"><FileSearch2 size={16} /></span> Searchable library</span><i /><span><span className="trust-icon"><ShieldCheck size={16} /></span> You control deletion</span></div></section>
      <section className="features-section" id="features"><div className="section-heading"><span className="section-kicker">BUILT AROUND YOUR FILES</span><h2>Everything in its place.<br /><span className="heading-serif">Nothing in the way.</span></h2><p>Keep the everyday flow simple: sign in, upload what matters, and come back to it when you need it.</p></div>
        <div className="feature-grid">{features.map((feature, index) => <motion.article className="feature-card" key={feature.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.35, delay: index * 0.07 }}><span className="feature-icon"><feature.icon size={20} strokeWidth={1.75} /></span><span className="feature-number">0{index + 1}</span><h3>{feature.title}</h3><p>{feature.body}</p></motion.article>)}</div>
      </section>
      <section className="how-section" id="how-it-works"><div className="how-aside"><span className="section-kicker section-kicker-light">A SMALLER ROUTINE</span><h2>Three steps.<br /><span className="heading-serif">A little more headspace.</span></h2><p>No complicated setup. Your library stays tied to your account from the first upload.</p><Link className="button button-light" href={primaryHref}>{user ? "Open your workspace" : "Make your space"}<ArrowRight size={16} /></Link></div>
        <div className="steps-list"><article><span className="step-number">01</span><div><h3>Make your account</h3><p>Sign up with your email and password. Confirm your email if your project requires it.</p></div><span className="step-line" /></article><article><span className="step-number">02</span><div><h3>Bring your files</h3><p>Drop in notes, PDFs, presentations, spreadsheets, images, ZIPs or text files—up to 25 MB each.</p></div><span className="step-line" /></article><article><span className="step-number">03</span><div><h3>Pick up where you left off</h3><p>Search, filter, download or remove a file from your personal library.</p></div></article></div>
      </section>
      <section className="closing-section"><div className="closing-icon"><Sparkles size={19} /></div><div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Keep the useful stuff close.</h2><p>A personal place for the files that keep your USAR work moving.</p></div><Link className="button button-primary button-large" href={primaryHref}>{user ? "Open workspace" : "Create your account"}<ArrowRight size={16} /></Link></section>
    </main>
    <footer className="marketing-footer"><div className="footer-top"><Brand /><p>Secure file management for the USAR community.</p><div className="footer-links"><Link href="/">Home</Link><Link href="/dashboard">Dashboard</Link><Link href="/files">My Files</Link><Link href="/upload">Upload</Link><Link href="/privacy">Privacy</Link><Link href="/about">About</Link><a href="https://www.ipu.ac.in/usar/" target="_blank" rel="noreferrer">Official USAR site <ArrowUpRight size={12} /></a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} USAR FileShare</span><span>GGSIPU • University School of Automation and Robotics</span></div></footer>
  </div>;
}
