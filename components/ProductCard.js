import Image from "next/image";
import styles from "@/styles/ProductCard.module.css"

export default function ProductCard({ product }) {
  const handleOrder = () => {
    if (!product.url) {
      return;
    }

    window.open(product.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className={styles.card}>
      <div className={styles.category}>
        {product.category}
      </div>

      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, 300px"
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>
          {product.name}
        </h3>

        <p className={styles.description}>
          {product.description}
        </p>

        <p className={styles.price}>
            ฿{product.price.toLocaleString("th-TH")} บาท
        </p>

        <button
            type="button"
            className={styles.orderButton}
            onClick={handleOrder}
        >
          <svg className={styles.bagIcon} width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.77978 5.86133V2.86133C8.77978 2.19829 8.51638 1.5624 8.04754 1.09356C7.5787 0.62472 6.94282 0.361328 6.27978 0.361328C5.61673 0.361328 4.98085 0.62472 4.51201 1.09356C4.04317 1.5624 3.77978 2.19829 3.77978 2.86133V5.86133M11.3504 4.53266L12.1924 12.5327C12.2391 12.976 11.8924 13.3613 11.4464 13.3613H1.11311C1.00791 13.3614 0.903872 13.3394 0.807741 13.2967C0.71161 13.254 0.625541 13.1915 0.555124 13.1134C0.484707 13.0352 0.431518 12.9431 0.399011 12.8431C0.366505 12.743 0.355408 12.6373 0.366442 12.5327L1.20911 4.53266C1.22855 4.34837 1.31553 4.1778 1.45328 4.05383C1.59103 3.92987 1.76979 3.86129 1.95511 3.86133H10.6044C10.9884 3.86133 11.3104 4.15133 11.3504 4.53266ZM4.02978 5.86133C4.02978 5.92763 4.00344 5.99122 3.95655 6.03811C3.90967 6.08499 3.84608 6.11133 3.77978 6.11133C3.71347 6.11133 3.64988 6.08499 3.603 6.03811C3.55611 5.99122 3.52978 5.92763 3.52978 5.86133C3.52978 5.79502 3.55611 5.73144 3.603 5.68455C3.64988 5.63767 3.71347 5.61133 3.77978 5.61133C3.84608 5.61133 3.90967 5.63767 3.95655 5.68455C4.00344 5.73144 4.02978 5.79502 4.02978 5.86133ZM9.02978 5.86133C9.02978 5.92763 9.00344 5.99122 8.95655 6.03811C8.90967 6.08499 8.84608 6.11133 8.77978 6.11133C8.71347 6.11133 8.64988 6.08499 8.603 6.03811C8.55611 5.99122 8.52978 5.92763 8.52978 5.86133C8.52978 5.79502 8.55611 5.73144 8.603 5.68455C8.64988 5.63767 8.71347 5.61133 8.77978 5.61133C8.84608 5.61133 8.90967 5.63767 8.95655 5.68455C9.00344 5.73144 9.02978 5.79502 9.02978 5.86133Z" stroke="white" stroke-width="0.724" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
            สั่งเลย
        </button>
      </div>
    </article>
  );
}
