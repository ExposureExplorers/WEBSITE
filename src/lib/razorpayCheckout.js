// Loads the Razorpay checkout script once, creates an order via the backend,
// opens the payment modal, and verifies the payment on success.
//
// Usage:
//   import { openRazorpayCheckout } from '@/lib/razorpayCheckout';
//
//   await openRazorpayCheckout({
//     amountPaise: 79900,
//     name: 'Exposure Explorers',
//     description: 'Oversized T-Shirt — Size M',
//     receipt: `merch_M_${Date.now()}`,
//     onSuccess: () => setMessage('Payment successful!'),
//     onError: (msg) => setMessage(msg),
//     onDismiss: () => setMessage('Payment cancelled.'),
//   });

let scriptLoadPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function openRazorpayCheckout({
  amountPaise,
  currency = 'INR',
  receipt,
  name,
  description,
  onSuccess,
  onError,
  onDismiss,
}) {
  try {
    await loadRazorpayScript();

    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountPaise, currency, receipt }),
    });
    const orderData = await parseJsonResponse(orderRes);
    if (!orderRes.ok) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) throw new Error('Razorpay key not configured (VITE_RAZORPAY_KEY_ID)');

    const options = {
      key,
      amount: orderData.amount,
      currency: orderData.currency,
      name,
      description,
      order_id: orderData.order_id,
      handler: async (response) => {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await parseJsonResponse(verifyRes);
          if (verifyRes.ok && verifyData.success) {
            onSuccess?.(verifyData);
          } else {
            onError?.(verifyData.error || 'Payment verification failed.');
          }
        } catch (err) {
          onError?.(err.message || 'Payment received but verification failed. Contact support.');
        }
      },
      theme: { color: '#000000' },
      modal: {
        ondismiss: () => onDismiss?.(),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      onError?.(response.error?.description || 'Payment failed. Please try again.');
    });
    rzp.open();
  } catch (err) {
    onError?.(err.message || 'Something went wrong. Please try again.');
  }
}