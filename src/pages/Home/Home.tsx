import {
  ArrowRight,
  Headphones,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { products } from "../../data/products";
import { useCartStore } from "../../store/cartStore";
import RecommendationRail from "../../components/recommendations/RecommendationRail";
function Home() {
  const addToCart = useCartStore(
    (state) => state.addToCart,
  );

  const featuredProducts = products.slice(0, 5);

  return (
    <main className="bg-[#fffaf0]">

      {/* HERO */}
      <section className="overflow-hidden bg-gradient-to-br from-[#fff8df] via-[#fff3d0] to-[#ffe1ad]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:py-14 md:px-6 lg:grid-cols-2 lg:py-20">

          {/* Hero Text */}
          <div className="max-w-xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f3d58b] bg-white/70 px-4 py-2 text-xs font-bold text-[#a56300] shadow-sm">
              <Sparkles
                size={15}
                className="text-[#f59e0b]"
              />
              SMARTER SHOPPING WITH AI
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#29221b] sm:text-5xl lg:text-6xl">
              Your One-Stop
              <br />
              <span className="bg-gradient-to-r from-[#e88900] via-[#f59e0b] to-[#ef7d00] bg-clip-text text-transparent">
                Smart Marketplace
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#6b5b47] sm:text-lg">
              Discover amazing products, find your
              favorites and enjoy a personalized
              shopping experience with ShopSphere AI.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-[#e5c98d] bg-white/70 px-6 py-3.5 font-bold text-[#5c4325] transition hover:bg-white"
              >
                Explore Products
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-xs text-[#7c6a54]">
              <span>✓ Secure Shopping</span>
              <span>✓ Easy Returns</span>
              <span>✓ Fast Delivery</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">

            <div className="absolute -left-5 -top-5 h-24 w-24 rounded-full bg-[#f59e0b]/20 blur-2xl" />

            <div className="absolute -bottom-5 -right-5 h-32 w-32 rounded-full bg-[#8b5cf6]/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border-8 border-white/70 bg-white shadow-2xl">

              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f"
                alt="ShopSphere online shopping"
                className="h-[280px] w-full object-cover sm:h-[380px] lg:h-[460px]"
              />

              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-lg backdrop-blur-md">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#8c7a63]">
                      Personalized shopping
                    </p>

                    <p className="mt-1 font-black text-[#29221b]">
                      Picked specially for you ✨
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#fff1c7] p-3">
                    <Sparkles
                      size={22}
                      className="text-[#f59e0b]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b border-[#eee1c8] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#eee1c8] px-4 py-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-6">

          <div className="flex items-center gap-4 py-4 sm:px-5">
            <div className="rounded-xl bg-[#fff1c7] p-3">
              <Headphones
                size={21}
                className="text-[#e88900]"
              />
            </div>

            <div>
              <h3 className="font-bold text-[#29221b]">
                Responsive
              </h3>

              <p className="text-xs text-[#8c7a63]">
                Customer support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 sm:px-5">
            <div className="rounded-xl bg-[#ede9fe] p-3">
              <ShieldCheck
                size={21}
                className="text-[#8b5cf6]"
              />
            </div>

            <div>
              <h3 className="font-bold text-[#29221b]">
                Secure
              </h3>

              <p className="text-xs text-[#8c7a63]">
                Safe shopping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 sm:px-5">
            <div className="rounded-xl bg-[#ffedd5] p-3">
              <Truck
                size={21}
                className="text-[#f97316]"
              />
            </div>

            <div>
              <h3 className="font-bold text-[#29221b]">
                Shipping
              </h3>

              <p className="text-xs text-[#8c7a63]">
                Fast delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 sm:px-5">
            <div className="rounded-xl bg-[#fce7f3] p-3">
              <RotateCcw
                size={21}
                className="text-[#ec4899]"
              />
            </div>

            <div>
              <h3 className="font-bold text-[#29221b]">
                Easy Returns
              </h3>

              <p className="text-xs text-[#8c7a63]">
                Hassle-free policy
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 md:px-6">

        <div className="mb-7 flex items-end justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              <p className="text-sm font-bold uppercase tracking-wider text-[#c27500]">
                Shop our collection
              </p>
            </div>

            <h2 className="mt-1 text-2xl font-black text-[#29221b] sm:text-3xl">
              Featured Products
            </h2>
          </div>

          <Link
            to="/products"
            className="hidden items-center gap-1 text-sm font-bold text-[#d97706] sm:flex"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

          {featuredProducts.map((product, index) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-[#eee1c8] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              <Link
                to={`/products/${product.id}`}
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-[#fff8e7] to-[#ffe8c2]">

                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-48"
                  />

                  {product.discountPercentage >
                    15 && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#ef476f] px-2.5 py-1 text-[9px] font-black uppercase text-white shadow-sm">
                        Sale
                      </span>
                    )}

                  {index === 0 && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#8b5cf6] px-2.5 py-1 text-[9px] font-black text-white">
                      Popular
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-3 sm:p-4">

                <p className="text-[10px] font-bold uppercase tracking-wider text-[#a6957e]">
                  {product.brand}
                </p>

                <Link
                  to={`/products/${product.id}`}
                >
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold text-[#29221b] transition hover:text-[#d97706] sm:text-base">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <span className="text-[#f59e0b]">
                    ★
                  </span>

                  <span className="font-semibold text-[#6b5b47]">
                    {product.rating}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">

                  <span className="text-sm font-black text-[#29221b] sm:text-base">
                    ₹{product.price}
                  </span>

                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                    className="rounded-lg bg-[#f59e0b] px-2.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#d97706] hover:shadow-md sm:px-3"
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}

        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-bold text-[#d97706]"
          >
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* AI BANNER */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#ec4899] p-7 text-white shadow-xl sm:p-10">

          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#f59e0b]/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Sparkles size={18} />
                SHOPSPHERE AI
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                Find products you'll love.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                Our personalized shopping experience
                helps you discover products based on
                your interests and shopping activity.
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d97706] hover:shadow-xl"
            >
              Explore Now

              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

          </div>
        </div>
        <RecommendationRail
          title="Picked Just for You ✨"
          subtitle="ShopSphere AI selected these products based on your activity."
          limit={4}
        />
      </section>

    </main>
  );
}

export default Home;