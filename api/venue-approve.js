import { requireAdmin } from "./_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { user, supabase } = ctx;

  try {
    const { submission_id, action, admin_notes } = req.body;

    if (!submission_id || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "submission_id and action (approve|reject) required" });
    }

    // Fetch submission
    const { data: submission, error: fetchErr } = await supabase
      .from("venue_submissions")
      .select("*")
      .eq("id", submission_id)
      .single();

    if (fetchErr || !submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== "pending") {
      return res.status(400).json({ error: "Submission already processed" });
    }

    if (action === "approve") {
      const venueData = {
        ...submission.data,
        status: "approved",
        submitted_by: submission.submitted_by,
        updated_at: new Date().toISOString(),
      };

      if (submission.submission_type === "new") {
        const { error: insertErr } = await supabase
          .from("venues")
          .insert(venueData);
        if (insertErr) {
          console.error("Venue insert error:", insertErr.message);
          return res.status(500).json({ error: "Failed to create venue" });
        }
      } else if (submission.submission_type === "edit" && submission.venue_id) {
        const { error: updateErr } = await supabase
          .from("venues")
          .update(venueData)
          .eq("id", submission.venue_id);
        if (updateErr) {
          console.error("Venue update error:", updateErr.message);
          return res.status(500).json({ error: "Failed to update venue" });
        }
      }
    }

    // Update submission status
    await supabase
      .from("venue_submissions")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        admin_notes: admin_notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission_id);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Venue approve error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
