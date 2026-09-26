import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Sparkles,
} from "lucide-react";

import { useCartStore } from "../../store/cartStore";

export default function Cart() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getTotal,
  } = useCartStore();

  const subtotal = getTotal();
  const delivery = 0;
  const total = subtotal + delivery;

  // Empty Cart
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff3d6]">
            <ShoppingCart
              size={38}
              className="text-[#f59e0b]"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-[#29221b]">
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md text-gray-500">
            Looks like you haven't added anything to your cart yet.
            Explore our products and find something you love.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3 font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d97706] hover:shadow-lg"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/products"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#8b5cf6] transition hover:text-[#6d28d9]"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ShoppingCart
                  size={25}
                  className="text-[#f59e0b]"
                />

                <span className="font-bold text-[#f59e0b]">
                  SHOPSPHERE AI
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-[#29221b] sm:text-4xl">
                Your Cart
              </h1>

              <p className="mt-2 text-gray-500">
                {items.length}{" "}
                {items.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>

            <button
              onClick={clearCart}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Clear Cart
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Cart Items */}
          <section className="space-y-4">

            {items.map((item) => (
              <div
                key={item.product.id}
                className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex gap-4">

                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product.id}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#fff7e6] sm:h-32 sm:w-32"
                  >
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </Link>

                  {/* Product Information */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <Link
                          to={`/products/${item.product.id}`}
                          className="line-clamp-2 font-bold text-[#29221b] transition hover:text-[#d97706]"
                        >
                          {item.product.title}
                        </Link>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.product.category}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {item.product.brand}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() =>
                          removeFromCart(item.product.id)
                        }
                        aria-label={`Remove ${item.product.title}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mt-3">
                      <span className="text-lg font-extrabold text-[#d97706]">
                        ₹
                        {item.product.price.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="mt-3 flex items-center justify-between gap-3">

                      <div className="flex items-center rounded-xl border border-orange-200 bg-[#fffaf0]">

                        {/* Decrease */}
                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.product.id
                            )
                          }
                          aria-label="Decrease quantity"
                          className="flex h-9 w-9 items-center justify-center rounded-l-xl text-[#d97706] transition hover:bg-[#fff0d1]"
                        >
                          <Minus size={15} />
                        </button>

                        {/* Quantity */}
                        <span className="flex h-9 min-w-9 items-center justify-center border-x border-orange-200 px-2 text-sm font-bold text-[#29221b]">
                          {item.quantity}
                        </span>

                        {/* Increase */}
                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.product.id
                            )
                          }
                          aria-label="Increase quantity"
                          className="flex h-9 w-9 items-center justify-center rounded-r-xl text-[#d97706] transition hover:bg-[#fff0d1]"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                      {/* Item Total */}
                      <p className="text-right font-extrabold text-[#29221b]">
                        ₹
                        {(
                          item.product.price *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Banner */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] p-5 text-white shadow-md">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white/20 p-2">
                  <Sparkles size={22} />
                </div>

                <div>
                  <h3 className="font-bold">
                    ShopSphere AI Pick
                  </h3>

                  <p className="mt-1 text-sm text-white/90">
                    Your selections are looking great! We'll use
                    your shopping activity to personalize future
                    product suggestions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">

            <h2 className="text-xl font-extrabold text-[#29221b]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              {/* Subtotal */}
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>

                <span className="font-semibold text-[#29221b]">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Delivery */}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>

                <span className="font-semibold text-green-600">
                  Free
                </span>
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">

                  <span className="text-lg font-bold text-[#29221b]">
                    Total
                  </span>

                  <span className="text-2xl font-extrabold text-[#d97706]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>

                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f59e0b] px-5 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d97706] hover:shadow-lg"
            >
              Proceed to Checkout

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {/* Security Info */}
            <div className="mt-4 rounded-xl bg-[#fff8e7] p-4 text-center">
              <p className="text-xs font-medium text-gray-500">
                🔒 Secure checkout
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Your cart is saved automatically
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}