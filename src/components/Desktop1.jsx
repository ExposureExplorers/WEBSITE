import { useState } from 'react';
import styles from './Desktop1.module.css';

const PRODUCT_NAME = 'Exposure Explorers Oversized T-Shirt';

// Razorpay Payment Page (long URL — supports field prefill)
const PAYMENT_PAGE_URL = 'https://pages.razorpay.com/pl_TbcC9hOorxJOU4/view';

// Field key on the Payment Page (lowercase). Change if your dashboard key differs.
const SIZE_FIELD_KEY = 'size';

const Desktop1 = () => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [message, setMessage] = useState('');

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setMessage('Please select a size first.');
      return;
    }

    setMessage('');

    try {
      sessionStorage.setItem(
        'ee_merch_pending',
        JSON.stringify({
          size: selectedSize,
          product: PRODUCT_NAME,
        })
      );
    } catch {
      // ignore
    }

    // Prefill Size on Payment Page: .../view?size=M
    const url = new URL(PAYMENT_PAGE_URL);
    url.searchParams.set(SIZE_FIELD_KEY, selectedSize);

    window.location.href = url.toString();
  };

  return (
    <div className={styles.desktop1}>
      {/* LEFT: images */}
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

      {/* RIGHT: product info */}
      <div className={styles.rightColumn}>
        <div className={styles.exposureExplorersOversizedContainer}>
          <span className={styles.exposureExplorersOversized}>
            Exposure Explorers Oversized T-Shirt
          </span>
        </div>

        <div className={styles.div}>₹ 799</div>
        <div className={styles.desktop1Child} />

        {/* Size buttons */}
        <div className={styles.groupParent}>
          {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
            <div
              key={size}
              className={`${styles.rectangleParent} ${
                selectedSize === size ? styles.sizeActive : ''
              }`}
              onClick={() => {
                setSelectedSize(size);
                setMessage('');
              }}
            >
              <div className={styles.groupChild} />
              <div className={size === 'XL' ? styles.xl : styles.xs}>{size}</div>
            </div>
          ))}
        </div>

        <div className={styles.sizeGuide}>SIZE GUIDE</div>

        {/* Selected size field (like Description row) */}

        <div className={styles.desktop1Item} />

        {/* Description / Care */}
        <div className={styles.lineParent}>
          <button
            type="button"
            className={styles.description}
            onClick={() => toggleSection('description')}
            aria-expanded={openSection === 'description'}
          >
            <span>DESCRIPTION</span>
            <span className={styles.accordionIcon}>
              {openSection === 'description' ? '−' : '+'}
            </span>
          </button>

          <div
            className={`${styles.accordionPanel} ${
              openSection === 'description' ? styles.accordionOpen : ''
            }`}
          >
            <div className={styles.accordionInner}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Made
              from 100% premium cotton with an oversized fit. Limited edition by
              Exposure Explorers.
            </div>
          </div>

          <div className={styles.frameChild} />

          <button
            type="button"
            className={styles.description}
            onClick={() => toggleSection('care')}
            aria-expanded={openSection === 'care'}
          >
            <span>CARE</span>
            <span className={styles.accordionIcon}>
              {openSection === 'care' ? '−' : '+'}
            </span>
          </button>

          <div
            className={`${styles.accordionPanel} ${
              openSection === 'care' ? styles.accordionOpen : ''
            }`}
          >
            <div className={styles.accordionInner}>
              Machine wash cold with similar colors. Do not bleach. Tumble dry
              low or hang dry. Iron on low heat if needed. Wash inside out.
            </div>
          </div>

          <div className={styles.frameChild} />
        </div>

        {/* BUY NOW → Payment Page with size prefilled */}
        <div
          className={styles.buyNowWrapper}
          onClick={handleBuyNow}
          role="button"
        >
          <div className={styles.desktop1Inner} />
          <div className={styles.buyNow}>BUY NOW</div>
        </div>

        {message && (
          <p style={{ marginTop: 12, fontSize: 14, color: '#c00' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Desktop1;