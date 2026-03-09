import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const RECIPIENTS = [
  "MRich@christielites.com",
  "tbaxt@christielites.com",
  "costa@wypproductions.com",
  "evan@rodecap.co",
];

// Simple in-memory rate limiter: max 5 requests per IP per 10 minutes
const rateMap = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// HTML-escape to prevent injection
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Verify Supabase JWT and return user
async function getAuthUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  // Auth check
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const {
      from_name, from_email, project_name, venue,
      delivery_date, show_date, return_date,
      country, d8_status, total_hoists, chain_system, pdf_base64,
    } = req.body;

    if (!from_name || !from_email || !project_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Sanitize all user inputs
    const safeName = esc(from_name);
    const safeEmail = esc(from_email);
    const safeProject = esc(project_name);
    const safeVenue = esc(venue);
    const safeDelivery = esc(delivery_date);
    const safeShow = esc(show_date);
    const safeReturn = esc(return_date);
    const safeCountry = esc(country);
    const safeD8 = esc(d8_status);
    const safeHoists = esc(total_hoists);
    const safeChain = esc(chain_system);

    // Sanitize filename: alphanumeric, underscore, hyphen only
    const safeFilename = String(project_name || "export").replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_") || "export";

    const { data, error } = await resend.emails.send({
      from: "WYP Assist <noreply@wypassist.com>",
      to: RECIPIENTS,
      subject: `Quote Request: ${safeProject} — ${safeName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
          <div style="background:#ED0000;padding:16px 24px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:1px">WYP ASSIST — Quote Request</h1>
          </div>
          <div style="background:#1A1A1A;padding:24px;color:#F5F5F5;border-radius:0 0 8px 8px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 12px;color:#9A9A9A;width:140px">Requested By</td><td style="padding:8px 12px;font-weight:bold">${safeName}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Email</td><td style="padding:8px 12px"><a href="mailto:${safeEmail}" style="color:#FF2B2B">${safeEmail}</a></td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Project</td><td style="padding:8px 12px;font-weight:bold">${safeProject}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Venue</td><td style="padding:8px 12px">${safeVenue || "—"}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Delivery Date</td><td style="padding:8px 12px">${safeDelivery || "N/A"}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Show Date</td><td style="padding:8px 12px">${safeShow}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Return Date</td><td style="padding:8px 12px">${safeReturn || "N/A"}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Country / Region</td><td style="padding:8px 12px">${safeCountry}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Chain System</td><td style="padding:8px 12px">${safeChain}</td></tr>
              <tr><td style="padding:8px 12px;color:#9A9A9A">Total Hoists</td><td style="padding:8px 12px;font-weight:bold;font-size:16px">${safeHoists}</td></tr>
              ${safeD8 !== "Standard" ? `<tr><td style="padding:8px 12px;color:#E74C3C;font-weight:bold" colspan="2">⚠ ${safeD8}</td></tr>` : ""}
            </table>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid #3A3A3A;font-size:11px;color:#666">
              Generated by WYP Assist v1.1.0 — Pull sheet PDF attached
            </div>
          </div>
        </div>
      `,
      attachments: pdf_base64
        ? [{ filename: `WYP_PullSheet_${safeFilename}.pdf`, content: pdf_base64, type: "application/pdf" }]
        : [],
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
