import { useState } from 'react';
import styles from './Desktop1.module.css';

const Desktop1 = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className={styles.desktop1}>
      {/* LEFT: scrollable image column */}
      <div className={styles.leftColumn}>
        <img
          className={styles.exposureExplorers1}
          src="/assets/merch/logo.png"
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
            <div key={size} className={styles.rectangleParent}>
              <div className={styles.groupChild} />
              <div className={size === 'XL' ? styles.xl : styles.xs}>{size}</div>
            </div>
          ))}
        </div>

        <div className={styles.sizeGuide}>SIZE GUIDE</div>
        <div className={styles.desktop1Item} />

        <div className={styles.lineParent}>
          <div className={styles.frameChild} />

          <div
            className={styles.description}
            onClick={() => toggleSection('description')}
          >
            DESCRIPTION                                                  {openSection === 'description' ? '−' : '+'}
          </div>

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

          <div
            className={styles.description}
            onClick={() => toggleSection('care')}
          >
            CARE                                                                  {openSection === 'care' ? '−' : '+'}
          </div>

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

        {/* Buy Now button */}
        <div className={styles.buyNowWrapper}>
          <div className={styles.desktop1Inner} />
          <div className={styles.buyNow}>BUY NOW</div>
        </div>
      </div>
    </div>
  );
};

export default Desktop1;