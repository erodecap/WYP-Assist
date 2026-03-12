import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { venue_name, venue_id } = req.body;
  if (!venue_name || !venue_id) {
    return res.status(400).json({ error: "venue_name and venue_id required" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if venue already has an image
  const { data: venue } = await supabase
    .from("venues")
    .select("image_url")
    .eq("id", venue_id)
    .single();

  if (venue?.image_url) {
    return res.status(200).json({ image_url: venue.image_url });
  }

  const UA = { "User-Agent": "WYPAssist/1.0 (https://wypassist.com)" };

  try {
    // 1. Wikipedia REST API
    let thumbUrl = null;
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(venue_name)}`;
    const wikiRes = await fetch(wikiUrl, { headers: UA });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      thumbUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source;
    }

    // 2. Wikipedia with "(venue)" suffix
    if (!thumbUrl) {
      const altUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(venue_name + " (venue)")}`;
      const altRes = await fetch(altUrl, { headers: UA });
      if (altRes.ok) {
        const altData = await altRes.json();
        thumbUrl = altData.originalimage?.source || altData.thumbnail?.source;
      }
    }

    // 3. Wikimedia Commons search fallback
    if (!thumbUrl) {
      const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(venue_name)}&gsrlimit=5&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
      const commonsRes = await fetch(commonsUrl, { headers: UA });
      if (commonsRes.ok) {
        const cd = await commonsRes.json();
        const pages = cd.query?.pages;
        if (pages) {
          for (const p of Object.values(pages)) {
            const info = p.imageinfo?.[0];
            if (info && /^image\/(jpeg|png|webp)/.test(info.mime)) {
              thumbUrl = info.thumburl || info.url;
              break;
            }
          }
        }
      }
    }

    if (!thumbUrl) {
      return res.status(200).json({ image_url: null });
    }

    // Fetch the image binary
    const imgRes = await fetch(thumbUrl);
    if (!imgRes.ok) {
      return res.status(200).json({ image_url: null });
    }

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";

    // Upload to Supabase Storage
    const storagePath = `${venue_id}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("venue-images")
      .upload(storagePath, imgBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr.message);
      return res.status(200).json({ image_url: null });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("venue-images")
      .getPublicUrl(storagePath);

    // Update venue record
    await supabase
      .from("venues")
      .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", venue_id);

    return res.status(200).json({ image_url: publicUrl });
  } catch (err) {
    console.error("Venue image error:", err.message);
    return res.status(200).json({ image_url: null });
  }
}
