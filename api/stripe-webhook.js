import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

// Safely convert a Stripe timestamp (epoch seconds or null) to ISO string
function toISO(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val; // already ISO
  if (typeof val === "number") return new Date(val * 1000).toISOString();
  return new Date().toISOString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Read raw body
  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", resolve);
    req.on("error", reject);
  });
  const rawBody = Buffer.concat(chunks);
  const sig = req.headers["stripe-signature"];

  // Initialize Stripe & Supabase inside handler to catch missing env vars
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
    console.error("Missing env vars:", { stripe: !!stripeKey, webhook: !!webhookSecret, supaUrl: !!supabaseUrl, supaKey: !!supabaseKey });
    return res.status(500).json({ error: "Server configuration error" });
  }

  const stripe = new Stripe(stripeKey);
  const supabase = createClient(supabaseUrl, supabaseKey);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "subscription") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const userId = session.metadata.supabase_user_id;
        if (userId) {
          const { error } = await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0]?.price.id,
            current_period_start: toISO(subscription.current_period_start),
            current_period_end: toISO(subscription.current_period_end),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
          if (error) { console.error("DB error:", error.message); return res.status(500).json({ error: "Internal error" }); }
        }
      }
    } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const userId = sub.metadata.supabase_user_id;
      if (userId) {
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: sub.customer,
          stripe_subscription_id: sub.id,
          status: sub.status,
          price_id: sub.items.data[0]?.price.id,
          current_period_start: toISO(sub.current_period_start),
          current_period_end: toISO(sub.current_period_end),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      await supabase.from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", sub.id);
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await supabase.from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", invoice.subscription);
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }

  return res.status(200).json({ received: true });
}
