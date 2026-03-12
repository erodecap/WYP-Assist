import { requireAdmin } from "../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { supabase } = ctx;

  try {
    const { search, page = "1", limit = "25", role } = req.query;
    const pg = Math.max(1, parseInt(page));
    const lim = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pg - 1) * lim;

    // Fetch all auth users via admin API
    const { data: { users: allUsers }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) {
      console.error("List users error:", error.message);
      return res.status(500).json({ error: "Failed to list users" });
    }

    // Fetch all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, role, banned, display_name");

    // Fetch all subscriptions
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("user_id, status, current_period_end, is_manual, stripe_customer_id");

    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });
    const subMap = {};
    (subs || []).forEach(s => { subMap[s.user_id] = s; });

    // Join and enrich
    let users = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      display_name: profileMap[u.id]?.display_name || u.user_metadata?.full_name || null,
      role: profileMap[u.id]?.role || "user",
      banned: profileMap[u.id]?.banned || false,
      sub_status: subMap[u.id]?.status || null,
      sub_end: subMap[u.id]?.current_period_end || null,
      is_manual_sub: subMap[u.id]?.is_manual || false,
      stripe_customer_id: subMap[u.id]?.stripe_customer_id || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.display_name && u.display_name.toLowerCase().includes(q))
      );
    }

    // Filter by role
    if (role && ["user", "admin"].includes(role)) {
      users = users.filter(u => u.role === role);
    }

    // Sort by created_at desc
    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = users.length;
    const paginated = users.slice(offset, offset + lim);

    return res.status(200).json({ users: paginated, total, page: pg, limit: lim });
  } catch (err) {
    console.error("Admin users error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
