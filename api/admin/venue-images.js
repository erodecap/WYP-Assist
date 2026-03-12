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
        // Try Wikipedia REST API
        const searchName = venue.name
          .replace(/\s*\(.*?\)\s*/g, "") // Remove parenthetical
          .replace(/'/g, "'");

        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`;
        const wikiRes = await fetch(wikiUrl, {
          headers: { "User-Agent": "WYPAssist/1.0 (https://wypassist.com)" },
        });

        if (!wikiRes.ok) {
          // Try with " (venue)" suffix
          const altUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName + " (venue)")}`;
          const altRes = await fetch(altUrl, {
            headers: { "User-Agent": "WYPAssist/1.0 (https://wypassist.com)" },
          });

          if (!altRes.ok) {
            results.push({ name: venue.name, status: "not_found" });
            failed++;
            continue;
          }

          const altData = await altRes.json();
          const thumbUrl = altData.originalimage?.source || altData.thumbnail?.source;
          if (!thumbUrl) { results.push({ name: venue.name, status: "no_image" }); failed++; continue; }

          await fetchAndStore(supabase, venue.id, thumbUrl);
          results.push({ name: venue.name, status: "ok" });
          success++;
          continue;
        }

        const wikiData = await wikiRes.json();
        const thumbUrl = wikiData.originalimage?.source || wikiData.thumbnail?.source;

        if (!thumbUrl) {
          results.push({ name: venue.name, status: "no_image" });
          failed++;
          continue;
        }

        await fetchAndStore(supabase, venue.id, thumbUrl);
        results.push({ name: venue.name, status: "ok" });
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
