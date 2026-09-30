import { create } from "zustand";

import { products as defaultProducts } from "../data/products";

import type { Product } from "../types/product";

const PRODUCTS_KEY = "shopsphere_products";
const OLD_ADMIN_PRODUCTS_KEY = "shopsphere_admin_products";

interface ProductStore {
  items: Product[];

  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;

  setProducts: (products: Product[]) => void;
  resetProducts: () => void;
}

const loadProducts = (): Product[] => {
  try {
  
    const savedProducts = localStorage.getItem(PRODUCTS_KEY);

    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    const oldAdminProducts = localStorage.getItem(
      OLD_ADMIN_PRODUCTS_KEY,
    );

    if (oldAdminProducts) {
      const parsedOld = JSON.parse(oldAdminProducts);

      if (Array.isArray(parsedOld)) {
        localStorage.setItem(
          PRODUCTS_KEY,
          JSON.stringify(parsedOld),
        );

        return parsedOld;
      }
    }
  } catch {

  }

  return defaultProducts;
};

const saveProducts = (items: Product[]) => {
  localStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(items),
  );
};

export const useProductStore = create<ProductStore>((set) => ({
  items: loadProducts(),

  addProduct: (product) =>
    set((state) => {
      const updated = [...state.items, product];

      saveProducts(updated);

      return {
        items: updated,
      };
    }),

  updateProduct: (product) =>
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === product.id ? product : item,
      );

      saveProducts(updated);

      return {
        items: updated,
      };
    }),

  deleteProduct: (productId) =>
    set((state) => {
      const updated = state.items.filter(
        (item) => item.id !== productId,
      );

      saveProducts(updated);

      return {
        items: updated,
      };
    }),

  setProducts: (products) => {
    saveProducts(products);

    set({
      items: products,
    });
  },

  resetProducts: () => {
    saveProducts(defaultProducts);

    set({
      items: defaultProducts,
    });
  },
}));