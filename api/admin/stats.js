import { requireAdmin } from "../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { supabase } = ctx;

  try {
    // Total users
    const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const totalUsers = allUsers?.length || 0;

    // Subscriptions
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, is_manual, created_at");

    const now = new Date();
    const activeSubs = (subs || []).filter(s =>
      s.status === "active" && new Date(s.current_period_end) > now
    );
    const manualSubs = activeSubs.filter(s => s.is_manual);
    const paidSubs = activeSubs.filter(s => !s.is_manual);
    const pastDue = (subs || []).filter(s => s.status === "past_due");
    const canceled = (subs || []).filter(s => s.status === "canceled");

    // Signup trends (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const signupsByDay = {};
    (allUsers || []).forEach(u => {
      const d = u.created_at?.slice(0, 10);
      if (d && new Date(d) >= thirtyDaysAgo) {
        signupsByDay[d] = (signupsByDay[d] || 0) + 1;
      }
    });

    // Build 30-day series
    const signupTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
      signupTrend.push({ date: d, count: signupsByDay[d] || 0 });
    }

    // Conversion rate
    const conversionRate = totalUsers > 0
      ? ((activeSubs.length / totalUsers) * 100).toFixed(1)
      : "0.0";

    // Recent audit log
    const { data: recentActions } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return res.status(200).json({
      totalUsers,
      activeSubs: activeSubs.length,
      paidSubs: paidSubs.length,
      manualSubs: manualSubs.length,
      pastDue: pastDue.length,
      canceled: canceled.length,
      conversionRate,
      signupTrend,
      recentActions: recentActions || [],
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
