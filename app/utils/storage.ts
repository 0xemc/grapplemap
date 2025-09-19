import { Platform } from "react-native";

const MEMORY_STORE: Map<string, string> = new Map();
const STORAGE_PREFIX = "editor:";

function getKey(filename: string): string {
  return `${STORAGE_PREFIX}${filename}`;
}

export function saveText(filename: string, content: string): void {
  const key = getKey(filename);
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    window.localStorage.setItem(key, content);
  } else {
    MEMORY_STORE.set(key, content);
  }
}

export function loadText(filename: string): string | null {
  const key = getKey(filename);
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    return window.localStorage.getItem(key);
  }
  return MEMORY_STORE.get(key) ?? null;
}

export type SaveResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
export type LoadResult =
  | { ok: true; message: string; content: string }
  | { ok: false; message: string };

export function saveFile(filename: string, content: string): SaveResult {
  const trimmed = filename.trim();
  if (!trimmed) {
    return { ok: false, message: "Please enter a filename to save." };
  }
  try {
    saveText(trimmed, content);
    return { ok: true, message: `Saved ${trimmed}` };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}

export function loadFile(filename: string): LoadResult {
  const trimmed = filename.trim();
  if (!trimmed) {
    return { ok: false, message: "Please enter a filename to load." };
  }
  try {
    const value = loadText(trimmed);
    if (value == null) {
      return { ok: false, message: `${trimmed} has not been saved yet.` };
    }
    return { ok: true, message: `Loaded ${trimmed}`, content: value };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
