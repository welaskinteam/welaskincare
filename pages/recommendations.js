import Head from "next/head";

import ProductCard from "../components/ProductCard";
import products from "../data/products";
import styles from "../styles/Recommendations.module.css";

const recommendedProductIds = [1, 2, 3, 5, 6];

const productGroups = [
  { category: "Cleanser", title: "ทำความสะอาด" },
  { category: "Moisturizer", title: "ให้ความชุ่มชื้น" },
  { category: "Sunscreen", title: "กันแดด" },
];

export default function RecommendationsPage() {
  const recommendedProducts = products.filter((product) =>
    recommendedProductIds.includes(product.id),
  );

  return (
    <>
      <Head>
        <title>Skincare Recommend | Wela</title>
        <meta
          name="description"
          content="ชุดสกินแคร์ที่เหมาะกับคุณจาก Wela"
        />
      </Head>

      <main className={styles.page}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>Skincare Recommend</h1>
            <p>ชุดสกินแคร์ที่เหมาะกับคุณ</p>
          </header>

          <section className={styles.resultCard}>
            <strong>ผลลัพธ์ :</strong>
            <p>
              เราเห็นว่าคุณต้องการดูแลผิวให้ดูดีขึ้นเพราะส่วนล่างของใบหน้าคุณ
              <br />
              มีลักษณะจุดสิวขึ้น เมื่อผิวของคุณเริ่มมีสิวขึ้นบริเวณนี้
              <br />
              โดยเฉพาะบริเวณส่วนล่างของใบหน้าซึ่งไวต่อแรงเสียดสี
            </p>
          </section>

          <div className={styles.groups}>
            {productGroups.map((group) => {
              const groupProducts = recommendedProducts.filter(
                (product) => product.category === group.category,
              );

              return (
                <section key={group.category} className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h2>{group.title}</h2>
                    <span>{groupProducts.length} รายการ</span>
                  </div>

                  <div className={styles.productGrid}>
                    {groupProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <footer className={styles.footerVisual}>
          <img
            src="/images/skin-analysis/bottom-wave.png"
            alt=""
            aria-hidden="true"
          />
          <p>
            Your Skin Has More to Tell.
            <br />
            Let Wela help you understand it.
          </p>
        </footer>
      </main>
    </>
  );
}
