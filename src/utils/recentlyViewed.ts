import type { Product } from "../types/product";
import { storage } from "./storage";

const RECENTLY_VIEWED_KEY = "shopsphere_recently_viewed";

export const recentlyViewed = {
  getAll(): Product[] {
    return storage.get<Product[]>(
      RECENTLY_VIEWED_KEY,
      [],
    );
  },

  add(product: Product): void {
    const products = recentlyViewed.getAll();

    // Remove the product if it already exists
    const filteredProducts = products.filter(
      (item) => item.id !== product.id,
    );

    // Add the latest product at the beginning
    const updatedProducts = [
      product,
      ...filteredProducts,
    ].slice(0, 8);

    storage.set(
      RECENTLY_VIEWED_KEY,
      updatedProducts,
    );
  },

  remove(productId: number): void {
    const products = recentlyViewed.getAll();

    const updatedProducts = products.filter(
      (product) => product.id !== productId,
    );

    storage.set(
      RECENTLY_VIEWED_KEY,
      updatedProducts,
    );
  },

  clear(): void {
    storage.set(RECENTLY_VIEWED_KEY, []);
  },
};