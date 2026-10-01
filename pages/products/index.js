import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import ProductCard from "../../components/ProductCard";

import styles from "../../styles/Products.module.css";

import Link from "next/link";


export default function ProductsPage() {
  const [products, setProducts] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleProducts, setVisibleProducts] = useState(8);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Unable to load products: ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];

        setProducts(
          items.map((product) => ({
            ...product,
            image:
              product.image ||
              product.image_url ||
              "/images/products/unknow.png",
            url: product.url || product.product_url || "",
            price: Number(product.price) || 0,
          })),
        );
      } catch (error) {
        console.error("Unable to load products:", error);
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  const loadedProducts = products || [];

  const filters = useMemo(() => {
    const categories = [
      ...new Set(loadedProducts.map((product) => product.category)),
    ];

    return [
      { id: "all", label: "All Skincare" },
      ...categories.map((category) => ({
        id: category,
        label: category,
      })),
    ];
  }, [loadedProducts]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return loadedProducts;
    }

    return loadedProducts.filter((product) => product.category === activeFilter);
  }, [activeFilter, loadedProducts]);

  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setVisibleProducts(8);
  };


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
                  handleFilterChange(filter.id)
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
              {products === null ? "กำลังโหลด..." : `${filteredProducts.length} รายการ`}
            </span>
          </div>


          {products === null ? (
            <p>กำลังโหลดสินค้า...</p>
          ) : filteredProducts.length === 0 ? (
            <p>ไม่พบสินค้าในหมวดหมู่นี้</p>
          ) : (
            <div className={styles.productGrid}>
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}


          {visibleProducts < filteredProducts.length && (
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
