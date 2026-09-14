import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Desktop1.module.css';

const PRODUCT_NAME = 'Exposure Explorers Oversized T-Shirt';
const PAYMENT_PAGE_URL = 'https://pages.razorpay.com/pl_TbcC9hOorxJOU4/view';
const SIZE_FIELD_KEY = 'size';
const PRODUCT_PRICE = '₹ 799';

const DESCRIPTION_TEXT = `A heavyweight 240 GSM Terry Cotton tee featuring minimal front branding and a bold graphic back. Finished with a soft, breathable feel and a relaxed silhouette made for everyday wear.

• 240 GSM Terry Cotton
• Dual Softener Finish
• Screen / PUFF Printed Branding
• Pre-Shrunk & Durable
• Relaxed Fit
• Signature Front & Back Graphics`;

function prefetchUrl(href) {
  if (!href || typeof document === 'undefined') return;
  if (document.querySelector(`link[data-ee-prefetch="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = 'document';
  link.setAttribute('data-ee-prefetch', href);
  document.head.appendChild(link);
}

function readPendingOrder() {
  try {
    const raw = sessionStorage.getItem('ee_merch_pending');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const Desktop1 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [message, setMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Prefetch Razorpay
  useEffect(() => {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://pages.razorpay.com';
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);

    const dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = 'https://pages.razorpay.com';
    document.head.appendChild(dns);

    prefetchUrl(PAYMENT_PAGE_URL);

    return () => {
      preconnect.remove();
      dns.remove();
    };
  }, []);

  useEffect(() => {
    if (!selectedSize) return;
    const url = new URL(PAYMENT_PAGE_URL);
    url.searchParams.set(SIZE_FIELD_KEY, selectedSize);
    prefetchUrl(url.toString());
  }, [selectedSize]);

  // After Razorpay redirect → build receipt fully on frontend
  useEffect(() => {
    const paymentFlag = searchParams.get('payment');
    const paymentId =
      searchParams.get('razorpay_payment_id') ||
      searchParams.get('payment_id');

    const success =
      paymentFlag === 'success' ||
      paymentFlag === 'paid' ||
      Boolean(paymentId);

    if (!success) return;

    const pending = readPendingOrder();

    setOrderSuccess({
      product: pending?.product || PRODUCT_NAME,
      size: pending?.size || '—',
      amount: PRODUCT_PRICE,
      paymentId: paymentId || '—',
      orderRef: searchParams.get('razorpay_payment_link_id') ||
        searchParams.get('razorpay_order_id') ||
        '—',
      paidAt: new Date().toISOString(),
    });

    // Clear URL params (frontend only) so refresh doesn’t re-trigger forever
    setSearchParams({}, { replace: true });

    try {
      sessionStorage.removeItem('ee_merch_pending');
    } catch {
      // ignore
    }
  }, [searchParams, setSearchParams]);

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const getCheckoutUrl = () => {
    const url = new URL(PAYMENT_PAGE_URL);
    if (selectedSize) url.searchParams.set(SIZE_FIELD_KEY, selectedSize);
    return url.toString();
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
          amount: PRODUCT_PRICE,
        })
      );
    } catch {
      // ignore
    }

    window.location.assign(getCheckoutUrl());
  };

  const buildReceiptText = (order) => {
    const date = new Date(order.paidAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return [
      'EXPOSURE EXPLORERS',
      '--------------------------------',
      'PAYMENT RECEIPT',
      '--------------------------------',
      'Status:          PAID',
      `Date:            ${date}`,
      '',
      `Product:         ${order.product}`,
      `Size:            ${order.size}`,
      `Amount:          ${order.amount}`,
      '',
      `Payment ID:      ${order.paymentId}`,
      `Reference:       ${order.orderRef}`,
      '--------------------------------',
      'Thank you for your order!',
    ].join('\n');
  };

  // Isolated download — no site navigation / no extra routes
  const downloadReceipt = () => {
    if (!orderSuccess) return;

    const text = buildReceiptText(orderSuccess);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `EE_Receipt_${orderSuccess.paymentId || Date.now()}.txt`;
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ========== SUCCESS / RECEIPT (frontend only) ==========
  if (orderSuccess) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successBadge}>PAID</div>
          <h1 className={styles.successTitle}>Order confirmed</h1>
          <p className={styles.successSubtitle}>
            Thank you for your purchase. Your payment was successful.
          </p>

          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span>Product</span>
              <strong>{orderSuccess.product}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Size</span>
              <strong>{orderSuccess.size}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Amount</span>
              <strong>{orderSuccess.amount}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Payment ID</span>
              <strong className={styles.mono}>{orderSuccess.paymentId}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Date</span>
              <strong>
                {new Date(orderSuccess.paidAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </strong>
            </div>
          </div>

          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={downloadReceipt}
            >
              Download receipt
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setOrderSuccess(null)}
            >
              Back to product
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== PRODUCT PAGE ==========
  return (
    <div className={styles.desktop1}>
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
              src="/assets/merch/product-2.webp"
              alt="Product front"
            />
            <img
              className={styles.image4Icon2}
              src="/assets/merch/product-1.webp"
              alt="Product back"
            />
          </div>
          <div className={styles.imageCol}>
            <img
              className={styles.image3Icon}
              src="/assets/merch/product-3.webp"
              alt="Product lifestyle"
            />
            <img
              className={styles.image4Icon}
              src="/assets/merch/product-4.webp"
              alt="Product detail"
            />
          </div>
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.exposureExplorersOversizedContainer}>
          <span className={styles.exposureExplorersOversized}>
            Exposure Explorers Oversized T-Shirt
          </span>
        </div>

        <div className={styles.div}>{PRODUCT_PRICE}</div>
        <div className={styles.desktop1Child} />

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
        <div className={styles.desktop1Item} />

        <div className={styles.lineParent}>
          <div className={styles.accordionRow}>
            <button
              type="button"
              className={styles.description}
              onClick={() => toggleSection('description')}
              aria-expanded={openSection === 'description'}
            >
              <span className={styles.accordionLabel}>DESCRIPTION</span>
            </button>
            <button
              type="button"
              className={styles.accordionToggle}
              onClick={() => toggleSection('description')}
              aria-label={
                openSection === 'description'
                  ? 'Collapse description'
                  : 'Expand description'
              }
            >
              {openSection === 'description' ? '−' : '+'}
            </button>
          </div>

          <div
            className={`${styles.accordionPanel} ${
              openSection === 'description' ? styles.accordionOpen : ''
            }`}
          >
            <div className={styles.accordionInner}>
              {DESCRIPTION_TEXT.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>

          <div className={styles.frameChild} />

          <div className={styles.accordionRow}>
            <button
              type="button"
              className={styles.description}
              onClick={() => toggleSection('care')}
              aria-expanded={openSection === 'care'}
            >
              <span className={styles.accordionLabel}>CARE</span>
            </button>
            <button
              type="button"
              className={styles.accordionToggle}
              onClick={() => toggleSection('care')}
              aria-label={
                openSection === 'care' ? 'Collapse care' : 'Expand care'
              }
            >
              {openSection === 'care' ? '−' : '+'}
            </button>
          </div>

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

        <div
          className={styles.buyNowWrapper}
          onClick={handleBuyNow}
          onMouseEnter={() => {
            if (selectedSize) prefetchUrl(getCheckoutUrl());
          }}
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