import {
  ChevronDown,
  Heart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { products } from "../../data/products";
import { categories } from "../../data/categories";

import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

import Toast from "../../components/ui/Toast";

import type { Product } from "../../types/product";

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "name";

function Products() {
  const [search, setSearch] = useState("");

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product);

    setToastMessage(
      `${product.title} added to cart!`,
    );
  };

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist,
  );

  const isInWishlist = useWishlistStore(
    (state) => state.isInWishlist,
  );

  const handleToggleWishlist = (
    product: Product,
  ) => {
    const alreadyInWishlist =
      isInWishlist(product.id);

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

  const filteredProducts = useMemo(() => {
    let result = [...products];

  
    if (search.trim()) {
      const searchTerm =
        search.toLowerCase().trim();

      result = result.filter((product) => {
        const categoryName =
          categories.find(
            (category) =>
              category.id ===
              product.category,
          )?.name.toLowerCase() ?? "";

        return (
          product.title
            .toLowerCase()
            .includes(searchTerm) ||
          product.brand
            .toLowerCase()
            .includes(searchTerm) ||
          product.category
            .toLowerCase()
            .includes(searchTerm) ||
          categoryName.includes(
            searchTerm,
          ) ||
          product.description
            .toLowerCase()
            .includes(searchTerm)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category ===
          selectedCategory,
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) => a.price - b.price,
        );
        break;

      case "price-high":
        result.sort(
          (a, b) => b.price - a.price,
        );
        break;

      case "rating":
        result.sort(
          (a, b) => b.rating - a.rating,
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.title.localeCompare(b.title),
        );
        break;

      case "featured":
      default:
        break;
    }

    return result;
  }, [
    search,
    selectedCategory,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("featured");
  };

  return (
    <main className="min-h-screen bg-[#fffaf0]">

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() =>
            setToastMessage(null)
          }
        />
      )}

      <section className="border-b border-[#eee1c8] bg-gradient-to-r from-[#fff8e7] via-[#fff4dc] to-[#ffe8f2]">

        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 md:px-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-black tracking-wider text-[#d97706]">
                SHOPSPHERE AI
              </p>

              <p className="mt-2 max-w-2xl text-sm text-[#7c6a54] sm:text-base">
                Explore our collection and
                discover products made for
                your shopping journey.
              </p>
            </div>

          </div>

        </div>

      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6957e]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products, brands or categories..."
              className="w-full rounded-2xl border border-[#eadcc2] bg-white py-3.5 pl-11 pr-11 text-sm text-[#29221b] outline-none transition placeholder:text-[#b3a38d] focus:border-[#f59e0b] focus:ring-4 focus:ring-[#f59e0b]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#8c7a63] transition hover:bg-[#fff1d0] hover:text-[#d97706]"
              >
                <X size={17} />
              </button>
            )}

          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(true)
            }
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#eadcc2] bg-white px-5 py-3.5 text-sm font-bold text-[#5f503f] shadow-sm transition hover:border-[#f59e0b] hover:text-[#d97706] lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters & Sort
          </button>

        </div>
        <div className="mt-5 hidden rounded-2xl border border-[#eadcc2] bg-white p-4 shadow-sm lg:block">

          <div className="flex flex-wrap items-center gap-4">

            {/* Categories */}
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">

              <span className="shrink-0 text-sm font-black text-[#5f503f]">
                Category:
              </span>

              {/* All */}
              <button
                type="button"
                onClick={() =>
                  setSelectedCategory("all")
                }
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === "all"
                    ? "bg-[#f59e0b] text-white shadow-md"
                    : "bg-[#fff7e5] text-[#6b5b47] hover:bg-[#ffedc5]"
                }`}
              >
                All
              </button>

              {/* Categories */}
              {categories.map(
                (category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() =>
                      setSelectedCategory(
                        category.id,
                      )
                    }
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                      selectedCategory ===
                      category.id
                        ? "bg-[#8b5cf6] text-white shadow-md"
                        : "bg-[#f8f3ff] text-[#6b5b47] hover:bg-[#eee5ff]"
                    }`}
                  >
                    <span>
                      {category.icon}
                    </span>

                    <span>
                      {category.name}
                    </span>
                  </button>
                ),
              )}

            </div>

            {/* Sort */}
            <div className="relative shrink-0">

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as SortOption,
                  )
                }
                className="appearance-none rounded-xl border border-[#eadcc2] bg-[#fffaf0] py-2.5 pl-4 pr-10 text-sm font-bold text-[#5f503f] outline-none transition focus:border-[#f59e0b]"
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Highest Rated
                </option>

                <option value="name">
                  Name: A-Z
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8c7a63]"
              />

            </div>

          </div>

        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[9998] lg:hidden">

            {/* Overlay */}
            <button
              type="button"
              aria-label="Close filters"
              onClick={() =>
                setMobileFiltersOpen(false)
              }
              className="absolute inset-0 bg-black/40"
            />

            {/* Drawer */}
            <aside className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#fffaf0] p-5 shadow-2xl">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#d97706]">
                    ShopSphere AI
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#29221b]">
                    Filters & Sort
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileFiltersOpen(false)
                  }
                  aria-label="Close filters"
                  className="rounded-full bg-white p-2.5 text-[#6b5b47] shadow-sm"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Mobile category */}
              <div className="mt-6">

                <p className="mb-3 text-sm font-black text-[#5f503f]">
                  Category
                </p>

                <div className="flex flex-wrap gap-2">

                  {/* All */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        "all",
                      )
                    }
                    className={`rounded-full px-4 py-2.5 text-xs font-bold ${
                      selectedCategory ===
                      "all"
                        ? "bg-[#f59e0b] text-white"
                        : "bg-white text-[#6b5b47]"
                    }`}
                  >
                    All
                  </button>

                  {/* Categories */}
                  {categories.map(
                    (category) => (
                      <button
                        type="button"
                        key={category.id}
                        onClick={() =>
                          setSelectedCategory(
                            category.id,
                          )
                        }
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold ${
                          selectedCategory ===
                          category.id
                            ? "bg-[#8b5cf6] text-white"
                            : "bg-white text-[#6b5b47]"
                        }`}
                      >
                        <span>
                          {category.icon}
                        </span>

                        <span>
                          {category.name}
                        </span>
                      </button>
                    ),
                  )}

                </div>

              </div>

              {/* Mobile sort */}
              <div className="mt-6">

                <p className="mb-3 text-sm font-black text-[#5f503f]">
                  Sort By
                </p>

                <div className="grid grid-cols-1 gap-2">

                  {[
                    {
                      value: "featured",
                      label: "Featured",
                    },
                    {
                      value: "price-low",
                      label: "Price: Low to High",
                    },
                    {
                      value: "price-high",
                      label: "Price: High to Low",
                    },
                    {
                      value: "rating",
                      label: "Highest Rated",
                    },
                    {
                      value: "name",
                      label: "Name: A-Z",
                    },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() =>
                        setSortBy(
                          option.value as SortOption,
                        )
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                        sortBy ===
                        option.value
                          ? "border-[#f59e0b] bg-[#fff0cc] text-[#d97706]"
                          : "border-[#eadcc2] bg-white text-[#6b5b47]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}

                </div>

              </div>

              {/* Drawer buttons */}
              <div className="mt-7 flex gap-3">

                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-xl border border-[#eadcc2] bg-white px-4 py-3 font-bold text-[#6b5b47] transition hover:border-[#ef476f] hover:text-[#ef476f]"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMobileFiltersOpen(
                      false,
                    )
                  }
                  className="flex-1 rounded-xl bg-[#f59e0b] px-4 py-3 font-bold text-white shadow-md transition hover:bg-[#d97706]"
                >
                  Apply Filters
                </button>

              </div>

            </aside>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

          <div className="flex flex-wrap items-center gap-2">

            <p className="text-sm font-bold text-[#6b5b47]">
              Showing{" "}
              <span className="font-black text-[#29221b]">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            {selectedCategory !== "all" && (
              <span className="rounded-full bg-[#eee5ff] px-3 py-1 text-xs font-bold capitalize text-[#7c3aed]">
                {
                  categories.find(
                    (category) =>
                      category.id ===
                      selectedCategory,
                  )?.name
                }
              </span>
            )}

            {search && (
              <span className="max-w-[220px] truncate rounded-full bg-[#ffe7f0] px-3 py-1 text-xs font-bold text-[#db2777]">
                "{search}"
              </span>
            )}

          </div>

          {(search ||
            selectedCategory !==
              "all" ||
            sortBy !== "featured") && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-bold text-[#ef476f] transition hover:text-[#be123c]"
            >
              <X size={14} />
              Clear filters
            </button>
          )}

        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">

            {filteredProducts.map(
              (product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-[#eadcc2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#fff8e8]">

                    <Link
                      to={`/products/${product.id}`}
                      aria-label={`View ${product.title}`}
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Sale badge */}
                    {product.discountPercentage >
                      15 && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#ef476f] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                        Sale
                      </span>
                    )}

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleWishlist(
                          product,
                        )
                      }
                      className={`absolute right-2 top-2 rounded-full p-2.5 shadow-md transition hover:scale-110 ${
                        isInWishlist(
                          product.id,
                        )
                          ? "bg-[#ffe7f0]"
                          : "bg-white"
                      }`}
                      aria-label={
                        isInWishlist(
                          product.id,
                        )
                          ? `Remove ${product.title} from wishlist`
                          : `Add ${product.title} to wishlist`
                      }
                      aria-pressed={isInWishlist(
                        product.id,
                      )}
                    >
                      <Heart
                        size={17}
                        className={
                          isInWishlist(
                            product.id,
                          )
                            ? "fill-[#ef476f] text-[#ef476f]"
                            : "text-[#6b5b47]"
                        }
                      />
                    </button>

                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-4">

                    {/* Brand */}
                    <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#a6957e]">
                      {product.brand}
                    </p>

                    {/* Title */}
                    <Link
                      to={`/products/${product.id}`}
                    >
                      <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold text-[#29221b] transition hover:text-[#d97706] sm:text-base">
                        {product.title}
                      </h2>
                    </Link>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-1 text-xs">

                      <span className="text-[#f59e0b]">
                        ★
                      </span>

                      <span className="font-bold text-[#6b5b47]">
                        {product.rating}
                      </span>

                      <span className="text-[#b8a991]">
                        / 5
                      </span>

                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-center justify-between gap-2">

                      <span className="text-sm font-black text-[#29221b] sm:text-lg">
                        ₹{product.price}
                      </span>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            product,
                          )
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-[#f59e0b] px-2.5 py-2 text-xs font-bold text-white transition hover:bg-[#d97706] hover:shadow-md active:scale-95 sm:px-3"
                      >
                        <ShoppingCart
                          size={15}
                        />

                        <span className="hidden sm:inline">
                          Add
                        </span>
                      </button>

                    </div>

                  </div>

                </article>
              ),
            )}

          </div>
        ) : (

          <div className="mt-6 rounded-3xl border border-dashed border-[#decda9] bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff4d6]">
              <Search
                size={38}
                className="text-[#d8a83d]"
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#29221b] sm:text-2xl">
              No products found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8c7a63]">
              We couldn't find products
              matching your current
              search or filters. Try
              changing your search or
              category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-[#f59e0b] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#d97706]"
            >
              Clear All Filters
            </button>

          </div>
        )}

        <section className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#ec4899] p-6 text-white shadow-xl sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="max-w-2xl">

              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  ✨
                </span>

                <p className="text-xs font-black uppercase tracking-widest text-white/80">
                  ShopSphere AI
                </p>
              </div>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Smart shopping starts
                here
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/85 sm:text-base">
                Explore products, save
                your favorites, and build
                your perfect cart with
                ShopSphere AI.
              </p>

            </div>

            <Link
              to="/wishlist"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#7c3aed] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Heart
                size={17}
                className="fill-[#ec4899]"
              />
              View Wishlist
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}

export default Products;