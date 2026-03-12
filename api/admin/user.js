import { requireAdmin, auditLog } from "../_admin-auth.js";

export default async function handler(req, res) {
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { user: admin, supabase } = ctx;

  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "id required" });

    try {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(id);
      if (error || !user) return res.status(404).json({ error: "User not found" });

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();

      return res.status(200).json({
        id: user.id,
        email: user.email,
        display_name: profile?.display_name || user.user_metadata?.full_name || null,
        role: profile?.role || "user",
        banned: profile?.banned || false,
        banned_at: profile?.banned_at || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        subscription: sub || null,
        profile: profile || null,
      });
    } catch (err) {
      console.error("Admin get user error:", err.message);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  if (req.method === "PATCH") {
    const { id, display_name, role, banned } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });

    try {
      const updates = { updated_at: new Date().toISOString() };
      const actions = [];

      if (display_name !== undefined) {
        updates.display_name = display_name;
        actions.push("update_name");
      }

      if (role !== undefined) {
        if (!["user", "admin"].includes(role)) {
          return res.status(400).json({ error: "Invalid role" });
        }
        // Prevent removing the last admin
        if (role === "user") {
          const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("role", "admin");
          if (admins && admins.length <= 1 && admins[0]?.id === id) {
            return res.status(400).json({ error: "Cannot remove the last admin" });
          }
        }
        updates.role = role;
        actions.push("update_role");
      }

      if (banned !== undefined) {
        updates.banned = banned;
        if (banned) updates.banned_at = new Date().toISOString();
        else updates.banned_at = null;
        actions.push(banned ? "ban_user" : "unban_user");
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Update profile error:", error.message);
        return res.status(500).json({ error: "Failed to update user" });
      }

      // Log each action
      for (const action of actions) {
        await auditLog(supabase, admin.id, action, id, updates);
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Admin update user error:", err.message);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
