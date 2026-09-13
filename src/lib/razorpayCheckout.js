function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Razorpay'))
      );
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

// Call this on mount (e.g. useEffect) so the SDK is already
// loaded by the time the user hits Buy Now.
export function preloadRazorpayScript() {
  loadRazorpayScript().catch(() => {
    // swallow — openRazorpayCheckout will retry & surface a real error
  });
}

/**
 * Open Razorpay Standard Checkout
 *
 * @param {Object} params
 * @param {number} params.amountPaise - Amount in paise (min 100)
 * @param {string} [params.name]
 * @param {string} [params.description]
 * @param {string} [params.receipt]
 * @param {string} [params.customerName]
 * @param {string} [params.customerEmail]
 * @param {string} [params.customerContact] - 10-digit phone, no country code
 * @param {function} [params.onSuccess]
 * @param {function} [params.onError]
 * @param {function} [params.onDismiss]
 */
export async function openRazorpayCheckout({
  amountPaise,
  name = 'Exposure Explorers',
  description = 'Order',
  receipt,
  customerName,
  customerEmail,
  customerContact,
  onSuccess,
  onError,
  onDismiss,
}) {
  try {
    if (!amountPaise || amountPaise < 100) {
      onError?.('Invalid amount');
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      onError?.('Razorpay key missing (VITE_RAZORPAY_KEY_ID)');
      return;
    }

    // 1) Create order on backend
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
      }),
    });

    const raw = await orderRes.text();
    let orderData;
    try {
      orderData = JSON.parse(raw);
    } catch {
      console.error('create-order non-JSON:', raw.slice(0, 400));
      onError?.(
        'Payment server error. Use vercel dev or deploy API routes.'
      );
      return;
    }

    if (!orderRes.ok) {
      onError?.(orderData.error || 'Failed to create order');
      return;
    }

    if (!orderData.order_id || !orderData.amount) {
      onError?.('Invalid order response from server');
      return;
    }

    // 2) Load Razorpay SDK (no-op if preloaded already)
    await loadRazorpayScript();

    // 3) Open checkout — amount & order_id MUST come from API
    const options = {
      key,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name,
      description,
      order_id: orderData.order_id,
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerContact || '',
      },
      handler: async function (response) {
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

          const verifyRaw = await verifyRes.text();
          let verifyData;
          try {
            verifyData = JSON.parse(verifyRaw);
          } catch {
            onError?.('Verification server error');
            return;
          }

          if (verifyRes.ok && verifyData.success) {
            onSuccess?.({
              ...verifyData,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderData.amount,
              currency: orderData.currency || 'INR',
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
            });
          } else {
            onError?.(verifyData.error || 'Payment verification failed');
          }
        } catch (err) {
          console.error(err);
          onError?.('Payment received but verification failed');
        }
      },
      theme: {
        color: '#000000',
      },
      modal: {
        ondismiss: function () {
          onDismiss?.();
        },
      },
    };

    console.log('Razorpay checkout options:', {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id,
    });

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response) {
      console.error('Razorpay payment.failed:', response.error);
      onError?.(
        response.error?.description || 'Payment failed. Please try again.'
      );
    });

    rzp.open();
  } catch (err) {
    console.error(err);
    onError?.(err.message || 'Something went wrong');
  }
}