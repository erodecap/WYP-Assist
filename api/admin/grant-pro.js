import { requireAdmin, auditLog } from "../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { user: admin, supabase } = ctx;

  try {
    const { user_id, reason, period_end } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    // Verify target user exists
    const { data: { user: target }, error: userErr } = await supabase.auth.admin.getUserById(user_id);
    if (userErr || !target) return res.status(404).json({ error: "User not found" });

    const end = period_end || new Date(Date.now() + 365 * 86400000).toISOString();

    const { error } = await supabase.from("subscriptions").upsert({
      user_id,
      status: "active",
      is_manual: true,
      granted_by: admin.id,
      grant_reason: reason || "Admin granted",
      current_period_start: new Date().toISOString(),
      current_period_end: end,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      console.error("Grant PRO error:", error.message);
      return res.status(500).json({ error: "Failed to grant PRO" });
    }

    await auditLog(supabase, admin.id, "grant_pro", user_id, { reason, period_end: end });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Admin grant-pro error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
