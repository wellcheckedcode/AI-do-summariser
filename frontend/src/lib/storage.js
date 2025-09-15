export const STORAGE_BUCKET = "documents"; // change here if your bucket is named differently

export const getViewUrl = async (path) => {
  const { supabase } = await import("@/integrations/supabase/client");
  // Try public URL first
  try {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (data?.publicUrl) return data.publicUrl;
  } catch (_e) {
    // fall through to signed URL
  }

  // Fallback to signed URL (works for private buckets)
  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 300);
    if (error) throw error;
    return data.signedUrl;
  } catch (e) {
    const message = e?.message || String(e);
    throw new Error(message.includes("Bucket not found")
      ? "Storage bucket not found. Create a bucket named 'documents' in Supabase or update STORAGE_BUCKET."
      : message);
  }
};


