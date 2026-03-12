import { requireAdmin } from "../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { supabase } = ctx;

  try {
    // Get all venues without images
    const { data: venues, error } = await supabase
      .from("venues")
      .select("id, name, image_url")
      .is("image_url", null)
      .eq("status", "approved")
      .limit(50); // Process 50 at a time to avoid timeout

    if (error) throw error;
    if (!venues || venues.length === 0) {
      return res.status(200).json({ message: "All venues already have images", processed: 0, success: 0 });
    }

    let success = 0;
    let failed = 0;
    const results = [];

    for (const venue of venues) {
      try {
        const searchName = venue.name
          .replace(/\s*\(.*?\)\s*/g, "") // Remove parenthetical
          .replace(/\u2019/g, "'");

        const imageUrl = await findImage(searchName);

        if (!imageUrl) {
          results.push({ name: venue.name, status: "no_image" });
          failed++;
          continue;
        }

        await fetchAndStore(supabase, venue.id, imageUrl);
        results.push({ name: venue.name, status: "ok", source: imageUrl.includes("commons") ? "commons" : "wikipedia" });
        success++;
      } catch (e) {
        results.push({ name: venue.name, status: "error", error: e.message });
        failed++;
      }
    }

    return res.status(200).json({
      processed: venues.length,
      success,
      failed,
      remaining: await countRemaining(supabase),
      results,
    });
  } catch (err) {
    console.error("Bulk venue image error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}

const UA = { "User-Agent": "WYPAssist/1.0 (https://wypassist.com)" };

// Try Wikipedia first, then Wikipedia with "(venue)" suffix, then Wikimedia Commons
async function findImage(name) {
  // 1. Wikipedia REST API — exact article
  const url1 = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
  const r1 = await fetch(url1, { headers: UA });
  if (r1.ok) {
    const d = await r1.json();
    const img = d.originalimage?.source || d.thumbnail?.source;
    if (img) return img;
  }

  // 2. Wikipedia with "(venue)" suffix
  const url2 = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name + " (venue)")}`;
  const r2 = await fetch(url2, { headers: UA });
  if (r2.ok) {
    const d = await r2.json();
    const img = d.originalimage?.source || d.thumbnail?.source;
    if (img) return img;
  }

  // 3. Wikimedia Commons search — finds images even without a Wikipedia article
  const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(name)}&gsrlimit=5&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
  const r3 = await fetch(commonsUrl, { headers: UA });
  if (r3.ok) {
    const d = await r3.json();
    const pages = d.query?.pages;
    if (pages) {
      // Pick the first result that is an actual image (not SVG/PDF)
      for (const p of Object.values(pages)) {
        const info = p.imageinfo?.[0];
        if (info && /^image\/(jpeg|png|webp)/.test(info.mime)) {
          return info.thumburl || info.url;
        }
      }
    }
  }

  return null;
}

async function fetchAndStore(supabase, venueId, imageUrl) {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to fetch image");

  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const storagePath = `${venueId}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("venue-images")
    .upload(storagePath, imgBuffer, { contentType, upsert: true });

  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage
    .from("venue-images")
    .getPublicUrl(storagePath);

  await supabase
    .from("venues")
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", venueId);
}

async function countRemaining(supabase) {
  const { count } = await supabase
    .from("venues")
    .select("id", { count: "exact", head: true })
    .is("image_url", null)
    .eq("status", "approved");
  return count || 0;
}
