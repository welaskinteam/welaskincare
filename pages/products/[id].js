import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import products from "../../data/products";
import styles from "../../styles/ProductDetail.module.css";

export default function ProductDetailPage({ product }) {
  const usage = product.category === "Sunscreen"
    ? "ทาเป็นขั้นตอนสุดท้ายของการดูแลผิวในตอนเช้า และทาซ้ำระหว่างวันเมื่อทำกิจกรรมกลางแจ้ง"
    : "ใช้เป็นประจำตามขั้นตอนการดูแลผิว เพื่อช่วยดูแลผิวให้สะอาดและสมดุลยิ่งขึ้น";

  return (
    <>
      <Head>
        <title>{product.name} | Wela</title>
        <meta name="description" content={product.description} />
      </Head>

      <main className={styles.page}>
        <header className={styles.header}>
          <Link href="/products" className={styles.backLink}>
            <span aria-hidden="true">←</span>
            กลับไปดูสินค้าทั้งหมด
          </Link>
          <div className={styles.logo}>Wela</div>
        </header>

        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            สินค้า <span aria-hidden="true">/</span> {product.category}
          </div>

          <section className={styles.detailCard}>
            <div className={styles.imagePanel}>
              <span className={styles.category}>{product.category}</span>
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className={styles.productImage}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>

            <div className={styles.info}>
              <p className={styles.brand}>{product.brand}</p>
              <h1>{product.name}</h1>
              <p className={styles.description}>{product.description}</p>

              <div className={styles.price}>
                ฿{product.price.toFixed(2)} <span>บาท</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.section}>
                <h2>รายละเอียดสินค้า</h2>
                <p>
                  ผลิตภัณฑ์จาก {product.brand} ในหมวด {product.category}
                  เหมาะสำหรับเป็นส่วนหนึ่งของ routine ดูแลผิวในทุกวัน
                </p>
              </div>

              <div className={styles.section}>
                <h2>วิธีใช้เบื้องต้น</h2>
                <p>{usage}</p>
              </div>

              <button type="button" className={styles.orderButton}>
                สนใจสินค้านี้
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export function getStaticPaths() {
  return {
    paths: products.map((product) => ({
      params: { id: String(product.id) },
    })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const product = products.find((item) => String(item.id) === params.id);

  return {
    props: { product },
  };
}
