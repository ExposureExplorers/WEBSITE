import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Desktop1.module.css';
import { openRazorpayCheckout } from '../lib/razorpayCheckout';

const PRODUCT_NAME = 'Exposure Explorers Oversized T-Shirt';
const PRODUCT_PRICE = '₹ 759';
const MERCH_AMOUNT_PAISE = 75900;

const DESCRIPTION_TEXT = `A heavyweight 240 GSM Terry Cotton tee featuring minimal front branding and a bold graphic back. Finished with a soft, breathable feel and a relaxed silhouette made for everyday wear.

• 240 GSM Terry Cotton
• Dual Softener Finish
• Screen / PUFF Printed Branding
• Pre-Shrunk & Durable
• Relaxed Fit
• Signature Front & Back Graphics`;

const Desktop1 = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [message, setMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const paymentFlag = searchParams.get('payment');
    const paymentId =
      searchParams.get('razorpay_payment_id') ||
      searchParams.get('payment_id');

    if (paymentFlag === 'success' || paymentFlag === 'paid' || paymentId) {
      setOrderSuccess({
        product: PRODUCT_NAME,
        size: selectedSize || '—',
        amount: PRODUCT_PRICE,
        paymentId: paymentId || '—',
        orderRef: '—',
        paidAt: new Date().toISOString(),
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, selectedSize]);

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const goToCheckout = () => {
    if (!selectedSize) {
      setMessage('Please select a size first.');
      return;
    }
    setMessage('');
    setShowCheckout(true);
    window.scrollTo(0, 0);
  };

  const handlePay = async () => {
    if (!selectedSize) {
      setMessage('Please select a size first.');
      return;
    }
    if (
      !customer.name.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim()
    ) {
      setMessage('Please enter name, email and phone.');
      return;
    }

    setLoading(true);
    setMessage('');

    await openRazorpayCheckout({
      amountPaise: MERCH_AMOUNT_PAISE,
      name: customer.name.trim(),
      email: customer.email.trim(),
      contact: customer.phone.trim(),
      description: `Oversized T-Shirt — Size ${selectedSize}`,
      receipt: `merch_${selectedSize}_${Date.now()}`,
      notes: {
        size: selectedSize,
        product: PRODUCT_NAME,
      },
      onSuccess: (response) => {
        setOrderSuccess({
          product: PRODUCT_NAME,
          size: selectedSize,
          amount: PRODUCT_PRICE,
          paymentId: response.razorpay_payment_id || '—',
          orderRef: response.razorpay_order_id || '—',
          paidAt: new Date().toISOString(),
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim(),
          customerPhone: customer.phone.trim(),
        });
        setLoading(false);
      },
      onError: (msg) => {
        setMessage(msg || 'Payment failed.');
        setLoading(false);
      },
      onDismiss: () => {
        setMessage('Payment cancelled.');
        setLoading(false);
      },
    });
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
      `Name:            ${order.customerName || '—'}`,
      `Email:           ${order.customerEmail || '—'}`,
      `Phone:           ${order.customerPhone || '—'}`,
      '',
      `Payment ID:      ${order.paymentId}`,
      `Order ID:        ${order.orderRef}`,
      '--------------------------------',
      'Thank you for your order!',
    ].join('\n');
  };

  const downloadReceipt = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!orderSuccess) return;

    const text = buildReceiptText(orderSuccess);
    const filename = `EE_Receipt_${orderSuccess.paymentId || Date.now()}.txt`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /* ========== SUCCESS ========== */
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
            {orderSuccess.customerName && (
              <div className={styles.successRow}>
                <span>Name</span>
                <strong>{orderSuccess.customerName}</strong>
              </div>
            )}
            {orderSuccess.customerEmail && (
              <div className={styles.successRow}>
                <span>Email</span>
                <strong>{orderSuccess.customerEmail}</strong>
              </div>
            )}
            {orderSuccess.customerPhone && (
              <div className={styles.successRow}>
                <span>Phone</span>
                <strong>{orderSuccess.customerPhone}</strong>
              </div>
            )}
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
              onClick={() => {
                setOrderSuccess(null);
                setShowCheckout(false);
              }}
            >
              Back to product
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========== CHECKOUT PAGE ========== */
  if (showCheckout) {
    return (
      <div className={styles.checkoutPage}>
        {/* LEFT: details form */}
        <div className={styles.checkoutLeft}>
          <button
            type="button"
            className={styles.checkoutBack}
            onClick={() => setShowCheckout(false)}
          >
           Back
          </button>

          <h1 className={styles.checkoutHeading}>Checkout</h1>


          {/* Order summary (text only — no photo on mobile) */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryProduct}>
              {/* Desktop only thumb */}
              <img
                src="/assets/merch/product-2.webp"
                alt=""
                className={styles.summaryThumb}
              />
              <div className={styles.summaryInfo}>
                <div className={styles.summaryTitle}>{PRODUCT_NAME}</div>
                <div className={styles.summaryMeta}>Size {selectedSize}</div>
              </div>
              <div className={styles.summaryPrice}>{PRODUCT_PRICE}</div>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{PRODUCT_PRICE}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>INR 759.00</span>
            </div>
          </div>

          <div className={styles.customerForm}>
            <input
              className={styles.field}
              placeholder="Full name"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
              autoComplete="name"
            />
            <input
              className={styles.field}
              type="email"
              placeholder="Email"
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
              autoComplete="email"
            />
            <input
              className={styles.field}
              type="tel"
              placeholder="Phone"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              autoComplete="tel"
            />
          </div>

          <div
            className={styles.buyNowWrapper}
            onClick={loading ? undefined : handlePay}
            role="button"
            style={{
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? 'none' : 'auto',
            }}
          >
            <div className={styles.desktop1Inner} />
            <div className={styles.buyNow}>
              {loading ? 'PROCESSING...' : 'PAY NOW'}
            </div>
          </div>

          {message && (
            <p style={{ marginTop: 12, fontSize: 14, color: '#c00' }}>
              {message}
            </p>
          )}
        </div>

        {/* RIGHT: product photo (desktop only) */}
        <div className={styles.checkoutRight}>
          <img
            className={styles.checkoutHero}
            src="/assets/merch/product-4.webp"
            alt={PRODUCT_NAME}
          />
          <div className={styles.checkoutRightMeta}>
            <div className={styles.checkoutRightTitle}>{PRODUCT_NAME}</div>
            <div className={styles.checkoutRightSize}>Size {selectedSize}</div>
            <div className={styles.checkoutRightPrice}>{PRODUCT_PRICE}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ========== PRODUCT PAGE ========== */
  return (
    <>
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
                src="/assets/merch/product-3.webp"
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
                src="/assets/merch/product-2.webp"
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
            {['S', 'M', 'L', 'XL'].map((size) => (
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
                <div className={size === 'XL' ? styles.xl : styles.xs}>
                  {size}
                </div>
              </div>
            ))}
          </div>

          <div
            className={styles.sizeGuide}
            onClick={() => setShowSizeGuide(true)}
            role="button"
          >
            SIZE GUIDE
          </div>
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

            <div className={`${styles.frameChild} ${styles.lineBeforeBuy}`} />
          </div>

          <div
            className={styles.buyNowWrapper}
            onClick={goToCheckout}
            role="button"
          >
            <div className={styles.desktop1Inner} />
            <div className={styles.buyNow}>BUY NOW</div>
          </div>

          <div className={`${styles.frameChild} ${styles.lineAfterBuy}`} />

          {message && (
            <p style={{ marginTop: 12, fontSize: 14, color: '#c00' }}>
              {message}
            </p>
          )}
        </div>
      </div>

      {showSizeGuide && (
        <div
          className={styles.sizeGuideOverlay}
          onClick={() => setShowSizeGuide(false)}
        >
          <aside
            className={styles.sizeGuidePanel}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.sizeGuideClose}
              onClick={() => setShowSizeGuide(false)}
              aria-label="Close size guide"
            >
              ×
            </button>
            <h2 className={styles.sizeGuideTitle}>
              SIZE CHART [ OVERSIZED FIT ]
            </h2>
            <p className={styles.sizeGuideSubtitle}>
              (All measurements in inches)
            </p>
            <div className={styles.sizeTableWrap}>
              <table className={styles.sizeTable}>
                <thead>
                  <tr>
                    <th>SIZE</th>
                    <th>CHEST</th>
                    <th>LENGTH</th>
                    <th>SHOULDER</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>S</td>
                    <td>42</td>
                    <td>27.5&quot;</td>
                    <td>21.5</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>44</td>
                    <td>28</td>
                    <td>22.5</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>46</td>
                    <td>28.5&quot;</td>
                    <td>23.5</td>
                  </tr>
                  <tr>
                    <td>XL</td>
                    <td>48</td>
                    <td>29</td>
                    <td>24.5</td>
                  </tr>
                  <tr>
                    <td>XXL</td>
                    <td>50</td>
                    <td>29.5&quot;</td>
                    <td>25.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <img
              className={styles.sizeBodyImg}
              src="/assets/merch/size-guide-body.png"
              alt="Measurement guide"
            />
          </aside>
        </div>
      )}
    </>
  );
};

export default Desktop1;