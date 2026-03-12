import Stripe from "stripe";
import { requireAdmin, auditLog } from "../_admin-auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ctx = await requireAdmin(req, res);
  if (!ctx) return;
  const { user: admin, supabase } = ctx;

  try {
    const { user_id, amount } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    // Get subscription info
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id, is_manual")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!sub || !sub.stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe subscription found for this user" });
    }

    if (sub.is_manual) {
      return res.status(400).json({ error: "Cannot refund a manually granted subscription" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Find the latest paid invoice
    const invoices = await stripe.invoices.list({
      customer: sub.stripe_customer_id,
      limit: 1,
      status: "paid",
    });

    if (!invoices.data.length) {
      return res.status(400).json({ error: "No paid invoices found" });
    }

    const invoice = invoices.data[0];
    const refundParams = { payment_intent: invoice.payment_intent };
    if (amount) refundParams.amount = Math.round(amount * 100); // convert dollars to cents

    const refund = await stripe.refunds.create(refundParams);

    // Cancel the subscription
    if (sub.stripe_subscription_id) {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    }

    // Update local record
    await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", user_id);

    await auditLog(supabase, admin.id, "issue_refund", user_id, {
      refund_id: refund.id,
      amount: refund.amount / 100,
      invoice_id: invoice.id,
    });

    return res.status(200).json({ success: true, refund_id: refund.id, amount: refund.amount / 100 });
  } catch (err) {
    console.error("Admin refund error:", err.message);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
