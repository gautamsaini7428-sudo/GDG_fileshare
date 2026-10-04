import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserConfig, requireSupabase } from "@/lib/supabase";

export const STORAGE_BUCKET = "usar-private-files";
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "png", "jpg", "jpeg", "zip", "txt"] as const;

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
}

export function fileExtension(name: string) { return name.split(".").pop()?.trim().toLowerCase() ?? ""; }

export function validateFile(file: File): string | null {
  const extension = fileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number])) return "This file type isn’t supported. Choose PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, PNG/JPG, ZIP, or TXT.";
  if (file.name.length > 255) return "The filename is too long. Use 255 characters or fewer.";
  if (file.size <= 0) return "This file is empty.";
  if (file.size > MAX_FILE_SIZE_BYTES) return "This file is too large. The maximum size is 25 MB.";
  return null;
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export async function listFiles(user: User): Promise<FileRecord[]> {
  const { data, error } = await requireSupabase().from("files")
    .select("id,user_id,file_name,file_type,file_size,storage_path,uploaded_at")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FileRecord[];
}

function safeFileName(name: string) {
  return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-120) || "upload";
}

export async function uploadFile(user: User, file: File, onProgress: (progress: number) => void) {
  const validation = validateFile(file);
  if (validation) throw new Error(validation);
  const client = requireSupabase();
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session?.access_token) throw new Error("Your session has expired. Please log in again.");

  const id = crypto.randomUUID();
  const storagePath = `files/${user.id}/${id}/${safeFileName(file.name)}`;
  const { url: projectUrl, anonKey } = getSupabaseBrowserConfig();
  if (!projectUrl || !anonKey) throw new Error("Supabase connection settings are missing.");
  const objectPath = storagePath.split("/").map(encodeURIComponent).join("/");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${projectUrl.replace(/\/$/, "")}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.timeout = 120_000;
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.min(94, Math.round((event.loaded / event.total) * 94))); };
    xhr.onerror = () => reject(new Error("Network error while uploading. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Try again on a more stable connection."));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = "Upload failed. Please try again.";
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message || body.error || message;
        if (xhr.status === 401 || xhr.status === 403) message = "You are not authorized to upload this file.";
      } catch { /* use the safe fallback */ }
      reject(new Error(message));
    };
    xhr.send(file);
  });

  const row = { id, user_id: user.id, file_name: file.name, file_type: fileExtension(file.name).toUpperCase(), file_size: file.size, storage_path: storagePath };
  const { error } = await client.from("files").insert(row);
  if (error) {
    await client.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => undefined);
    throw new Error(error.message || "The file uploaded, but its details could not be saved. Please try again.");
  }
  onProgress(100);
  return { ...row, uploaded_at: new Date().toISOString() } as FileRecord;
}

async function assertOwnedFile(user: User, fileId: string) {
  const { data, error } = await requireSupabase().from("files")
    .select("id,user_id,storage_path,file_name")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.user_id !== user.id) throw new Error("You are not authorized to access this file.");
  return data;
}

export async function downloadFile(user: User, file: FileRecord) {
  const client = requireSupabase();
  const owned = await assertOwnedFile(user, file.id);
  const { data, error } = await client.storage.from(STORAGE_BUCKET).download(owned.storage_path);
  if (error || !data) throw new Error(error?.message || "File not found or download failed.");
  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = owned.file_name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deleteFile(user: User, file: FileRecord) {
  const client = requireSupabase();
  const owned = await assertOwnedFile(user, file.id);
  const { error: storageError } = await client.storage.from(STORAGE_BUCKET).remove([owned.storage_path]);
  if (storageError) throw new Error(storageError.message || "File deletion failed.");
  const { data, error } = await client.from("files").delete().eq("id", file.id).eq("user_id", user.id).select("id");
  if (error) throw new Error("The stored file was removed, but its record could not be deleted. Refresh and try again.");
  if (!data?.length) throw new Error("You are not authorized to delete this file.");
}
