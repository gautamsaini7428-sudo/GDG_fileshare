import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PageSpinner } from "./components/EmptyState";
import Home from "./pages/Home";
import { LoginPage, RegisterPage, SupabaseSetupPage } from "./pages/AuthPages";
import { DashboardPage } from "./pages/Dashboard";
import { FilesPage } from "./pages/Files";
import { UploadPage } from "./pages/Upload";
import { AboutPage, PrivacyPage } from "./pages/InfoPages";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/AppLayout";

function Protected({ children }: { children: ReactNode }) {
  const { user, ready, configured } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (ready && configured && !user) setLocation("/login");
  }, [configured, ready, setLocation, user]);
  if (!configured) return <SupabaseSetupPage />;
  if (!ready || !user) return <PageSpinner />;
  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={LoginPage} />
    <Route path="/register" component={RegisterPage} />
    <Route path="/dashboard">{() => <Protected><DashboardPage /></Protected>}</Route>
    <Route path="/files">{() => <Protected><FilesPage /></Protected>}</Route>
    <Route path="/upload">{() => <Protected><UploadPage /></Protected>}</Route>
    <Route path="/about" component={AboutPage} />
    <Route path="/privacy" component={PrivacyPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <Toaster richColors position="bottom-right" />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
