import { useNavigate } from 'react-router-dom';
import styles from './Wireframe1.module.css';

const Wireframe1 = () => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate('/merch');
  };

  return (
    <div className={styles.wireframe1}>
      <div className={styles.merchIsLiveContainer}>
  <div className={styles.line1}>
    <span className={styles.merch}>Merch </span>
    <span className={styles.is}>is</span>
  </div>
  <div className={styles.line2}>
    <span className={styles.merch}>Live.</span>
  </div>
</div>

      {/* Clickable BUY NOW button */}
      <div
        className={styles.buttonWrapper}
        onClick={handleBuyNow}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleBuyNow()}
      >
        <div className={styles.wireframe1Child} />
        <div className={styles.buyNow}>BUY NOW</div>
      </div>

      <div className={styles.ellipseParent}>
        <div className={styles.frameChild} />
        <div className={styles.frameChild} />
        <div className={styles.frameChild} />
      </div>
    </div>
  );
};

export default Wireframe1;