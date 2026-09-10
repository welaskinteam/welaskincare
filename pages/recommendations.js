import Head from "next/head";
import { useEffect, useState } from "react";

import ProductCard from "../components/ProductCard";
import styles from "../styles/Recommendations.module.css";

export default function RecommendationsPage() {
  const [recommendedProducts, setRecommendedProducts] = useState(null);

  useEffect(() => {
    try {
      const storedRecommendations = sessionStorage.getItem(
        "wela-product-recommendations",
      );
      const parsedRecommendations = storedRecommendations
        ? JSON.parse(storedRecommendations)
        : [];

      setRecommendedProducts(
        Array.isArray(parsedRecommendations)
          ? parsedRecommendations.map((product) => ({
              ...product,
              image:
                product.image ||
                product.image_url ||
                "/images/products/unknow.png",
              url: product.url || product.product_url || "",
              price: Number(product.price) || 0,
            }))
          : [],
      );
    } catch (error) {
      console.error("Unable to load product recommendations:", error);
      setRecommendedProducts([]);
    }
  }, []);

  const productGroups = (recommendedProducts || []).reduce((groups, product) => {
    const category = product.category || "Skincare";
    const existingGroup = groups.find((group) => group.category === category);

    if (existingGroup) {
      existingGroup.products.push(product);
    } else {
      groups.push({ category, title: category, products: [product] });
    }

    return groups;
  }, []);

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

          {recommendedProducts === null ? (
            <p>กำลังโหลดผลิตภัณฑ์แนะนำ...</p>
          ) : productGroups.length === 0 ? (
            <p>ไม่พบผลิตภัณฑ์แนะนำจากผลวิเคราะห์นี้</p>
          ) : (
            <div className={styles.groups}>
              {productGroups.map((group) => (
                <section key={group.category} className={styles.group}>
                  <div className={styles.groupHeader}>
                    <h2>{group.title}</h2>
                    <span>{group.products.length} รายการ</span>
                  </div>

                  <div className={styles.productGrid}>
                    {group.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
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
