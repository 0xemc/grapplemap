import { useEffect, useState } from "react";
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

export function listFiles(): string[] {
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    const names: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (key.startsWith(STORAGE_PREFIX)) {
        names.push(key.substring(STORAGE_PREFIX.length));
      }
    }
    names.sort((a, b) => a.localeCompare(b));
    return names;
  }
  const names: string[] = [];
  for (const key of MEMORY_STORE.keys()) {
    if (key.startsWith(STORAGE_PREFIX)) {
      names.push(key.substring(STORAGE_PREFIX.length));
    }
  }
  names.sort((a, b) => a.localeCompare(b));
  return names;
}

export function removeFile(filename: string): void {
  const key = getKey(filename);
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    window.localStorage.removeItem(key);
  } else {
    MEMORY_STORE.delete(key);
  }
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

export type RenameResult =
  | { ok: true; message: string; oldName: string; newName: string }
  | { ok: false; message: string };

export function renameFile(oldName: string, newName: string): RenameResult {
  const from = oldName.trim();
  const to = newName.trim();
  if (!from) return { ok: false, message: "Original filename is required." };
  if (!to) return { ok: false, message: "New filename is required." };
  if (from === to)
    return { ok: true, message: "No changes.", oldName: from, newName: to };

  const fromKey = `${STORAGE_PREFIX}${from}`;
  const toKey = `${STORAGE_PREFIX}${to}`;

  try {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      const existing = window.localStorage.getItem(fromKey);
      if (existing == null)
        return { ok: false, message: `${from} does not exist.` };
      const conflict = window.localStorage.getItem(toKey);
      if (conflict != null)
        return { ok: false, message: `${to} already exists.` };
      window.localStorage.setItem(toKey, existing);
      window.localStorage.removeItem(fromKey);
      return {
        ok: true,
        message: `Renamed to ${to}`,
        oldName: from,
        newName: to,
      };
    } else {
      const existing = MEMORY_STORE.get(fromKey);
      if (existing == null)
        return { ok: false, message: `${from} does not exist.` };
      const conflict = MEMORY_STORE.get(toKey);
      if (conflict != null)
        return { ok: false, message: `${to} already exists.` };
      MEMORY_STORE.set(toKey, existing);
      MEMORY_STORE.delete(fromKey);
      return {
        ok: true,
        message: `Renamed to ${to}`,
        oldName: from,
        newName: to,
      };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}

export const useFileStorage = () => {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith(STORAGE_PREFIX)) {
        setFiles(listFiles());
      }
    });
  }, []);
  return { files, setFiles };
};
