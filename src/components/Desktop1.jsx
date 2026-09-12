import { useState } from 'react';
import styles from './Desktop1.module.css';
import { openRazorpayCheckout } from '../lib/razorpayCheckout';

const MERCH_AMOUNT_PAISE = 79900; // ₹799

const Desktop1 = () => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

    await openRazorpayCheckout({
      amountPaise: MERCH_AMOUNT_PAISE,
      name: 'Exposure Explorers',
      description: `Oversized T-Shirt — Size ${selectedSize}`,
      receipt: `merch_${selectedSize}_${Date.now()}`,
      onSuccess: () => {
        setMessage('Payment successful! Thank you for your order.');
        setLoading(false);
      },
      onError: (msg) => {
        setMessage(msg);
        setLoading(false);
      },
      onDismiss: () => {
        setMessage('Payment cancelled.');
        setLoading(false);
      },
    });
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