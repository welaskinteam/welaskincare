import products from "../data/products";

const FALLBACK_CATEGORIES = [
  "Cleanser",
  "Moisturizer",
  "Serum",
  "Sunscreen",
];

export function getFallbackProducts() {
  return FALLBACK_CATEGORIES
    .map((category) => products.find((product) => product.category === category))
    .filter(Boolean)
    .map((product) => ({
      ...product,
      recommendation_focus: product.description,
    }));
}

export function getDisplayProducts(recommendations) {
  return Array.isArray(recommendations) && recommendations.length > 0
    ? recommendations
    : getFallbackProducts();
}
