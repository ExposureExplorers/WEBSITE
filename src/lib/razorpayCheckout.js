const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
}

export async function openRazorpayCheckout({
  amountPaise,
  name,
  email,
  contact,
  description,
  notes = {},
  receipt,
  onSuccess,
  onError,
  onDismiss,
}) {
  try {
    if (!KEY_ID) {
      throw new Error('Missing VITE_RAZORPAY_KEY_ID');
    }

    await loadScript();

    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: receipt || `merch_${Date.now()}`,
        notes,
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok || !order.order_id) {
      throw new Error(order.error || 'Could not create order');
    }

    const rzp = new window.Razorpay({
      key: KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Exposure Explorers',
      description: description || 'Oversized T-Shirt',
      order_id: order.order_id,
      notes,
      prefill: {
        name: name || '',
        email: email || '',
        contact: contact || '',
      },
      theme: { color: '#000000' },
      handler: async (response) => {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verify = await verifyRes.json();
          if (!verifyRes.ok || !verify.success) {
            onError?.(verify.error || 'Verification failed');
            return;
          }
          onSuccess?.(response);
        } catch (e) {
          onError?.(e.message || 'Verification failed');
        }
      },
      modal: {
        ondismiss: () => onDismiss?.(),
      },
    });

    rzp.on('payment.failed', (resp) => {
      onError?.(resp?.error?.description || 'Payment failed');
    });

    rzp.open();
  } catch (e) {
    onError?.(e.message || 'Checkout error');
  }
}