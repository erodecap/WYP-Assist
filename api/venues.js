import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const ADMIN_EMAILS = ["costa@wypproductions.com", "evan@rodecap.co"];
const UA = { "User-Agent": "WYPAssist/1.0 (https://wypassist.com)" };

function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function getAuthUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  const action = req.query.action;
  if (!action) return res.status(400).json({ error: "action query param required" });

  switch (action) {
    case "image":  return handleImage(req, res);
    case "submit": return handleSubmit(req, res);
    default: return res.status(400).json({ error: `Unknown action: ${action}` });
  }
}

// ─── Venue Image (single) ───────────────────────────────────────────────────
async function handleImage(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { venue_name, venue_id } = req.body;
  if (!venue_name || !venue_id) return res.status(400).json({ error: "venue_name and venue_id required" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: "Server configuration error" });

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: venue } = await supabase.from("venues").select("image_url").eq("id", venue_id).single();
  if (venue?.image_url) return res.status(200).json({ image_url: venue.image_url });

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
            if (info && /^image\/(jpeg|png|webp)/.test(info.mime)) { thumbUrl = info.thumburl || info.url; break; }
          }
        }
      }
    }

    if (!thumbUrl) return res.status(200).json({ image_url: null });

    const imgRes = await fetch(thumbUrl);
    if (!imgRes.ok) return res.status(200).json({ image_url: null });

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const storagePath = `${venue_id}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from("venue-images").upload(storagePath, imgBuffer, { contentType, upsert: true });
    if (uploadErr) { console.error("Storage upload error:", uploadErr.message); return res.status(200).json({ image_url: null }); }

    const { data: { publicUrl } } = supabase.storage.from("venue-images").getPublicUrl(storagePath);
    await supabase.from("venues").update({ image_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", venue_id);

    return res.status(200).json({ image_url: publicUrl });
  } catch (err) {
    console.error("Venue image error:", err.message);
    return res.status(200).json({ image_url: null });
  }
}

// ─── Venue Submit ───────────────────────────────────────────────────────────
async function handleSubmit(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: sub } = await supabase.from("subscriptions").select("status, current_period_end").eq("user_id", user.id).maybeSingle();
  const isPro = sub?.status === "active" && new Date(sub.current_period_end) > new Date();
  if (!isPro) return res.status(403).json({ error: "PRO subscription required" });

  try {
    const { submission_type, venue_id, data } = req.body;
    if (!data?.name || !data?.city || !data?.country) return res.status(400).json({ error: "Missing required fields: name, city, country" });
    if (submission_type === "edit" && !venue_id) return res.status(400).json({ error: "venue_id required for edits" });

    const { data: submission, error: insertErr } = await supabase.from("venue_submissions").insert({
      venue_id: venue_id || null, submitted_by: user.id, submission_type: submission_type || "new", data, status: "pending",
    }).select("id").single();

    if (insertErr) { console.error("Insert error:", insertErr.message); return res.status(500).json({ error: "Failed to submit" }); }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "WYP Assist <noreply@wypassist.com>", to: ADMIN_EMAILS,
          subject: `Venue Submission: ${esc(data.name)} — ${esc(user.email)}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#ED0000;padding:16px 24px;border-radius:8px 8px 0 0">
              <h1 style="color:#fff;margin:0;font-size:18px">Venue ${submission_type === "edit" ? "Edit" : "Submission"}</h1>
            </div>
            <div style="background:#1A1A1A;padding:24px;color:#F5F5F5;border-radius:0 0 8px 8px">
              <p><strong>Venue:</strong> ${esc(data.name)}</p>
              <p><strong>City:</strong> ${esc(data.city)}, ${esc(data.state)} ${esc(data.country)}</p>
              <p><strong>Submitted by:</strong> ${esc(user.email)}</p>
              <p><strong>Type:</strong> ${submission_type}</p>
              <p style="font-size:11px;color:#666;margin-top:20px">Review in admin panel</p>
            </div>
          </div>`,
        });
      } catch (emailErr) { console.error("Notification email failed:", emailErr.message); }
    }

    return res.status(200).json({ success: true, submission_id: submission.id });
  } catch (err) {
    console.error("Venue submit error:", err.message);
    return res.status(500).json({ error: "Failed to submit" });
  }
}
