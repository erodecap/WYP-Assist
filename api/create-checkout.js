import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, email } = req.body;
  if (!userId || !email) return res.status(400).json({ error: "Missing userId or email" });

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.SITE_URL}?checkout=success`,
      cancel_url: `${process.env.SITE_URL}?checkout=cancel`,
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
      metadata: { supabase_user_id: userId },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message });
  }
}
