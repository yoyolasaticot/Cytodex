"use client";

import { supabase } from "@/lib/supabase";

const LOCAL_IMAGE_PREFIX = "local-card-image:v1:";
const DB_NAME = "cytodex-local-images";
const DB_VERSION = 1;
const IMAGE_STORE = "images";
const META_STORE = "meta";
const DIRECTORY_META_KEY = "photo-directory";
let hasWarnedAboutUnsupportedDirectoryPicker = false;

type StoredImageRecord = {
  key: string;
  fileName: string;
  blob: Blob;
  savedAt: string;
};

type MetaRecord = {
  key: string;
  value: unknown;
};

type FileAccessMode = "read" | "readwrite";

type WritableFileHandle = FileSystemFileHandle & {
  createWritable: () => Promise<FileSystemWritableFileStream>;
};

type WritableDirectoryHandle = FileSystemDirectoryHandle & {
  getFileHandle: (
    name: string,
    options?: { create?: boolean }
  ) => Promise<WritableFileHandle>;
  queryPermission: (descriptor?: { mode?: FileAccessMode }) => Promise<PermissionState>;
  requestPermission: (
    descriptor?: { mode?: FileAccessMode }
  ) => Promise<PermissionState>;
};

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: "read" | "readwrite";
      startIn?: string;
    }) => Promise<WritableDirectoryHandle>;
  }
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readFromStore<T>(
  storeName: string,
  key: IDBValidKey
): Promise<T | null> {
  const db = await openImageDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(key);

    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function writeToStore<T extends { key: string }>(
  storeName: string,
  value: T
): Promise<void> {
  const db = await openImageDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(value);

    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function deleteFromStore(
  storeName: string,
  key: IDBValidKey
): Promise<void> {
  const db = await openImageDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).delete(key);

    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function buildSafeFileName(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  return `cytodex-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${safeExtension}`;
}

async function getStoredDirectoryHandle(): Promise<WritableDirectoryHandle | null> {
  const record = await readFromStore<MetaRecord>(META_STORE, DIRECTORY_META_KEY);
  return (record?.value as WritableDirectoryHandle | undefined) ?? null;
}

async function persistDirectoryHandle(
  directoryHandle: WritableDirectoryHandle
): Promise<void> {
  await writeToStore<MetaRecord>(META_STORE, {
    key: DIRECTORY_META_KEY,
    value: directoryHandle,
  });
}

async function ensureDirectoryHandle(): Promise<WritableDirectoryHandle | null> {
  if (!window.showDirectoryPicker) return null;

  const storedHandle = await getStoredDirectoryHandle();

  if (storedHandle) {
    const permission = await storedHandle.queryPermission({ mode: "readwrite" });

    if (
      permission === "granted" ||
      (await storedHandle.requestPermission({ mode: "readwrite" })) === "granted"
    ) {
      return storedHandle;
    }
  }

  const directoryHandle = await window.showDirectoryPicker({
    mode: "readwrite",
    startIn: "pictures",
  });
  await persistDirectoryHandle(directoryHandle);
  return directoryHandle;
}

async function writeFileToDirectory(
  directoryHandle: WritableDirectoryHandle,
  fileName: string,
  file: File
): Promise<void> {
  const fileHandle = await directoryHandle.getFileHandle(fileName, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();
}

function localKeyFromFileName(fileName: string): string {
  return `${LOCAL_IMAGE_PREFIX}${fileName}`;
}

function fileNameFromLocalKey(key: string): string {
  return key.slice(LOCAL_IMAGE_PREFIX.length);
}

export function isLocalCardImage(path: string): boolean {
  return path.startsWith(LOCAL_IMAGE_PREFIX);
}

export async function saveCardImagesLocally(
  files: FileList | null
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const directoryHandle = await ensureDirectoryHandle();
  if (!directoryHandle && !hasWarnedAboutUnsupportedDirectoryPicker) {
    hasWarnedAboutUnsupportedDirectoryPicker = true;
    alert(
      "Ce navigateur ne permet pas a CytoDex d'ecrire directement dans un dossier. Les photos restent sauvegardees localement dans ce navigateur."
    );
  }
  const savedKeys: string[] = [];

  for (const file of Array.from(files)) {
    const fileName = buildSafeFileName(file);
    const key = localKeyFromFileName(fileName);

    if (directoryHandle) {
      await writeFileToDirectory(directoryHandle, fileName, file);
    }

    await writeToStore<StoredImageRecord>(IMAGE_STORE, {
      key,
      fileName,
      blob: file,
      savedAt: new Date().toISOString(),
    });
    savedKeys.push(key);
  }

  return savedKeys;
}

export async function getCardImageUrl(path: string): Promise<string> {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("data:")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  if (!isLocalCardImage(path)) {
    const { data, error } = await supabase.storage
      .from("card-images")
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      console.error("Error creating signed URL for", path, error);
      return "";
    }

    return data.signedUrl;
  }

  const fileName = fileNameFromLocalKey(path);

  try {
    const directoryHandle = await getStoredDirectoryHandle();

    if (directoryHandle) {
      const permission = await directoryHandle.queryPermission({ mode: "read" });

      if (
        permission === "granted" ||
        (await directoryHandle.requestPermission({ mode: "read" })) === "granted"
      ) {
        const fileHandle = await directoryHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        return URL.createObjectURL(file);
      }
    }
  } catch (error) {
    console.warn("Impossible de lire la photo depuis le dossier local:", error);
  }

  const record = await readFromStore<StoredImageRecord>(IMAGE_STORE, path);
  return record?.blob ? URL.createObjectURL(record.blob) : "";
}

export async function removeLocalCardImage(path: string): Promise<void> {
  if (!isLocalCardImage(path)) return;

  try {
    await deleteFromStore(IMAGE_STORE, path);
  } catch (error) {
    console.warn("Impossible de supprimer la copie locale de la photo:", error);
  }
}
