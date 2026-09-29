import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import Toast from "../../components/ui/Toast";
import RecommendationRail from "../../components/recommendations/RecommendationRail";
import ReviewForm from "../../components/reviews/ReviewForm";
import ReviewList from "../../components/reviews/ReviewList";

import { products } from "../../data/products";

import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

import { recentlyViewed } from "../../utils/recentlyViewed";

function ProductDetails() {
  const { id } = useParams();

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [reviewRefreshKey, setReviewRefreshKey] =
    useState(0);

  const product = products.find(
    (item) => item.id === Number(id),
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
   * WISHLIST
   * =====================================
   */
  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore(
    (state) =>
      product
        ? state.isInWishlist(product.id)
        : false,
  );

  /*
   * =====================================
   * ADD TO CART
   * =====================================
   */
  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    addToCart(product);

    setToastMessage(
      `${product.title} added to cart!`,
    );
  };

  /*
   * =====================================
   * TOGGLE WISHLIST
   * =====================================
   */
  const handleToggleWishlist = () => {
    if (!product) {
      return;
    }

    const alreadyInWishlist =
      isInWishlist;

    toggleWishlist(product);

    if (alreadyInWishlist) {
      setToastMessage(
        `${product.title} removed from wishlist.`,
      );
    } else {
      setToastMessage(
        `${product.title} added to wishlist!`,
      );
    }
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

  /*
   * =====================================
   * SAVE PRODUCT TO RECENTLY VIEWED
   * =====================================
   */
  useEffect(() => {
    if (!product) {
      return;
    }

    recentlyViewed.add(product);
  }, [product]);

  /*
   * =====================================
   * PRODUCT NOT FOUND
   * =====================================
   */
  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf0] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#29221b]">
            Product not found
          </h1>

          <p className="mt-2 text-gray-500">
            The product you're looking for doesn't exist.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] px-5 py-3 font-bold text-white transition hover:bg-[#d97706]"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  /*
   * =====================================
   * CALCULATE DISCOUNTED PRICE
   * =====================================
   */
  const discountedPrice =
    product.price -
    (product.price *
      product.discountPercentage) /
      100;

  return (
    <main className="min-h-screen bg-[#fffaf0]">

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

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Back button */}
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5cf6] transition hover:text-[#d97706]"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        {/* =====================================
            PRODUCT SECTION
        ====================================== */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* =====================================
              PRODUCT IMAGE
          ====================================== */}
          <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="relative overflow-hidden rounded-2xl bg-[#fff7e6]">

              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-[320px] w-full object-contain transition duration-500 hover:scale-105 sm:h-[430px]"
              />

              {/* Discount */}
              {product.discountPercentage > 0 && (
                <div className="absolute left-4 top-4 rounded-full bg-[#ef476f] px-3 py-1.5 text-sm font-bold text-white shadow">
                  {Math.round(
                    product.discountPercentage,
                  )}
                  % OFF
                </div>
              )}

              {/* Wishlist Image Button */}
              <button
                type="button"
                onClick={
                  handleToggleWishlist
                }
                aria-label={
                  isInWishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={isInWishlist}
                className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition duration-200 hover:scale-110 ${
                  isInWishlist
                    ? "ring-2 ring-[#ef476f]/30"
                    : ""
                }`}
              >
                <Heart
                  size={22}
                  className={
                    isInWishlist
                      ? "fill-[#ef476f] text-[#ef476f]"
                      : "text-[#6b5b47]"
                  }
                />
              </button>

            </div>
          </div>

          {/* =====================================
              PRODUCT INFORMATION
          ====================================== */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#8b5cf6]">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="text-3xl font-extrabold leading-tight text-[#29221b] sm:text-4xl">
              {product.title}
            </h1>

            {/* Brand */}
            <p className="mt-3 text-sm font-medium text-gray-500">
              Brand:{" "}
              <span className="font-bold text-[#29221b]">
                {product.brand}
              </span>
            </p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-[#fff1c7] px-3 py-1.5">
                <span className="text-lg">
                  ★
                </span>

                <span className="font-bold text-[#29221b]">
                  {product.rating}
                </span>
              </div>

              <span className="text-sm text-gray-500">
                Customer rating
              </span>
            </div>

            {/* Description */}
            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-end gap-3">

              <span className="text-3xl font-extrabold text-[#d97706]">
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
                <span className="pb-1 text-lg text-gray-400 line-through">
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

              {product.discountPercentage > 0 && (
                <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                  Save{" "}
                  {product.discountPercentage.toFixed(
                    0,
                  )}
                  %
                </span>
              )}

            </div>

            {/* Stock */}
            <div className="mt-5">
              {product.stock > 0 ? (
                <span className="font-semibold text-green-600">
                  ✓ In stock (
                  {product.stock} available)
                </span>
              ) : (
                <span className="font-semibold text-red-500">
                  Out of stock
                </span>
              )}
            </div>

            {/* =====================================
                BUTTONS
            ====================================== */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-6 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart
                  size={19}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                {product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={
                  handleToggleWishlist
                }
                aria-label={
                  isInWishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={isInWishlist}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5 font-bold transition-all duration-200 ${
                  isInWishlist
                    ? "border-[#ef476f] bg-pink-50 text-[#ef476f] shadow-sm"
                    : "border-orange-200 bg-white text-[#29221b] hover:border-[#ef476f] hover:bg-pink-50 hover:text-[#ef476f]"
                }`}
              >
                <Heart
                  size={19}
                  className="transition-transform duration-200"
                  fill={
                    isInWishlist
                      ? "currentColor"
                      : "none"
                  }
                />

                {isInWishlist
                  ? "Wishlisted"
                  : "Add to Wishlist"}
              </button>

            </div>

            {/* Wishlist shortcut */}
            {isInWishlist && (
              <Link
                to="/wishlist"
                className="mt-3 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#ec4899] transition hover:text-[#8b5cf6]"
              >
                <Heart
                  size={16}
                  className="fill-current"
                />
                View your wishlist
              </Link>
            )}

            {/* =====================================
                AI RECOMMENDATION
            ====================================== */}
            <div className="mt-7 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] p-5 text-white shadow-md">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Sparkles size={21} />
                </div>

                <div>
                  <h3 className="font-bold">
                    AI Recommendation
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-white/90">
                    This product may be a great match
                    for your shopping preferences.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* =====================================
            RECOMMENDATION RAIL
        ====================================== */}
        <RecommendationRail
          currentProduct={product}
          title="You May Also Like"
          subtitle="AI-powered recommendations based on this product."
          limit={4}
        />

        {/* =====================================
            REVIEWS
        ====================================== */}
        <section className="mt-12 space-y-6">

          <ReviewForm
            productId={product.id}
            onReviewAdded={() =>
              setReviewRefreshKey(
                (current) => current + 1,
              )
            }
          />

          <ReviewList
            productId={product.id}
            refreshKey={reviewRefreshKey}
          />

        </section>

      </div>
    </main>
  );
}

export default ProductDetails;
