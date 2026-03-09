import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify auth token and extract user
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: { user }, error: authErr } = await supabase.auth.getUser(auth.slice(7));
  if (authErr || !user) return res.status(401).json({ error: "Unauthorized" });

  // Look up the Stripe customer ID from the user's subscription record
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return res.status(400).json({ error: "No subscription found" });
  }

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    console.error("SITE_URL not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: siteUrl,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return res.status(500).json({ error: "Failed to create portal session" });
  }
}
