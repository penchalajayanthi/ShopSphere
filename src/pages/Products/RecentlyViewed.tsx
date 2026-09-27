import { useEffect, useState } from "react";
import {
  Eye,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Product } from "../../types/product";

import { recentlyViewed } from "../../utils/recentlyViewed";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>(
    [],
  );

  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore(
    (state) => state.isInWishlist,
  );

  useEffect(() => {
    setProducts(recentlyViewed.getAll());
  }, []);

  const handleRemove = (productId: number) => {
    recentlyViewed.remove(productId);

    setProducts(
      recentlyViewed.getAll(),
    );
  };

  const handleClear = () => {
    recentlyViewed.clear();
    setProducts([]);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-white">
              <Eye size={21} />
            </div>

            <h2 className="text-2xl font-extrabold text-[#29221b]">
              Recently Viewed
            </h2>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Products you've viewed recently.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-100"
        >
          <Trash2 size={16} />
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const discountedPrice =
            product.price -
            (product.price *
              product.discountPercentage) /
              100;

          return (
            <article
              key={product.id}
              className="group relative overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Remove */}
              <button
                type="button"
                onClick={() =>
                  handleRemove(product.id)
                }
                aria-label={`Remove ${product.title} from recently viewed`}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() =>
                  toggleWishlist(product)
                }
                aria-label={
                  isInWishlist(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
              >
                <Heart
                  size={17}
                  className={
                    isInWishlist(product.id)
                      ? "fill-[#ef476f] text-[#ef476f]"
                      : "text-gray-500"
                  }
                />
              </button>

              {/* Image */}
              <Link
                to={`/products/${product.id}`}
                className="block overflow-hidden bg-[#fff7e6]"
              >
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-48 w-full object-contain p-5 transition duration-500 group-hover:scale-110"
                />
              </Link>

              <div className="p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8b5cf6]">
                  {product.category}
                </p>

                <Link
                  to={`/products/${product.id}`}
                >
                  <h3 className="line-clamp-2 min-h-[48px] font-bold text-[#29221b] transition hover:text-[#d97706]">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[#d97706]">
                    ₹
                    {discountedPrice.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </span>

                  {product.discountPercentage > 0 && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹
                      {product.price.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-[#f59e0b]">
                    ★
                  </span>

                  <span className="text-xs font-bold text-gray-600">
                    {product.rating}
                  </span>

                  <span className="text-xs text-gray-400">
                    •
                  </span>

                  <span className="text-xs text-gray-500">
                    {product.stock > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() =>
                    addToCart(product)
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingCart size={17} />

                  {product.stock > 0
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RecentlyViewed;