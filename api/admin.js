import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ─── Auth helper ────────────────────────────────────────────────────────────
async function requireAdmin(req, res) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return null; }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) { res.status(401).json({ error: "Unauthorized" }); return null; }

  const { data: profile } = await supabase.from("profiles").select("role, banned").eq("id", user.id).single();
  if (!profile || profile.banned) { res.status(403).json({ error: "Account suspended" }); return null; }
  if (profile.role !== "admin") { res.status(403).json({ error: "Admin access required" }); return null; }

  return { user, supabase };
}

async function auditLog(supabase, adminId, action, targetUserId, details) {
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId, action, target_user_id: targetUserId || null, details: details || null,
  });
}

// ─── Router ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Route via ?action= param
  const action = req.query.action;
  if (!action) return res.status(400).json({ error: "action query param required" });

  switch (action) {
    case "stats":       return handleStats(req, res);
    case "users":       return handleUsers(req, res);
    case "user":        return handleUser(req, res);
    case "grant-pro":   return handleGrantPro(req, res);
    case "revoke-pro":  return handleRevokePro(req, res);
    case "refund":      return handleRefund(req, res);
    case "venue-images": return handleVenueImages(req, res);
    case "venue-approve": return handleVenueApprove(req, res);
    default: return res.status(400).json({ error: `Unknown action: ${action}` });
  }
}

// ─── Stats ──────────────────────────────────────────────────────────────────
async function handleStats(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { supabase } = ctx;

  try {
    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const totalUsers = allUsers?.length || 0;

    const { data: subs } = await supabase.from("subscriptions").select("status, current_period_end, is_manual, created_at");
    const now = new Date();
    const activeSubs = (subs || []).filter(s => s.status === "active" && new Date(s.current_period_end) > now);
    const manualSubs = activeSubs.filter(s => s.is_manual);
    const paidSubs = activeSubs.filter(s => !s.is_manual);
    const pastDue = (subs || []).filter(s => s.status === "past_due");
    const canceled = (subs || []).filter(s => s.status === "canceled");

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const signupsByDay = {};
    (allUsers || []).forEach(u => {
      const d = u.created_at?.slice(0, 10);
      if (d && new Date(d) >= thirtyDaysAgo) signupsByDay[d] = (signupsByDay[d] || 0) + 1;
    });
    const signupTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
      signupTrend.push({ date: d, count: signupsByDay[d] || 0 });
    }

    const conversionRate = totalUsers > 0 ? ((activeSubs.length / totalUsers) * 100).toFixed(1) : "0.0";

    const { data: recentActions } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(20);

    return res.status(200).json({ totalUsers, activeSubs: activeSubs.length, paidSubs: paidSubs.length, manualSubs: manualSubs.length, pastDue: pastDue.length, canceled: canceled.length, conversionRate, signupTrend, recentActions: recentActions || [] });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}

// ─── Users list ─────────────────────────────────────────────────────────────
async function handleUsers(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { supabase } = ctx;

  try {
    const { search, page = "1", limit = "25", role } = req.query;
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pg - 1) * lim;

    const { data: { users: allUsers }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) { console.error("List users error:", error.message); return res.status(500).json({ error: "Failed to list users" }); }

    const { data: profiles } = await supabase.from("profiles").select("id, role, banned, display_name");
    const { data: subs } = await supabase.from("subscriptions").select("user_id, status, current_period_end, is_manual, stripe_customer_id");

    const profileMap = {}; (profiles || []).forEach(p => { profileMap[p.id] = p; });
    const subMap = {}; (subs || []).forEach(s => { subMap[s.user_id] = s; });

    let users = allUsers.map(u => ({
      id: u.id, email: u.email,
      display_name: profileMap[u.id]?.display_name || u.user_metadata?.full_name || null,
      role: profileMap[u.id]?.role || "user",
      banned: profileMap[u.id]?.banned || false,
      sub_status: subMap[u.id]?.status || null,
      sub_end: subMap[u.id]?.current_period_end || null,
      is_manual_sub: subMap[u.id]?.is_manual || false,
      stripe_customer_id: subMap[u.id]?.stripe_customer_id || null,
      created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
    }));

    if (search) { const q = search.toLowerCase(); users = users.filter(u => (u.email && u.email.toLowerCase().includes(q)) || (u.display_name && u.display_name.toLowerCase().includes(q))); }
    if (role && ["user", "admin"].includes(role)) users = users.filter(u => u.role === role);
    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = users.length;
    const paginated = users.slice(offset, offset + lim);
    return res.status(200).json({ users: paginated, total, page: pg, limit: lim });
  } catch (err) {
    console.error("Admin users error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}

// ─── Single user GET / PATCH ────────────────────────────────────────────────
async function handleUser(req, res) {
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { user: admin, supabase } = ctx;

  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });
    try {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(id);
      if (error || !user) return res.status(404).json({ error: "User not found" });
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", id).maybeSingle();
      return res.status(200).json({
        id: user.id, email: user.email,
        display_name: profile?.display_name || user.user_metadata?.full_name || null,
        role: profile?.role || "user", banned: profile?.banned || false, banned_at: profile?.banned_at || null,
        created_at: user.created_at, last_sign_in_at: user.last_sign_in_at,
        subscription: sub || null, profile: profile || null,
      });
    } catch (err) { console.error("Admin get user error:", err.message); return res.status(500).json({ error: "Internal error" }); }
  }

  if (req.method === "PATCH") {
    const { id, display_name, role, banned } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    try {
      const updates = { updated_at: new Date().toISOString() };
      const actions = [];
      if (display_name !== undefined) { updates.display_name = display_name; actions.push("update_name"); }
      if (role !== undefined) {
        if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
        if (role === "user") {
          const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
          if (admins && admins.length <= 1 && admins[0]?.id === id) return res.status(400).json({ error: "Cannot remove the last admin" });
        }
        updates.role = role; actions.push("update_role");
      }
      if (banned !== undefined) {
        updates.banned = banned;
        updates.banned_at = banned ? new Date().toISOString() : null;
        actions.push(banned ? "ban_user" : "unban_user");
      }
      const { error } = await supabase.from("profiles").update(updates).eq("id", id);
      if (error) { console.error("Update profile error:", error.message); return res.status(500).json({ error: "Failed to update user" }); }
      for (const a of actions) await auditLog(supabase, admin.id, a, id, updates);
      return res.status(200).json({ success: true });
    } catch (err) { console.error("Admin update user error:", err.message); return res.status(500).json({ error: "Internal error" }); }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// ─── Grant PRO ──────────────────────────────────────────────────────────────
async function handleGrantPro(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { user: admin, supabase } = ctx;

  try {
    const { user_id, reason, period_end } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const { data: { user: target }, error: userErr } = await supabase.auth.admin.getUserById(user_id);
    if (userErr || !target) return res.status(404).json({ error: "User not found" });

    const end = period_end || new Date(Date.now() + 365 * 86400000).toISOString();
    const { error } = await supabase.from("subscriptions").upsert({
      user_id, status: "active", is_manual: true, granted_by: admin.id,
      grant_reason: reason || "Admin granted",
      current_period_start: new Date().toISOString(), current_period_end: end,
      stripe_customer_id: null, stripe_subscription_id: null,
      cancel_at_period_end: false, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) { console.error("Grant PRO error:", error.message); return res.status(500).json({ error: "Failed to grant PRO" }); }
    await auditLog(supabase, admin.id, "grant_pro", user_id, { reason, period_end: end });
    return res.status(200).json({ success: true });
  } catch (err) { console.error("Admin grant-pro error:", err.message); return res.status(500).json({ error: "Internal error" }); }
}

// ─── Revoke PRO ─────────────────────────────────────────────────────────────
async function handleRevokePro(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { user: admin, supabase } = ctx;

  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });
    const { error } = await supabase.from("subscriptions").update({
      status: "canceled", cancel_at_period_end: false, updated_at: new Date().toISOString(),
    }).eq("user_id", user_id);
    if (error) { console.error("Revoke PRO error:", error.message); return res.status(500).json({ error: "Failed to revoke PRO" }); }
    await auditLog(supabase, admin.id, "revoke_pro", user_id, {});
    return res.status(200).json({ success: true });
  } catch (err) { console.error("Admin revoke-pro error:", err.message); return res.status(500).json({ error: "Internal error" }); }
}

// ─── Refund ─────────────────────────────────────────────────────────────────
async function handleRefund(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { user: admin, supabase } = ctx;

  try {
    const { user_id, amount } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const { data: sub } = await supabase.from("subscriptions").select("stripe_customer_id, stripe_subscription_id, is_manual").eq("user_id", user_id).maybeSingle();
    if (!sub || !sub.stripe_customer_id) return res.status(400).json({ error: "No Stripe subscription found" });
    if (sub.is_manual) return res.status(400).json({ error: "Cannot refund a manually granted subscription" });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const invoices = await stripe.invoices.list({ customer: sub.stripe_customer_id, limit: 1, status: "paid" });
    if (!invoices.data.length) return res.status(400).json({ error: "No paid invoices found" });

    const invoice = invoices.data[0];
    const refundParams = { payment_intent: invoice.payment_intent };
    if (amount) refundParams.amount = Math.round(amount * 100);
    const refund = await stripe.refunds.create(refundParams);

    if (sub.stripe_subscription_id) await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    await supabase.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("user_id", user_id);
    await auditLog(supabase, admin.id, "issue_refund", user_id, { refund_id: refund.id, amount: refund.amount / 100, invoice_id: invoice.id });

    return res.status(200).json({ success: true, refund_id: refund.id, amount: refund.amount / 100 });
  } catch (err) { console.error("Admin refund error:", err.message); return res.status(500).json({ error: err.message || "Internal error" }); }
}

// ─── Venue Images (bulk fetch) ──────────────────────────────────────────────
const UA = { "User-Agent": "WYPAssist/1.0 (https://wypassist.com)" };

async function findImage(name) {
  try {
    const url1 = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    const r1 = await fetch(url1, { headers: UA });
    if (r1.ok) { const d = await r1.json(); const img = d.originalimage?.source || d.thumbnail?.source; if (img) return { url: img, source: "wikipedia" }; }
  } catch (e) { console.error(`Wikipedia lookup failed for "${name}":`, e.message); }

  try {
    const url2 = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name + " (venue)")}`;
    const r2 = await fetch(url2, { headers: UA });
    if (r2.ok) { const d = await r2.json(); const img = d.originalimage?.source || d.thumbnail?.source; if (img) return { url: img, source: "wikipedia-venue" }; }
  } catch (e) { console.error(`Wikipedia venue lookup failed for "${name}":`, e.message); }

  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(name)}&gsrlimit=5&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
    const r3 = await fetch(commonsUrl, { headers: UA });
    if (r3.ok) {
      const d = await r3.json();
      const pages = d.query?.pages;
      if (pages) {
        for (const p of Object.values(pages)) {
          const info = p.imageinfo?.[0];
          if (info && /^image\/(jpeg|png|webp)/.test(info.mime)) return { url: info.thumburl || info.url, source: "commons" };
        }
      }
    }
  } catch (e) { console.error(`Commons lookup failed for "${name}":`, e.message); }

  return { url: null, source: null };
}

async function fetchAndStore(supabase, venueId, imageUrl) {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to fetch image");
  const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const storagePath = `${venueId}.${ext}`;

  const { error: uploadErr } = await supabase.storage.from("venue-images").upload(storagePath, imgBuffer, { contentType, upsert: true });
  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage.from("venue-images").getPublicUrl(storagePath);
  await supabase.from("venues").update({ image_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", venueId);
}

async function handleVenueImages(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { supabase } = ctx;

  try {
    // Fetch a larger pool and randomly pick 10 so each batch covers different venues
    const { data: allVenues, error } = await supabase.from("venues").select("id, name, image_url").is("image_url", null).eq("status", "approved").limit(200);
    if (error) throw error;
    if (!allVenues || allVenues.length === 0) return res.status(200).json({ message: "All venues already have images", processed: 0, success: 0 });
    // Fisher-Yates shuffle then take first 10
    for (let i = allVenues.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [allVenues[i], allVenues[j]] = [allVenues[j], allVenues[i]]; }
    const venues = allVenues.slice(0, 10);

    let success = 0, failed = 0;
    const results = [];

    for (const venue of venues) {
      try {
        const searchName = venue.name.replace(/\s*\(.*?\)\s*/g, "").replace(/\u2019/g, "'");
        const { url: imageUrl, source: imgSource } = await findImage(searchName);
        if (!imageUrl) { results.push({ name: venue.name, status: "no_image", searched: searchName }); failed++; continue; }
        await fetchAndStore(supabase, venue.id, imageUrl);
        results.push({ name: venue.name, status: "ok", source: imgSource });
        success++;
      } catch (e) {
        console.error(`Venue image error for "${venue.name}":`, e.message);
        results.push({ name: venue.name, status: "error", error: e.message });
        failed++;
      }
    }

    const { count } = await supabase.from("venues").select("id", { count: "exact", head: true }).is("image_url", null).eq("status", "approved");
    return res.status(200).json({ processed: venues.length, success, failed, remaining: count || 0, results });
  } catch (err) {
    console.error("Bulk venue image error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}

// ─── Venue Approve ──────────────────────────────────────────────────────────
async function handleVenueApprove(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ctx = await requireAdmin(req, res); if (!ctx) return;
  const { supabase } = ctx;

  try {
    const { submission_id, action, admin_notes } = req.body;
    if (!submission_id || !["approve", "reject"].includes(action)) return res.status(400).json({ error: "submission_id and action (approve|reject) required" });

    const { data: submission, error: fetchErr } = await supabase.from("venue_submissions").select("*").eq("id", submission_id).single();
    if (fetchErr || !submission) return res.status(404).json({ error: "Submission not found" });
    if (submission.status !== "pending") return res.status(400).json({ error: "Submission already processed" });

    if (action === "approve") {
      const venueData = { ...submission.data, status: "approved", submitted_by: submission.submitted_by, updated_at: new Date().toISOString() };
      if (submission.submission_type === "new") {
        const { error: insertErr } = await supabase.from("venues").insert(venueData);
        if (insertErr) { console.error("Venue insert error:", insertErr.message); return res.status(500).json({ error: "Failed to create venue" }); }
      } else if (submission.submission_type === "edit" && submission.venue_id) {
        const { error: updateErr } = await supabase.from("venues").update(venueData).eq("id", submission.venue_id);
        if (updateErr) { console.error("Venue update error:", updateErr.message); return res.status(500).json({ error: "Failed to update venue" }); }
      }
    }

    await supabase.from("venue_submissions").update({
      status: action === "approve" ? "approved" : "rejected",
      admin_notes: admin_notes || null, reviewed_at: new Date().toISOString(),
    }).eq("id", submission_id);

    return res.status(200).json({ success: true });
  } catch (err) { console.error("Venue approve error:", err.message); return res.status(500).json({ error: "Internal error" }); }
}
