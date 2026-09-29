import {
  Heart,
  ShoppingBag,
  Trash2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import Toast from "../../components/ui/Toast";

import {
  useWishlistStore,
} from "../../store/wishlistStore";

import {
  useCartStore,
} from "../../store/cartStore";

import type { Product } from "../../types/product";

import RecommendationRail from "../../components/recommendations/RecommendationRail";

function Wishlist() {
  /*
   * =====================================
   * WISHLIST
   * =====================================
   */
  const items = useWishlistStore(
    (state) => state.items,
  );

  const removeFromWishlist =
    useWishlistStore(
      (state) =>
        state.removeFromWishlist,
    );

  const clearWishlist =
    useWishlistStore(
      (state) => state.clearWishlist,
    );

  /*
   * =====================================
   * CART
   * =====================================
   */
  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  /*
   * =====================================
   * TOAST
   * =====================================
   */
  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  /*
   * =====================================
   * ADD TO CART
   * =====================================
   */
  const handleAddToCart = (
    product: Product,
  ) => {
    addToCart(product);

    setToastMessage(
      `${product.title} added to cart!`,
    );
  };

  /*
   * =====================================
   * REMOVE FROM WISHLIST
   * =====================================
   */
  const handleRemoveFromWishlist = (
    product: Product,
  ) => {
    removeFromWishlist(product.id);

    setToastMessage(
      `${product.title} removed from wishlist.`,
    );
  };

  /*
   * =====================================
   * CLEAR WISHLIST
   * =====================================
   */
  const handleClearWishlist = () => {
    clearWishlist();

    setToastMessage(
      "All products removed from wishlist.",
    );
  };

  /*
   * =====================================
   * AUTOMATICALLY HIDE TOAST
   * =====================================
   */
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-8 sm:px-6 lg:px-8">

      {/* =====================================
          TOAST
      ====================================== */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() =>
            setToastMessage(null)
          }
        />
      )}

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#fff0f6] via-[#fff7ed] to-[#f5f0ff] p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <Heart
                  size={26}
                  className="fill-[#ec4899] text-[#ec4899]"
                />

                <span className="text-sm font-bold uppercase tracking-wider text-[#ec4899]">
                  ShopSphere AI
                </span>

              </div>

              <h1 className="text-3xl font-extrabold text-[#29221b] sm:text-4xl">
                My Wishlist
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                Save your favorite products and come back
                to them whenever you want.
              </p>

            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">

              <Heart
                size={32}
                className="fill-[#ec4899] text-[#ec4899]"
              />

            </div>

          </div>

        </section>

        {/* =====================================
            EMPTY WISHLIST
        ====================================== */}
        {items.length === 0 && (
          <section className="rounded-3xl bg-white px-6 py-16 text-center shadow-lg">

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100">

              <Heart
                size={46}
                className="text-[#ec4899]"
              />

            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-[#29221b]">
              Your Wishlist is Empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't added any products to your wishlist
              yet. Explore our products and save your favorites.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <ShoppingBag size={18} />
              Explore Products
            </Link>

          </section>
        )}

        {/* =====================================
            WISHLIST PRODUCTS
        ====================================== */}
        {items.length > 0 && (
          <>

            {/* Top Actions */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm font-semibold text-gray-600">
                {items.length}{" "}
                {items.length === 1
                  ? "product"
                  : "products"}{" "}
                saved
              </p>

              <button
                type="button"
                onClick={handleClearWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50"
              >
                <Trash2 size={17} />
                Clear Wishlist
              </button>

            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

              {items.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* =====================================
                      IMAGE
                  ====================================== */}
                  <div className="relative aspect-square overflow-hidden bg-[#fff7ed]">

                    <Link
                      to={`/products/${product.id}`}
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Remove Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFromWishlist(
                          product,
                        )
                      }
                      aria-label={`Remove ${product.title} from wishlist`}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
                    >
                      <Heart
                        size={19}
                        className="fill-[#ec4899] text-[#ec4899]"
                      />
                    </button>

                    {/* Discount */}
                    {product.discountPercentage >
                      0 && (
                      <span className="absolute bottom-2 left-2 rounded-lg bg-[#f59e0b] px-2 py-1 text-[10px] font-extrabold text-white">
                        {Math.round(
                          product.discountPercentage,
                        )}
                        % OFF
                      </span>
                    )}

                  </div>

                  {/* =====================================
                      PRODUCT CONTENT
                  ====================================== */}
                  <div className="p-3 sm:p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b5cf6] sm:text-xs">
                      {product.category}
                    </p>

                    <Link
                      to={`/products/${product.id}`}
                    >
                      <h2 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold text-[#29221b] transition hover:text-[#d97706]">
                        {product.title}
                      </h2>
                    </Link>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-1">

                      <span className="text-xs font-bold text-[#f59e0b]">
                        ★
                      </span>

                      <span className="text-xs font-semibold text-gray-600">
                        {product.rating}
                      </span>

                    </div>

                    {/* Price */}
                    <div className="mt-3">

                      <span className="text-lg font-extrabold text-[#d97706]">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN",
                        )}
                      </span>

                    </div>

                    {/* Add to Cart */}
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart(
                          product,
                        )
                      }
                      disabled={
                        product.stock <= 0
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    >
                      <ShoppingBag size={16} />

                      {product.stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>

                  </div>

                </article>
              ))}

            </div>

            {/* =====================================
                AI BANNER
            ====================================== */}
            <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#ec4899] p-6 text-white shadow-lg sm:p-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                    <Sparkles size={25} />
                  </div>

                  <div>

                    <h2 className="text-lg font-extrabold sm:text-xl">
                      ShopSphere AI Recommendations
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-white/90">
                      Your wishlist helps ShopSphere AI
                      understand your interests and personalize
                      your shopping experience.
                    </p>

                  </div>

                </div>

                <Link
                  to="/products"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#7c3aed] transition hover:bg-gray-50"
                >
                  Continue Shopping
                  <ArrowRight size={17} />
                </Link>

              </div>

            </section>

          </>
        )}

        {/* =====================================
            RECOMMENDATIONS
        ====================================== */}
        <RecommendationRail
          title="More Products You May Like"
          subtitle="AI recommendations based on your wishlist."
          limit={4}
        />

      </div>
    </main>
  );
}

export default Wishlist;


