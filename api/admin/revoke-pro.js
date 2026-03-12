import { requireAdmin, auditLog } from "../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { user: admin, supabase } = ctx;

  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (error) {
      console.error("Revoke PRO error:", error.message);
      return res.status(500).json({ error: "Failed to revoke PRO" });
    }

    await auditLog(supabase, admin.id, "revoke_pro", user_id, {});

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Admin revoke-pro error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
