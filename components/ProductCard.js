import Image from "next/image";
import styles from "@/styles/ProductCard.module.css"

export default function ProductCard({ product }) {
  const handleOrder = () => {
    console.log("Order product:", product);

    // อนาคตสามารถเปลี่ยนเป็น
    // window.open(product.url, "_blank");
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
          ฿{product.price.toFixed(2)} บาท
        </p>

        <button
            type="button"
            className={styles.orderButton}
            onClick={handleOrder}
        >
            <Image
                src="/images/icons/shopping-bag.png"
                alt=""
                width={16}
                height={16}
                className={styles.bagIcon}
            />
            สั่งเลย
        </button>
      </div>
    </article>
  );
}