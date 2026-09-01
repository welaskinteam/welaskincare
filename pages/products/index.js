import Head from "next/head";
import { useState } from "react";

import ProductCard from "../../components/ProductCard";
import products from "../../data/products";

import styles from "../../styles/Products.module.css";

import Link from "next/link";


export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState("recommended");
  const [visibleProducts, setVisibleProducts] = useState(8);


  const filters = [
    {
      id: "recommended",
      label: "สินค้าที่แนะนำ",
    },
    {
      id: "category",
      label: "ระบุ",
    },
    {
      id: "brand",
      label: "รีวิว",
    },
  ];


  const displayedProducts = products.slice(
    0,
    visibleProducts
  );


  const handleLoadMore = () => {
    setVisibleProducts((current) => current + 4);
  };


  return (
    <>
      <Head>
        <title>สินค้า | Wela</title>

        <meta
          name="description"
          content="ผลิตภัณฑ์ดูแลผิวที่คัดสรรโดย Wela"
        />
      </Head>


      <main className={styles.page}>

        {/* MARK: Header */}

        <header className={styles.header}>
            <h1 className={styles.logo}>
                Wela
            </h1>
        </header>


        {/* MARK: Banner */}

        <section className={styles.hero}>
          <div className={styles.heroOverlay}>
            <h2>Wela</h2>

            <h3>
              AI-Powered Skincare
              <br />
              Personalised for You
            </h3>

            <p>
              Understand your skin.
              Discover what helps.
            </p>

            <Link
                href="/"
                className={styles.heroButton}
                >
                Start Your Skin Journey
            </Link>
          </div>
        </section>


        {/* MARK: Filters */}

        <section className={styles.filterSection}>
          <div className={styles.filterList}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.id)
                }
                className={`
                  ${styles.filterButton}
                  ${
                    activeFilter === filter.id
                      ? styles.activeFilter
                      : ""
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>


        {/* MARK: Products */}

        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2>
              สินค้าทั้งหมด
            </h2>

            <span>
              {products.length} รายการ
            </span>
          </div>


          <div className={styles.productGrid}>
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>


          {visibleProducts < products.length && (
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={handleLoadMore}
            >
              ดูเพิ่มเติม
            </button>
          )}
        </section>

      </main>
    </>
  );
}
