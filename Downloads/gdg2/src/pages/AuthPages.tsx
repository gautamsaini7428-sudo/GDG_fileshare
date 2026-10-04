import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/contexts/AuthContext";

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const { user, signIn, signUp, configured } = useAuth();
  const [, setLocation] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1") toast.success("Email confirmed. You can sign in now.");
    if (params.get("registered") === "1") toast.success("Account created. Check your inbox to confirm your email.");
  }, [mode]);
  useEffect(() => { if (user) setLocation("/dashboard"); }, [setLocation, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRegister && fullName.trim().length < 2) { toast.error("Please enter your full name."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error("Invalid email address."); return; }
    if (!password) { toast.error("Password is required."); return; }
    if (isRegister && password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (isRegister && password !== confirmation) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    try {
      if (isRegister) {
        const result = await signUp(fullName.trim(), email.trim(), password);
        if (result.confirmationRequired) { setLocation("/login?registered=1"); return; }
        toast.success("Your account is ready.");
        setLocation("/dashboard");
      } else {
        await signIn(email.trim(), password);
        toast.success("You’re signed in.");
        setLocation("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message.toLowerCase().includes("invalid login credentials") ? "Invalid email or password." : message);
    } finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="auth-aside"><Brand light /><div className="auth-aside-copy"><span className="section-kicker section-kicker-light">YOUR FILES, IN ORDER</span><h1>A little more<br /><em>room to focus.</em></h1><p>Keep your study files together and find them when the next project, presentation or deadline comes around.</p><div className="auth-aside-points"><span><LockKeyhole size={15} /> Personal access</span><span><CheckCircle2 size={15} /> Clear file controls</span></div></div><p className="auth-aside-footer">USAR · GGSIPU East Delhi Campus</p></section>
    <section className="auth-form-side"><Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to FileShare</Link><div className="auth-form-wrap"><div className="auth-mobile-brand"><Brand /></div><span className="auth-overline">{isRegister ? "START YOUR LIBRARY" : "WELCOME BACK"}</span><h2>{isRegister ? "Create your account" : "Sign in to FileShare"}</h2><p className="auth-intro">{isRegister ? "One account, one personal space for your course files." : "Your files are right where you left them."}</p>
        {!configured && <div className="setup-notice" role="status"><LockKeyhole size={17} /><div><strong>Waiting on the secure Supabase connection</strong><p>The preview needs this project’s URL and publishable/anon key before account actions can run. Add them through the protected project settings card—never a service-role key.</p></div></div>}
        <form className="auth-form" noValidate onSubmit={submit}>
          {isRegister && <label>Full name<input autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Aanya Sharma" required minLength={2} maxLength={80} /></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={isRegister ? "At least 8 characters" : "Your password"} required minLength={isRegister ? 8 : 1} /></label>
          {isRegister && <label>Confirm password<input type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Enter your password again" required minLength={8} /></label>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy || !configured}>{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}<ArrowRight size={16} /></button>
        </form>
        <div className="auth-switch">{isRegister ? <>Already have an account? <Link href="/login">Sign in</Link></> : <>New to FileShare? <Link href="/register">Create an account</Link></>}</div><p className="auth-privacy">By continuing, you agree to use your personal account responsibly. See our <Link href="/privacy">privacy notes</Link>.</p>
      </div></section>
  </main>;
}

export function LoginPage() { return <AuthPage mode="login" />; }
export function RegisterPage() { return <AuthPage mode="register" />; }

export function SupabaseSetupPage() {
  return <div className="setup-page"><Brand /><div className="setup-card"><span className="setup-large-icon"><LockKeyhole size={22} /></span><span className="section-kicker">ONE SECURE SETUP STEP</span><h1>Connect your Supabase project</h1><p>The private workspace uses Supabase Auth, Postgres Row Level Security and a private Storage bucket. Add your project URL and <strong>publishable/anon key</strong> using the protected project settings input. A service-role key is neither needed nor used.</p><div className="setup-variable-list"><code>USAR_SUPABASE_URL</code><code>USAR_SUPABASE_ANON_KEY</code></div><Link href="/" className="button button-primary">Back to the overview <ArrowRight size={16} /></Link></div><p className="setup-footnote">The public landing page works while the connection is being configured.</p></div>;
}
