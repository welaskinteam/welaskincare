import { useMemo, useState } from "react";

import ProductCard from "../../components/ProductCard";
import products from "../../data/products";

import styles from "../../styles/Product.module.css";

export default function ProductPage() {
    const [activeFilter, setActiveFilter] = useState("all");

    const filteredProducts = useMemo(() => {
        if (activeFilter === "all") {
            return products;
        }

        if (activeFilter === "recommended") {
            return products.slice(0, 4);
        }

        if (activeFilter === "brands") {
            return products.filter((_, index) => index % 2 === 0);
        }

        return products;
    }, [activeFilter]);

    return (
        <main className={styles.page}>

            {/* MARK: Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <p className={styles.heroBrand}>
                        Wela
                    </p>

                    <h1>
                        AI-Powered Skincare
                    </h1>

                    <p className={styles.heroText}>
                        Personalized for You
                    </p>

                    <span className={styles.heroDescription}>
                        Understand your skin. Discover what truly works.
                    </span>

                    <button
                        className={styles.heroButton}
                        type="button"
                    >
                        Start Your Skin Journey →
                    </button>
                </div>
            </section>


            {/* MARK: Filter */}
            <section className={styles.filterSection}>
                <div className={styles.filterScroll}>

                    <button
                        className={`${styles.filterButton} ${styles.iconButton}`}
                        type="button"
                        aria-label="Filter"
                    >
                        ☷
                    </button>

                    <button
                        className={`${styles.filterButton} ${
                            activeFilter === "all"
                                ? styles.active
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter("all")
                        }
                        type="button"
                    >
                        สินค้าทั้งหมด
                    </button>

                    <button
                        className={`${styles.filterButton} ${
                            activeFilter === "recommended"
                                ? styles.active
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter("recommended")
                        }
                        type="button"
                    >
                        รู้แบบ
                    </button>

                    <button
                        className={`${styles.filterButton} ${
                            activeFilter === "brands"
                                ? styles.active
                                : ""
                        }`}
                        onClick={() =>
                            setActiveFilter("brands")
                        }
                        type="button"
                    >
                        รีวิว
                    </button>

                </div>
            </section>


            {/* MARK: Products Header */}
            <section className={styles.productSection}>

                <div className={styles.productHeader}>
                    <h2>
                        สินค้าทั้งหมด
                    </h2>

                    <span>
                        {filteredProducts.length} รายการ
                    </span>
                </div>


                {/* MARK: Product Grid */}
                <div className={styles.productGrid}>
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>


                {/* MARK: View More */}
                <button
                    className={styles.viewMoreButton}
                    type="button"
                >
                    ดูเพิ่มเติม
                </button>

            </section>

        </main>
    );
}
