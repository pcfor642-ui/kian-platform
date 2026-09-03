import { createClient } from "@supabase/supabase-js";

const BUCKET = "kian-uploads";

let client = null;
function getClient() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

let bucketReady = null;
async function ensureBucket() {
  if (bucketReady) return bucketReady;
  bucketReady = (async () => {
    const supabase = getClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "50MB" });
    }
  })();
  return bucketReady;
}

export function isStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadFile({ folder, filename, buffer, contentType }) {
  if (!isStorageConfigured()) throw new Error("storage_disabled");
  await ensureBucket();
  const supabase = getClient();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
