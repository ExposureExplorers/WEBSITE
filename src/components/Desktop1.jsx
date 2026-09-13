import { useEffect, useState } from 'react';
import styles from './Desktop1.module.css';
import { openRazorpayCheckout, preloadRazorpayScript } from '../lib/razorpayCheckout';

const MERCH_AMOUNT_PAISE = 79900; // ₹799
const PRODUCT_NAME = 'Exposure Explorers Oversized T-Shirt';

const Desktop1 = () => {
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Preload Razorpay SDK on mount — kills click-to-modal lag.
  useEffect(() => {
    preloadRazorpayScript();
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const formatAmount = (paise) =>
    `₹${(Number(paise) / 100).toLocaleString('en-IN')}`;

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
      `Amount:          ${formatAmount(order.amount)}`,
      `Currency:        ${order.currency}`,
      '',
      `Order ID:        ${order.orderId}`,
      `Payment ID:      ${order.paymentId}`,
      '--------------------------------',
      'Thank you for your order!',
      'exposure.explorers@nitgoa.ac.in',
    ].join('\n');
  };

  const downloadReceipt = () => {
    if (!orderSuccess?.orderId) return;

    const text = buildReceiptText(orderSuccess);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `EE_Receipt_${orderSuccess.orderId}.txt`);
    a.setAttribute('target', '_self');
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printReceipt = () => {
    if (!orderSuccess?.orderId) return;

    const text = buildReceiptText(orderSuccess);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Receipt</title>
      <style>
        body{font-family:monospace;padding:24px;color:#000}
        pre{white-space:pre-wrap;font-size:13px;line-height:1.5}
      </style>
    </head><body><pre>${text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</pre></body></html>`);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error(err);
      }
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1000);
    }, 300);
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      setMessage('Please select a size first.');
      return;
    }

    setLoading(true);
    setMessage('');
    setOrderSuccess(null);

    await openRazorpayCheckout({
      amountPaise: MERCH_AMOUNT_PAISE,
      name: 'Exposure Explorers',
      description: `${PRODUCT_NAME} — Size ${selectedSize}`,
      receipt: `merch_${selectedSize}_${Date.now()}`,
      onSuccess: (data) => {
        setOrderSuccess({
          product: PRODUCT_NAME,
          size: selectedSize,
          amount: data.amount ?? MERCH_AMOUNT_PAISE,
          currency: data.currency ?? 'INR',
          orderId: data.razorpay_order_id || data.order_id,
          paymentId: data.razorpay_payment_id || data.payment_id,
          paidAt: new Date().toISOString(),
        });
        setMessage('');
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

  // ========== SUCCESS SCREEN ==========
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
              <strong>{formatAmount(orderSuccess.amount)}</strong>
            </div>
            <div className={styles.successRow}>
              <span>Order ID</span>
              <strong className={styles.mono}>{orderSuccess.orderId}</strong>
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
              className={styles.secondaryBtn}
              onClick={printReceipt}
            >
              Print receipt
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => {
                setOrderSuccess(null);
                setSelectedSize(null);
                setMessage('');
              }}
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
              className={`${styles.rectangleParent} ${
                selectedSize === size ? styles.sizeActive : ''
              }`}
              onClick={() => setSelectedSize(size)}
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
            <span className={styles.accordionLabel}>DESCRIPTION</span>
            <button
              type="button"
              className={styles.accordionToggle}
              onClick={() => toggleSection('description')}
              aria-expanded={openSection === 'description'}
              aria-label="Toggle description"
            >
              <span className={styles.accordionIcon}>
                {openSection === 'description' ? '−' : '+'}
              </span>
            </button>
          </div>

          <div
            className={styles.accordionWrapper}
            data-state={openSection === 'description' ? 'open' : 'closed'}
          >
            <div className={styles.accordionContent}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Made
              from 100% premium cotton with an oversized fit. Limited edition by
              Exposure Explorers.
            </div>
          </div>

          <div className={styles.frameChild} />

          <div className={styles.accordionRow}>
            <span className={styles.accordionLabel}>CARE</span>
            <button
              type="button"
              className={styles.accordionToggle}
              onClick={() => toggleSection('care')}
              aria-expanded={openSection === 'care'}
              aria-label="Toggle care instructions"
            >
              <span className={styles.accordionIcon}>
                {openSection === 'care' ? '−' : '+'}
              </span>
            </button>
          </div>

          <div
            className={styles.accordionWrapper}
            data-state={openSection === 'care' ? 'open' : 'closed'}
          >
            <div className={styles.accordionContent}>
              Machine wash cold with similar colors. Do not bleach. Tumble dry
              low or hang dry. Iron on low heat if needed. Wash inside out.
            </div>
          </div>

          <div className={styles.frameChild} />
        </div>

        <div
          className={styles.buyNowWrapper}
          onClick={loading ? undefined : handleBuyNow}
          role="button"
          style={{
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? 'none' : 'auto',
          }}
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