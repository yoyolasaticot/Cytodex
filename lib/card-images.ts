"use client";

import { supabase } from "@/lib/supabase";

export async function uploadCardImages(
  files: FileList | null,
  userId: string
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const uploadPromises = Array.from(files).map(async (file) => {
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `card-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;
    const path = `${userId}/${fileName}`;

    const { error } = await supabase.storage.from("card-images").upload(path, file);

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    return path;
  });

  const uploaded = await Promise.all(uploadPromises);
  return uploaded.filter((url): url is string => url !== null);
}

export async function getCardImageUrl(path: string): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data, error } = await supabase.storage
    .from("card-images")
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    console.error("Error creating signed URL for", path, error);
    return "";
  }

  return data.signedUrl;
}
