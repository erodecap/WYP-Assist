import { createClient } from "@supabase/supabase-js";

export async function requireAdmin(req, res) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, banned")
    .eq("id", user.id)
    .single();

  if (!profile || profile.banned) {
    res.status(403).json({ error: "Account suspended" });
    return null;
  }

  if (profile.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  return { user, supabase };
}

export async function auditLog(supabase, adminId, action, targetUserId, details) {
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId || null,
    details: details || null,
  });
}
