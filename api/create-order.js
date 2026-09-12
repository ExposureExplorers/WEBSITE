import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt } = req.body || {};

    const amountPaise = Number(amount);

    if (!amountPaise || amountPaise < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Create order error:', err);
    const status = err?.statusCode === 401 ? 401 : 500;
    return res.status(status).json({
      error: err?.error?.description || err.message || 'Failed to create order',
    });
  }
}