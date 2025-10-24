const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mollie =  require('@mollie/api-client')

export const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY })


/**
 * Create a Mollie payment (replaces Stripe session)
 */
const createSession = async (req, res) => {
  try {
    // ✅ If you’re using authentication middleware
    const userId = req.user?.id || req.body.userId;
    const { amount, tokens } = req.body;

    // Create Mollie payment
    const payment = await mollie.payments.create({
      amount: {
        value: amount.toFixed(2), // must be string, e.g. "10.00"
        currency: 'EUR',
      },
      description: `${tokens} tokens for €${amount}`,
      redirectUrl: `${process.env.FRONTEND_URL}/success?userId=${userId}`,
      webhookUrl: `${process.env.BACKEND_URL}/webhook`, // your Render URL
      metadata: {
        userId,
        amount,
        tokens,
      },
    });

    console.log(`✅ Mollie payment created: ${payment.id}`);

    res.json({ url: payment.getCheckoutUrl() });
  } catch (err) {
    console.error('❌ Mollie createSession error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mollie Webhook
 * Called by Mollie when payment status changes
 */
const webhook = async (req, res) => {
  try {
    const paymentId = req.body.id; // Mollie sends "id" field
    console.log('🔔 Mollie webhook hit:', paymentId);

    // Fetch payment details
    const payment = await mollie.payments.get(paymentId);

    if (payment.isPaid()) {
      const { userId, tokens } = payment.metadata;
      const user = db.data.users.find(u => u.id === parseInt(userId));

      if (user) {
        user.tokenBalance += parseInt(tokens);
        await db.write();
        console.log(`✅ ${tokens} tokens added to user ${userId}`);
      } else {
        console.warn(`⚠️ User ${userId} not found`);
      }
    } else {
      console.log(`ℹ️ Payment ${paymentId} not paid yet (status: ${payment.status})`);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Mollie webhook error:', err);
    res.status(500).send('Webhook failed');
  }
};

export { createSession, webhook };