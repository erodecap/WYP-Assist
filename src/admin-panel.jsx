import { useState, useEffect, useCallback } from "react";
import { useTheme } from "./wyp-assist.jsx";
import { useAuth } from "./auth-context.jsx";

const API = (path, token, opts = {}) =>
  fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(r => r.json());

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminPanel() {
  const { s, t } = useTheme();
  const { session } = useAuth();
  const tk = session?.access_token;
  const [sub, setSub] = useState("dashboard"); // dashboard | users | subs | audit

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "Users", icon: "👤" },
    { id: "subs", label: "Subscriptions", icon: "💳" },
    { id: "audit", label: "Audit Log", icon: "📜" },
  ];

  return (
    <div>
      <div style={{ ...s.card, padding: 20, marginBottom: 20 }}>
        <div style={{ ...s.cardTitle, marginBottom: 16 }}>🛡 Admin Portal</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => setSub(tb.id)}
              style={{
                padding: "8px 16px",
                background: sub === tb.id ? `${t.accent}20` : "transparent",
                color: sub === tb.id ? t.accent : t.textSecondary,
                border: sub === tb.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: sub === tb.id ? 700 : 500,
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all .15s",
              }}
            >
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>
      </div>
      {sub === "dashboard" && <DashboardView token={tk} />}
      {sub === "users" && <UsersView token={tk} />}
      {sub === "subs" && <SubscriptionsView token={tk} />}
      {sub === "audit" && <AuditView token={tk} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardView({ token }) {
  const { s, t } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    API("/api/admin/stats", token)
      .then(d => { if (!d.error) setStats(d); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={s.empty}>Loading stats…</div>;
  if (!stats) return <div style={s.empty}>Failed to load stats</div>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, color: t.accent },
    { label: "Active PRO", value: stats.activeSubs, color: "#22C55E" },
    { label: "Paid Subs", value: stats.paidSubs, color: "#3B82F6" },
    { label: "Manual/Comped", value: stats.manualSubs, color: "#F59E0B" },
    { label: "Past Due", value: stats.pastDue, color: "#EF4444" },
    { label: "Canceled", value: stats.canceled, color: t.textSecondary },
    { label: "Conversion", value: `${stats.conversionRate}%`, color: "#8B5CF6" },
  ];

  const maxSignup = Math.max(...stats.signupTrend.map(d => d.count), 1);

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...s.card, padding: 16, textAlign: "center", marginBottom: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: c.color, letterSpacing: -1 }}>{c.value}</div>
            <div style={{ fontSize: 10, color: t.textSecondary, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Signup Trend Chart */}
      <div style={s.card}>
        <div style={s.cardTitle}>Signups — Last 30 Days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, padding: "0 4px" }}>
          {stats.signupTrend.map((d, i) => (
            <div
              key={i}
              title={`${d.date}: ${d.count} signup${d.count !== 1 ? "s" : ""}`}
              style={{
                flex: 1,
                height: `${Math.max((d.count / maxSignup) * 100, 2)}%`,
                background: d.count > 0 ? t.accent : `${t.border}40`,
                borderRadius: "2px 2px 0 0",
                minWidth: 4,
                transition: "height .2s",
                cursor: "default",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 9, color: t.textSecondary }}>{stats.signupTrend[0]?.date}</span>
          <span style={{ fontSize: 9, color: t.textSecondary }}>{stats.signupTrend[stats.signupTrend.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function UsersView({ token }) {
  const { s, t } = useTheme();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // user object for detail modal
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 25 });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    API(`/api/admin/users?${params}`, token)
      .then(d => {
        if (!d.error) { setUsers(d.users); setTotal(d.total); }
      })
      .finally(() => setLoading(false));
  }, [token, page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / 25);

  const openUser = (u) => {
    setSelected({ ...u, _editName: u.display_name || "", _editRole: u.role, _editBanned: u.banned });
  };

  const saveUser = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await API("/api/admin/user", token, {
      method: "PATCH",
      body: {
        id: selected.id,
        display_name: selected._editName,
        role: selected._editRole,
        banned: selected._editBanned,
      },
    });
    setSaving(false);
    if (res.error) { alert(res.error); return; }
    setSelected(null);
    fetchUsers();
  };

  const statusColor = (st) => {
    if (st === "active") return "#22C55E";
    if (st === "past_due") return "#EF4444";
    if (st === "canceled") return t.textSecondary;
    return t.textSecondary;
  };

  return (
    <div>
      {/* Search & Filters */}
      <div style={{ ...s.card, padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          style={{ ...s.input, maxWidth: 300, flex: 1 }}
          type="text"
          placeholder="Search by email or name…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          style={{ ...s.input, maxWidth: 140 }}
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <span style={{ fontSize: 11, color: t.textSecondary }}>{total} user{total !== 1 ? "s" : ""}</span>
      </div>

      {/* User Table */}
      <div style={{ ...s.card, padding: 0, overflow: "auto" }}>
        {loading ? (
          <div style={s.empty}>Loading users…</div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Email</th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Sub</th>
                <th style={s.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.id}
                  onClick={() => openUser(u)}
                  style={{ cursor: "pointer", transition: "background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = t.surfaceLight}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>{u.display_name || "—"}</td>
                  <td style={s.td}>
                    <span style={s.badge(u.role === "admin" ? t.accent : t.textSecondary)}>{u.role}</span>
                    {u.banned && <span style={{ ...s.badge("#EF4444"), marginLeft: 6 }}>banned</span>}
                  </td>
                  <td style={s.td}>
                    {u.sub_status ? (
                      <span style={s.badge(statusColor(u.sub_status))}>{u.sub_status}</span>
                    ) : (
                      <span style={{ color: t.textSecondary, fontSize: 11 }}>free</span>
                    )}
                  </td>
                  <td style={s.td}>
                    {u.is_manual_sub && <span style={s.badge("#F59E0B")}>manual</span>}
                    {!u.is_manual_sub && u.sub_status === "active" && <span style={s.badge("#3B82F6")}>stripe</span>}
                  </td>
                  <td style={{ ...s.td, fontSize: 11, color: t.textSecondary }}>{u.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: t.textSecondary }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{ ...s.chip(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "default" : "pointer" }}
          >
            ← Prev
          </button>
          <span style={{ padding: "9px 12px", fontSize: 12, color: t.textSecondary }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ ...s.chip(false), opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "default" : "pointer" }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{ ...s.card, maxWidth: 500, width: "100%", marginBottom: 0, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={s.cardTitle}>Edit User</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 14, color: t.textPrimary }}>{selected.email}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 4 }}>ID</div>
              <div style={{ fontSize: 11, color: t.textSecondary, fontFamily: "inherit" }}>{selected.id}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Display Name</label>
              <input
                style={s.input}
                type="text"
                value={selected._editName}
                onChange={e => setSelected(p => ({ ...p, _editName: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Role</label>
              <select
                style={s.input}
                value={selected._editRole}
                onChange={e => setSelected(p => ({ ...p, _editRole: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selected._editBanned}
                  onChange={e => setSelected(p => ({ ...p, _editBanned: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: "#EF4444" }}
                />
                <span style={{ fontSize: 12, color: selected._editBanned ? "#EF4444" : t.textSecondary, fontWeight: 600 }}>
                  {selected._editBanned ? "BANNED" : "Ban this user"}
                </span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setSelected(null)} style={{ ...s.chip(false), cursor: "pointer" }}>Cancel</button>
              <button
                onClick={saveUser}
                disabled={saving}
                style={{ ...s.exportBtn, padding: "10px 24px", fontSize: 11, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

function SubscriptionsView({ token }) {
  const { s, t } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grantModal, setGrantModal] = useState(false);
  const [refundModal, setRefundModal] = useState(null); // user object
  const [grantForm, setGrantForm] = useState({ email: "", reason: "", days: "365" });
  const [refundAmt, setRefundAmt] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchAll = useCallback(() => {
    if (!token) return;
    setLoading(true);
    API("/api/admin/users?limit=100", token)
      .then(d => {
        if (!d.error) setUsers(d.users.filter(u => u.sub_status));
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const grantPro = async () => {
    if (!grantForm.email) return;
    setActionLoading(true);
    setMsg(null);
    // Find user by email
    const allRes = await API(`/api/admin/users?search=${encodeURIComponent(grantForm.email)}&limit=5`, token);
    const target = allRes.users?.find(u => u.email.toLowerCase() === grantForm.email.toLowerCase());
    if (!target) { setMsg("User not found"); setActionLoading(false); return; }

    const end = new Date(Date.now() + parseInt(grantForm.days) * 86400000).toISOString();
    const res = await API("/api/admin/grant-pro", token, {
      method: "POST",
      body: { user_id: target.id, reason: grantForm.reason, period_end: end },
    });
    setActionLoading(false);
    if (res.error) { setMsg(res.error); return; }
    setMsg("PRO granted successfully");
    setGrantModal(false);
    setGrantForm({ email: "", reason: "", days: "365" });
    fetchAll();
  };

  const revokePro = async (userId) => {
    if (!confirm("Revoke PRO access for this user?")) return;
    setActionLoading(true);
    const res = await API("/api/admin/revoke-pro", token, {
      method: "POST",
      body: { user_id: userId },
    });
    setActionLoading(false);
    if (res.error) { alert(res.error); return; }
    fetchAll();
  };

  const issueRefund = async () => {
    if (!refundModal) return;
    setActionLoading(true);
    const body = { user_id: refundModal.id };
    if (refundAmt) body.amount = parseFloat(refundAmt);
    const res = await API("/api/admin/refund", token, { method: "POST", body });
    setActionLoading(false);
    if (res.error) { alert(res.error); return; }
    alert(`Refund issued: $${res.amount}`);
    setRefundModal(null);
    setRefundAmt("");
    fetchAll();
  };

  const statusColor = (st) => {
    if (st === "active") return "#22C55E";
    if (st === "past_due") return "#EF4444";
    return t.textSecondary;
  };

  return (
    <div>
      {/* Actions Bar */}
      <div style={{ ...s.card, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setGrantModal(true)} style={{ ...s.exportBtn, padding: "10px 20px", fontSize: 11 }}>
          + Grant PRO
        </button>
        {msg && <span style={{ fontSize: 12, color: msg.includes("success") ? "#22C55E" : "#EF4444" }}>{msg}</span>}
      </div>

      {/* Subscriptions Table */}
      <div style={{ ...s.card, padding: 0, overflow: "auto" }}>
        {loading ? (
          <div style={s.empty}>Loading…</div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Email</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Expires</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={s.badge(statusColor(u.sub_status))}>{u.sub_status}</span>
                  </td>
                  <td style={s.td}>
                    {u.is_manual_sub ? (
                      <span style={s.badge("#F59E0B")}>manual</span>
                    ) : (
                      <span style={s.badge("#3B82F6")}>stripe</span>
                    )}
                  </td>
                  <td style={{ ...s.td, fontSize: 11, color: t.textSecondary }}>
                    {u.sub_end?.slice(0, 10) || "—"}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {u.sub_status === "active" && (
                        <button
                          onClick={() => revokePro(u.id)}
                          disabled={actionLoading}
                          style={{ ...s.chip(false), fontSize: 10, padding: "4px 10px", cursor: "pointer", color: "#EF4444", borderColor: "#EF4444" }}
                        >
                          Revoke
                        </button>
                      )}
                      {!u.is_manual_sub && u.stripe_customer_id && (
                        <button
                          onClick={() => { setRefundModal(u); setRefundAmt(""); }}
                          disabled={actionLoading}
                          style={{ ...s.chip(false), fontSize: 10, padding: "4px 10px", cursor: "pointer", color: "#F59E0B", borderColor: "#F59E0B" }}
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: t.textSecondary }}>No subscriptions</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Grant PRO Modal */}
      {grantModal && (
        <Modal onClose={() => setGrantModal(false)}>
          <div style={s.cardTitle}>Grant PRO Access</div>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>User Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="user@example.com"
              value={grantForm.email}
              onChange={e => setGrantForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Reason</label>
            <input
              style={s.input}
              type="text"
              placeholder="Comp, partner, trial…"
              value={grantForm.reason}
              onChange={e => setGrantForm(p => ({ ...p, reason: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Duration (days)</label>
            <input
              style={s.input}
              type="number"
              min="1"
              value={grantForm.days}
              onChange={e => setGrantForm(p => ({ ...p, days: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setGrantModal(false)} style={{ ...s.chip(false), cursor: "pointer" }}>Cancel</button>
            <button
              onClick={grantPro}
              disabled={actionLoading}
              style={{ ...s.exportBtn, padding: "10px 24px", fontSize: 11, opacity: actionLoading ? 0.6 : 1 }}
            >
              {actionLoading ? "Granting…" : "Grant PRO"}
            </button>
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <Modal onClose={() => setRefundModal(null)}>
          <div style={s.cardTitle}>Issue Refund</div>
          <div style={{ marginBottom: 12, fontSize: 13, color: t.textPrimary }}>
            Refunding: <strong>{refundModal.email}</strong>
          </div>
          <div style={{ ...s.warnBox("#EF4444"), marginBottom: 16 }}>
            <span style={{ fontSize: 12 }}>This will refund the latest invoice and cancel the subscription.</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Amount (USD, leave empty for full refund)</label>
            <input
              style={s.input}
              type="number"
              step="0.01"
              min="0"
              placeholder="Full refund"
              value={refundAmt}
              onChange={e => setRefundAmt(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setRefundModal(null)} style={{ ...s.chip(false), cursor: "pointer" }}>Cancel</button>
            <button
              onClick={issueRefund}
              disabled={actionLoading}
              style={{
                ...s.exportBtn,
                padding: "10px 24px",
                fontSize: 11,
                background: `linear-gradient(180deg, #EF4444 0%, #DC2626 100%)`,
                border: "2px solid #EF4444",
                boxShadow: "0 3px 12px rgba(239,68,68,0.4)",
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? "Processing…" : "Confirm Refund"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════════

function AuditView({ token }) {
  const { s, t } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    API("/api/admin/stats", token)
      .then(d => { if (!d.error && d.recentActions) setLogs(d.recentActions); })
      .finally(() => setLoading(false));
  }, [token]);

  const actionLabels = {
    grant_pro: "Granted PRO",
    revoke_pro: "Revoked PRO",
    ban_user: "Banned User",
    unban_user: "Unbanned User",
    update_role: "Changed Role",
    update_name: "Updated Name",
    issue_refund: "Issued Refund",
  };

  const actionColor = (a) => {
    if (a === "ban_user" || a === "issue_refund") return "#EF4444";
    if (a === "grant_pro") return "#22C55E";
    if (a === "revoke_pro") return "#F59E0B";
    return t.textSecondary;
  };

  return (
    <div style={{ ...s.card, padding: 0, overflow: "auto" }}>
      {loading ? (
        <div style={s.empty}>Loading audit log…</div>
      ) : (
        <table style={s.tbl}>
          <thead>
            <tr>
              <th style={s.th}>Time</th>
              <th style={s.th}>Action</th>
              <th style={s.th}>Admin</th>
              <th style={s.th}>Target</th>
              <th style={s.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ ...s.td, fontSize: 11, color: t.textSecondary, whiteSpace: "nowrap" }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td style={s.td}>
                  <span style={s.badge(actionColor(log.action))}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td style={{ ...s.td, fontSize: 11 }}>{log.admin_id?.slice(0, 8)}…</td>
                <td style={{ ...s.td, fontSize: 11 }}>{log.target_user_id?.slice(0, 8) || "—"}…</td>
                <td style={{ ...s.td, fontSize: 10, color: t.textSecondary, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {log.details ? JSON.stringify(log.details).slice(0, 80) : "—"}
                </td>
              </tr>
            ))}
            {!logs.length && (
              <tr><td colSpan={5} style={{ ...s.td, textAlign: "center", color: t.textSecondary }}>No audit entries yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

function Modal({ children, onClose }) {
  const { s } = useTheme();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ ...s.card, maxWidth: 500, width: "100%", marginBottom: 0, maxHeight: "80vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
