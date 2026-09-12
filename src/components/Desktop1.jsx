import { useState, useEffect } from 'react';
import styles from './Desktop1.module.css';

const MERCH_AMOUNT_PAISE = 79900; // ₹799

async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      `Server returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`
    );
  }
  return res.json();
}

const Desktop1 = () => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (document.getElementById('razorpay-checkout-js')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      setMessage('Please select a size first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: MERCH_AMOUNT_PAISE,
          currency: 'INR',
          receipt: `merch_${selectedSize}_${Date.now()}`,
        }),
      });

      const orderData = await parseJsonResponse(orderRes);
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) throw new Error('Razorpay key not configured');
      if (!window.Razorpay) throw new Error('Razorpay SDK not loaded. Refresh and try again.');

      const options = {
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Exposure Explorers',
        description: `Oversized T-Shirt — Size ${selectedSize}`,
        order_id: orderData.order_id,
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
            const verifyData = await parseJsonResponse(verifyRes);
            if (verifyRes.ok && verifyData.success) {
              setMessage('Payment successful! Thank you for your order.');
            } else {
              setMessage(verifyData.error || 'Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            setMessage(err.message || 'Payment received but verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        theme: { color: '#000000' },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setMessage(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.desktop1}>
      {/* LEFT: scrollable image column */}
      <div className={styles.leftColumn}>
        <img
          className={styles.exposureExplorers1}
          src="/assets/icons/exposure-explorers.svg"
          alt="Exposure Explorers Logo"
        />

        <div className={styles.imageGrid}>
          <div className={styles.imageCol}>
            <img
              className={styles.image1Icon}
              src="/assets/merch/product-1.png"
              alt="Product front"
            />
            <img
              className={styles.image4Icon2}
              src="/assets/merch/product-4.png"
              alt="Product back"
            />
          </div>
          <div className={styles.imageCol}>
            <img
              className={styles.image3Icon}
              src="/assets/merch/product-2.png"
              alt="Product lifestyle"
            />
            <img
              className={styles.image4Icon}
              src="/assets/merch/product-3.png"
              alt="Product detail"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: sticky info column */}
      <div className={styles.rightColumn}>
        <div className={styles.exposureExplorersOversizedContainer}>
          <span className={styles.exposureExplorersOversized}>
            Exposure Explorers Oversized T-Shirt
          </span>
        </div>

        <div className={styles.div}>₹ 799</div>
        <div className={styles.desktop1Child} />

        <div className={styles.groupParent}>
          {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
            <div
              key={size}
              className={`${styles.rectangleParent} ${selectedSize === size ? styles.sizeActive : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              <div className={styles.groupChild} />
              <div className={size === 'XL' ? styles.xl : styles.xs}>{size}</div>
            </div>
          ))}
        </div>

        <div className={styles.sizeGuide}>SIZE GUIDE</div>

        {/* Single divider between Size Guide and Description */}
        <div className={styles.desktop1Item} />

        <div className={styles.lineParent}>
          <button
            type="button"
            className={styles.description}
            onClick={() => toggleSection('description')}
            aria-expanded={openSection === 'description'}
          >
            <span>DESCRIPTION</span>
            <span>{openSection === 'description' ? '−' : '+'}</span>
          </button>

          {openSection === 'description' && (
            <div className={styles.accordionContent}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
              veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
              velit esse cillum dolore eu fugiat nulla pariatur. Made from 100%
              premium cotton with an oversized fit for maximum comfort. Limited
              edition print by Exposure Explorers.
            </div>
          )}

          <div className={styles.frameChild} />

          <button
            type="button"
            className={styles.description}
            onClick={() => toggleSection('care')}
            aria-expanded={openSection === 'care'}
          >
            <span>CARE</span>
            <span>{openSection === 'care' ? '−' : '+'}</span>
          </button>

          {openSection === 'care' && (
            <div className={styles.accordionContent}>
              Machine wash cold with similar colors. Do not bleach. Tumble dry low
              or hang dry. Iron on low heat if needed. Do not dry clean. Avoid using
              fabric softener to preserve the print quality. Wash inside out for
              longer lasting design.
            </div>
          )}

          <div className={styles.frameChild} />
        </div>

        {/* Buy Now → Razorpay */}
        <div
          className={styles.buyNowWrapper}
          onClick={loading ? undefined : handleBuyNow}
          role="button"
          style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
        >
          <div className={styles.desktop1Inner} />
          <div className={styles.buyNow}>
            {loading ? 'PROCESSING...' : 'BUY NOW'}
          </div>
        </div>

        {message && (
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: message.includes('successful') ? '#0a0' : '#c00',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Desktop1;