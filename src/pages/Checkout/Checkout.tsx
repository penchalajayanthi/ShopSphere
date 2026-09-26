import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCartStore } from "../../store/cartStore";
import { storage } from "../../utils/storage";
import type {
  Order,
  PaymentMethod,
  ShippingAddress,
} from "../../types/order";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMethod?: string;
}

const DELIVERY_CHARGE = 49;

function Checkout() {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [deliveryMethod, setDeliveryMethod] =
    useState("Standard Delivery");

  const [errors, setErrors] = useState<FormErrors>({});

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        item.product.price * item.quantity,
      0,
    );
  }, [items]);

  const delivery =
    subtotal >= 1000 ? 0 : DELIVERY_CHARGE;

  const total = subtotal + delivery;

  const updateAddress = (
    field: keyof ShippingAddress,
    value: string,
  ) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!address.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!address.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        address.email,
      )
    ) {
      newErrors.email = "Enter a valid email";
    }

    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(address.phone)) {
      newErrors.phone =
        "Enter a valid 10-digit phone number";
    }

    if (!address.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!address.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!address.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(address.pincode)) {
      newErrors.pincode =
        "Enter a valid 6-digit pincode";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod =
        "Select a payment method";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

 const handlePlaceOrder = (
  event: React.FormEvent<HTMLFormElement>,
) => {
    event.preventDefault();

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setIsPlacingOrder(true);

    const orderId = `ORD-${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: address,
      paymentMethod,
      deliveryMethod,
      subtotal,
      delivery,
      total,
      status: "Placed",
      createdAt: new Date().toISOString(),
    };

    const existingOrders = storage.get<Order[]>(
      "shopsphere_orders",
      [],
    );

    storage.set("shopsphere_orders", [
      newOrder,
      ...existingOrders,
    ]);

    storage.set(
      "shopsphere_last_order",
      newOrder,
    );

    clearCart();

    setTimeout(() => {
      navigate("/order-success", {
        state: {
          orderId,
        },
      });
    }, 500);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <Package
              size={38}
              className="text-orange-600"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#29221b] sm:text-3xl">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add some products before continuing
            to checkout.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#e87500] px-6 py-3 font-bold text-white transition hover:bg-[#d96600]"
          >
            Continue Shopping
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
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-[#e87500]"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </Link>

          <div>
            <h1 className="text-3xl font-extrabold text-[#29221b] sm:text-4xl">
              Checkout
            </h1>

            <p className="mt-2 text-gray-500">
              Complete your order securely.
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* Customer Information */}
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                  <MapPin
                    size={22}
                    className="text-orange-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#29221b]">
                    Delivery Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={address.fullName}
                    onChange={(event) =>
                      updateAddress(
                        "fullName",
                        event.target.value,
                      )
                    }
                    placeholder="Enter your full name"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.fullName
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.fullName && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={address.email}
                    onChange={(event) =>
                      updateAddress(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.email
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={address.phone}
                    onChange={(event) =>
                      updateAddress(
                        "phone",
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="10-digit phone number"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.phone
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    rows={3}
                    value={address.address}
                    onChange={(event) =>
                      updateAddress(
                        "address",
                        event.target.value,
                      )
                    }
                    placeholder="House / Flat number, Street, Area"
                    className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.address
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.address && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={address.city}
                    onChange={(event) =>
                      updateAddress(
                        "city",
                        event.target.value,
                      )
                    }
                    placeholder="Enter city"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.city
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.city && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={address.state}
                    onChange={(event) =>
                      updateAddress(
                        "state",
                        event.target.value,
                      )
                    }
                    placeholder="Enter state"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.state
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.state && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label
                    htmlFor="pincode"
                    className="mb-2 block text-sm font-semibold text-[#29221b]"
                  >
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(event) =>
                      updateAddress(
                        "pincode",
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="6-digit pincode"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                      errors.pincode
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />

                  {errors.pincode && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Delivery Method */}
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                  <Truck
                    size={22}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#29221b]">
                    Delivery Method
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose your preferred delivery option.
                  </p>
                </div>
              </div>

              <div className="space-y-3">

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    deliveryMethod ===
                    "Standard Delivery"
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="Standard Delivery"
                      checked={
                        deliveryMethod ===
                        "Standard Delivery"
                      }
                      onChange={(event) =>
                        setDeliveryMethod(
                          event.target.value,
                        )
                      }
                      className="accent-orange-500"
                    />

                    <div>
                      <p className="font-semibold text-[#29221b]">
                        Standard Delivery
                      </p>

                      <p className="text-xs text-gray-500">
                        Delivery in 4–6 business days
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-orange-600">
                    {delivery === 0
                      ? "FREE"
                      : "₹49"}
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    deliveryMethod ===
                    "Express Delivery"
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="Express Delivery"
                      checked={
                        deliveryMethod ===
                        "Express Delivery"
                      }
                      onChange={(event) =>
                        setDeliveryMethod(
                          event.target.value,
                        )
                      }
                      className="accent-purple-500"
                    />

                    <div>
                      <p className="font-semibold text-[#29221b]">
                        Express Delivery
                      </p>

                      <p className="text-xs text-gray-500">
                        Delivery in 1–2 business days
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-purple-600">
                    ₹99
                  </span>
                </label>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100">
                  <ShieldCheck
                    size={22}
                    className="text-pink-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#29221b]">
                    Payment
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose a simulated payment method.
                  </p>
                </div>
              </div>

              <div className="space-y-3">

                {/* COD */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={
                      paymentMethod === "cod"
                    }
                    onChange={() =>
                      setPaymentMethod("cod")
                    }
                    className="accent-orange-500"
                  />

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                    <Package
                      size={21}
                      className="text-orange-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-[#29221b]">
                      Cash on Delivery
                    </p>

                    <p className="text-xs text-gray-500">
                      Pay when your order arrives.
                    </p>
                  </div>
                </label>

                {/* UPI */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    paymentMethod === "upi"
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={
                      paymentMethod === "upi"
                    }
                    onChange={() =>
                      setPaymentMethod("upi")
                    }
                    className="accent-purple-500"
                  />

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                    <Smartphone
                      size={21}
                      className="text-purple-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-[#29221b]">
                      Mock UPI
                    </p>

                    <p className="text-xs text-gray-500">
                      Simulated UPI payment.
                    </p>
                  </div>
                </label>

                {/* Card */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    paymentMethod === "card"
                      ? "border-pink-400 bg-pink-50"
                      : "border-gray-200 hover:border-pink-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={
                      paymentMethod === "card"
                    }
                    onChange={() =>
                      setPaymentMethod("card")
                    }
                    className="accent-pink-500"
                  />

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100">
                    <CreditCard
                      size={21}
                      className="text-pink-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-[#29221b]">
                      Mock Card
                    </p>

                    <p className="text-xs text-gray-500">
                      Simulated card payment.
                    </p>
                  </div>
                </label>
              </div>

              {errors.paymentMethod && (
                <p className="mt-3 text-xs font-medium text-red-500">
                  {errors.paymentMethod}
                </p>
              )}

              <div className="mt-5 rounded-2xl border border-purple-100 bg-purple-50 p-4">
                <p className="text-xs leading-5 text-purple-700">
                  <strong>Test Mode:</strong> This is a
                  frontend-only simulated payment. Never
                  enter real card numbers, CVV, bank
                  credentials, or UPI PIN.
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <aside className="h-fit lg:sticky lg:top-6">

            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">

              <h2 className="text-xl font-bold text-[#29221b]">
                Order Summary
              </h2>

              {/* Items */}
              <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="h-16 w-16 rounded-xl bg-orange-50 object-contain"
                      />

                      <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e87500] px-1.5 text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-[#29221b]">
                        {item.product.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.product.brand}
                      </p>

                      <p className="mt-1 text-sm font-bold text-orange-600">
                        ₹
                        {(
                          item.product.price *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-dashed border-gray-200" />

              {/* Price */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#29221b]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span className="font-semibold text-[#29221b]">
                    {delivery === 0
                      ? "FREE"
                      : `₹${delivery}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Tax
                  </span>

                  <span className="font-semibold text-green-600">
                    Included
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#29221b]">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-[#e87500]">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e87500] to-[#f59e0b] px-5 py-4 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPlacingOrder ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Place Order
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck
                  size={15}
                  className="text-green-600"
                />
                Secure frontend checkout
              </div>
            </div>

            {/* AI banner */}
            <div className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-6 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-100">
                ✨ ShopSphere AI
              </p>

              <h3 className="mt-2 text-lg font-bold">
                Smart shopping made simple
              </h3>

              <p className="mt-2 text-sm leading-6 text-purple-50">
                Your preferences help us create
                personalized shopping experiences.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;