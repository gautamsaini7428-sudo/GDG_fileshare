import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseBrowserConfig {
  usarSupabaseUrl?: string;
  usarSupabaseAnonKey?: string;
}

function readLocalBuildConfig(): SupabaseBrowserConfig {
  return {
    usarSupabaseUrl: import.meta.env.VITE_USAR_SUPABASE_URL,
    usarSupabaseAnonKey: import.meta.env.VITE_USAR_SUPABASE_ANON_KEY,
  };
}

function readRuntimeConfig(): SupabaseBrowserConfig {
  if (typeof window === "undefined") return {};
  const runtime = window as unknown as { __MANUS_CONFIG__?: SupabaseBrowserConfig };
  return runtime.__MANUS_CONFIG__ ?? {};
}

export function getSupabaseBrowserConfig() {
  const runtime = readRuntimeConfig();
  const local = readLocalBuildConfig();
  return {
    url: runtime.usarSupabaseUrl?.trim() || local.usarSupabaseUrl?.trim() || "",
    anonKey: runtime.usarSupabaseAnonKey?.trim() || local.usarSupabaseAnonKey?.trim() || "",
  };
}

const { url: projectUrl, anonKey } = getSupabaseBrowserConfig();
export const isSupabaseConfigured = Boolean(projectUrl && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(projectUrl, anonKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase is not configured for this app. Add the project URL and publishable key in secure project settings.");
  }
  return supabase;
}
