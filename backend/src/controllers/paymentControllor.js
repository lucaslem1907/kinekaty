const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const createSession = async (req, res) => {
  const { userId } = req.user.id
  const { amount, tokens } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${amount} Euro`,
              description: `${tokens} Tokens`
            },
            unit_amount: amount * 100, // €1 per token
          },
          quantity: 1,
        },
      ],
      metadata: { amount, userId },
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/client`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

const webhook = async (req, res) => {

  const sig = req.headers["stripe-signature"];
  console.log("🔔 Stripe webhook hit", req.headers["stripe-signature"]);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET)
    console.log(event)
    console.log('Verified event:', event.type);
  } catch (err) {
    console.log('Webhook error:', err.message);
    return res.status(400 || 502).send(`Webhook Error: ${err.message}`
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(session)
    const amount = parseInt(session.metadata.amount)

    if (!amount) {
    console.warn("⚠️ Missing metadata in session:", session.metadata);
    return res.status(200).send("Missing metadata, ignored");
  }
    res.json({ received: true });
  }
}

module.exports = { webhook, createSession }