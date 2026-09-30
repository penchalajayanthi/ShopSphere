import { useEffect, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Package,
  Truck,
  WalletCards,
} from "lucide-react";

import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { addressStorage } from "../../utils/addressStorage";
import type { Address } from "../../types/address";
import type { Order, PaymentMethod, ShippingAddress } from "../../types/order";
import { storage } from "../../utils/storage";

const CHECKOUT_STORAGE_KEY = "shopsphere_checkout_state";
const ORDERS_KEY = "shopsphere_orders";
const LAST_ORDER_KEY = "shopsphere_last_order";

type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 6;

interface CustomerForm {
  fullName: string;
  email: string;
  phone: string;
}

interface AddressFormData {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface CheckoutState {
  step: CheckoutStep;
  customer: CustomerForm;
  address: AddressFormData;
  selectedAddressId: string;
  deliveryMethod: string;
  paymentMethod: PaymentMethod;
}

const DELIVERY_CHARGE = 49;

const defaultCheckoutState: CheckoutState = {
  step: 1,
  customer: {
    fullName: "",
    email: "",
    phone: "",
  },
  address: {
    address: "",
    city: "",
    state: "",
    pincode: "",
  },
  selectedAddressId: "",
  deliveryMethod: "Standard Delivery",
  paymentMethod: "cod",
};

const steps = [
  { number: 1, title: "Customer", icon: Package },
  { number: 2, title: "Address", icon: MapPin },
  { number: 3, title: "Delivery", icon: Truck },
  { number: 4, title: "Summary", icon: Check },
  { number: 5, title: "Payment", icon: WalletCards },
  { number: 6, title: "Confirmation", icon: Check },
];

function Checkout() {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const user = useAuthStore((state) => state.user);

  const [checkout, setCheckout] = useState<CheckoutState>(() =>
    storage.get<CheckoutState>(
      CHECKOUT_STORAGE_KEY,
      defaultCheckoutState,
    ),
  );

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!user) return;

    const addresses = addressStorage.getByUser(user.id);
    setSavedAddresses(addresses);

    if (checkout.selectedAddressId === "" && addresses.length > 0) {
      const defaultAddress =
        addresses.find((address) => address.isDefault) ?? addresses[0];

      setCheckout((current) => ({
        ...current,
        selectedAddressId: defaultAddress.id,
        customer: {
          ...current.customer,
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          email: user.email,
        },
        address: {
          address: defaultAddress.addressLine,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
        },
      }));
    }
  }, [user]);

  useEffect(() => {
    storage.set(CHECKOUT_STORAGE_KEY, checkout);
  }, [checkout]);

  useEffect(() => {
    if (!user) return;

    setCheckout((current) => ({
      ...current,
      customer: {
        ...current.customer,
        email: current.customer.email || user.email,
      },
    }));
  }, [user]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  );

  const delivery = useMemo(() => {
    if (checkout.deliveryMethod === "Express Delivery") {
      return 99;
    }

    if (subtotal >= 1000) {
      return 0;
    }

    return DELIVERY_CHARGE;
  }, [checkout.deliveryMethod, subtotal]);

  const total = subtotal + delivery;

  if (items.length === 0 && checkout.step !== 6) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Package className="text-[#d97706]" size={32} />
          </div>

          <h1 className="text-2xl font-black text-[#29221b]">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-600">
            Add some products before proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-6 py-3 font-bold text-white"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const updateCheckout = (updates: Partial<CheckoutState>) => {
    setCheckout((current) => ({
      ...current,
      ...updates,
    }));
  };

  const updateCustomer = (updates: Partial<CustomerForm>) => {
    setCheckout((current) => ({
      ...current,
      customer: {
        ...current.customer,
        ...updates,
      },
    }));
  };

  const updateAddress = (updates: Partial<AddressFormData>) => {
    setCheckout((current) => ({
      ...current,
      address: {
        ...current.address,
        ...updates,
      },
    }));
  };

  const handleSavedAddress = (address: Address) => {
    setUseNewAddress(false);

    setCheckout((current) => ({
      ...current,
      selectedAddressId: address.id,
      customer: {
        ...current.customer,
        fullName: address.fullName,
        phone: address.phone,
        email: user?.email ?? current.customer.email,
      },
      address: {
        address: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    }));

    setError("");
  };

  const validateCurrentStep = (): boolean => {
    setError("");

    if (checkout.step === 1) {
      if (!checkout.customer.fullName.trim()) {
        setError("Please enter your full name.");
        return false;
      }

      if (!checkout.customer.email.trim()) {
        setError("Please enter your email address.");
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(checkout.customer.email)) {
        setError("Please enter a valid email address.");
        return false;
      }

      if (!/^[6-9]\d{9}$/.test(checkout.customer.phone)) {
        setError("Please enter a valid 10-digit Indian phone number.");
        return false;
      }
    }

    if (checkout.step === 2) {
      if (!checkout.address.address.trim()) {
        setError("Please enter your address.");
        return false;
      }

      if (!checkout.address.city.trim()) {
        setError("Please enter your city.");
        return false;
      }

      if (!checkout.address.state.trim()) {
        setError("Please enter your state.");
        return false;
      }

      if (!/^\d{6}$/.test(checkout.address.pincode)) {
        setError("Please enter a valid 6-digit pincode.");
        return false;
      }
    }

    if (checkout.step === 3 && !checkout.deliveryMethod) {
      setError("Please select a delivery method.");
      return false;
    }

    if (checkout.step === 5 && !checkout.paymentMethod) {
      setError("Please select a payment method.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (checkout.step < 5) {
      updateCheckout({
        step: (checkout.step + 1) as CheckoutStep,
      });
    }
  };

  const handleBack = () => {
    setError("");
    setPaymentError("");

    if (checkout.step > 1) {
      updateCheckout({
        step: (checkout.step - 1) as CheckoutStep,
      });
    }
  };

  const handlePlaceOrder = () => {
    setPaymentError("");

    if (!checkout.paymentMethod) {
      setPaymentError("Please select a mock payment method.");
      return;
    }

    const orderId = `SS-${Date.now()}`;

    const shippingAddress: ShippingAddress = {
      fullName: checkout.customer.fullName,
      email: checkout.customer.email,
      phone: checkout.customer.phone,
      address: checkout.address.address,
      city: checkout.address.city,
      state: checkout.address.state,
      pincode: checkout.address.pincode,
    };

    const order: Order = {
      id: orderId,

      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      })),

      shippingAddress,

      paymentMethod: checkout.paymentMethod,

      deliveryMethod: checkout.deliveryMethod,

      subtotal,

      delivery,

      total,

      status: "Placed",

      createdAt: new Date().toISOString(),
    };

    const existingOrders = storage.get<Order[]>(ORDERS_KEY, []);

    storage.set(ORDERS_KEY, [order, ...existingOrders]);

    storage.set(LAST_ORDER_KEY, order);
    storage.remove(CHECKOUT_STORAGE_KEY);

    clearCart();

    navigate("/order-success", {
      replace: true,
    });
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (checkout.step === 5) {
      handlePlaceOrder();
      return;
    }

    handleNext();
  };

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Back to cart */}
        <Link
          to="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#d97706] hover:text-[#ec4899]"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#29221b] sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your order securely using our simulated checkout.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 overflow-x-auto rounded-3xl bg-white p-4 shadow-md">
          <div className="flex min-w-[650px] items-center justify-between">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = checkout.step >= item.number;

              return (
                <div
                  key={item.number}
                  className="flex flex-1 items-center"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        active
                          ? "bg-gradient-to-r from-[#f59e0b] to-[#ec4899] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {checkout.step > item.number ? (
                        <Check size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>

                    <span
                      className={`hidden text-sm font-bold sm:block ${
                        active ? "text-[#29221b]" : "text-gray-400"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-3 h-1 flex-1 rounded-full ${
                        checkout.step > item.number
                          ? "bg-[#f59e0b]"
                          : "bg-gray-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main checkout */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-5 shadow-xl sm:p-7"
          >
            {/* STEP 1 */}
            {checkout.step === 1 && (
              <section>
                <h2 className="text-2xl font-black text-[#29221b]">
                  Customer Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your contact details.
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-[#29221b]">
                      Full Name
                    </label>

                    <input
                      value={checkout.customer.fullName}
                      onChange={(event) =>
                        updateCustomer({
                          fullName: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#29221b]">
                      Email
                    </label>

                    <input
                      type="email"
                      value={checkout.customer.email}
                      onChange={(event) =>
                        updateCustomer({
                          email: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#29221b]">
                      Phone
                    </label>

                    <input
                      value={checkout.customer.phone}
                      onChange={(event) =>
                        updateCustomer({
                          phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2 */}
            {checkout.step === 2 && (
              <section>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-[#29221b]">
                      Shipping Address
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Select a saved address or enter a new one.
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewAddress(true);
                        setCheckout((current) => ({
                          ...current,
                          selectedAddressId: "",
                        }));
                      }}
                      className="rounded-xl border border-[#f59e0b] px-4 py-2 text-sm font-bold text-[#d97706]"
                    >
                      + New Address
                    </button>
                  )}
                </div>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && !useNewAddress && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-bold text-[#29221b]">
                      Saved Addresses
                    </h3>

                    {savedAddresses.map((address) => {
                      const selected =
                        checkout.selectedAddressId === address.id;

                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => handleSavedAddress(address)}
                          className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                            selected
                              ? "border-[#f59e0b] bg-orange-50"
                              : "border-gray-100 hover:border-orange-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                selected
                                  ? "border-[#f59e0b] bg-[#f59e0b]"
                                  : "border-gray-300"
                              }`}
                            >
                              {selected && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black text-[#29221b]">
                                  {address.fullName}
                                </p>

                                {address.isDefault && (
                                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-gray-600">
                                {address.addressLine}
                              </p>

                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>

                              <p className="mt-1 text-sm font-semibold text-gray-700">
                                {address.phone}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* New address */}
                {(savedAddresses.length === 0 || useNewAddress) && (
                  <div className="mt-6">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(false)}
                        className="mb-4 text-sm font-bold text-[#8b5cf6]"
                      >
                        ← Use Saved Address
                      </button>
                    )}

                    <div className="grid gap-5">
                      <div>
                        <label className="mb-2 block text-sm font-bold">
                          Address
                        </label>

                        <textarea
                          value={checkout.address.address}
                          onChange={(event) =>
                            updateAddress({
                              address: event.target.value,
                            })
                          }
                          rows={3}
                          className="w-full resize-none rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                          placeholder="House/flat number, street, area"
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-bold">
                            City
                          </label>

                          <input
                            value={checkout.address.city}
                            onChange={(event) =>
                              updateAddress({
                                city: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#f59e0b]"
                            placeholder="City"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold">
                            State
                          </label>

                          <input
                            value={checkout.address.state}
                            onChange={(event) =>
                              updateAddress({
                                state: event.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#f59e0b]"
                            placeholder="State"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-bold">
                            Pincode
                          </label>

                          <input
                            value={checkout.address.pincode}
                            onChange={(event) =>
                              updateAddress({
                                pincode: event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6),
                              })
                            }
                            className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#f59e0b]"
                            placeholder="6-digit pincode"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* STEP 3 */}
            {checkout.step === 3 && (
              <section>
                <h2 className="text-2xl font-black text-[#29221b]">
                  Delivery Method
                </h2>

                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={() =>
                      updateCheckout({
                        deliveryMethod: "Standard Delivery",
                      })
                    }
                    className={`w-full rounded-2xl border-2 p-5 text-left ${
                      checkout.deliveryMethod === "Standard Delivery"
                        ? "border-[#f59e0b] bg-orange-50"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-[#29221b]">
                          Standard Delivery
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Estimated delivery in 4–7 days
                        </p>
                      </div>

                      <span className="font-black text-[#d97706]">
                        {subtotal >= 1000 ? "FREE" : "₹49"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCheckout({
                        deliveryMethod: "Express Delivery",
                      })
                    }
                    className={`w-full rounded-2xl border-2 p-5 text-left ${
                      checkout.deliveryMethod === "Express Delivery"
                        ? "border-[#ec4899] bg-pink-50"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-[#29221b]">
                          Express Delivery
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Estimated delivery in 1–3 days
                        </p>
                      </div>

                      <span className="font-black text-[#ec4899]">
                        ₹99
                      </span>
                    </div>
                  </button>
                </div>
              </section>
            )}

            {/* STEP 4 */}
            {checkout.step === 4 && (
              <section>
                <h2 className="text-2xl font-black text-[#29221b]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 rounded-2xl bg-[#fffaf0] p-4"
                    >
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        className="h-20 w-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-[#29221b]">
                          {item.product.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>

                        <p className="mt-2 font-black text-[#d97706]">
                          ₹
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-purple-50 p-5">
                  <p className="font-black text-purple-900">
                    Delivery Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-purple-800">
                    {checkout.customer.fullName}
                    <br />
                    {checkout.address.address}
                    <br />
                    {checkout.address.city}, {checkout.address.state} -{" "}
                    {checkout.address.pincode}
                    <br />
                    {checkout.customer.phone}
                  </p>
                </div>
              </section>
            )}

            {/* STEP 5 */}
            {checkout.step === 5 && (
              <section>
                <h2 className="text-2xl font-black text-[#29221b]">
                  Mock Payment
                </h2>

                <div className="mt-3 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
                  <strong>Test Mode:</strong> This is a simulated payment
                  environment. Do not enter real card numbers, CVV, bank
                  credentials, or UPI PIN.
                </div>

                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={() =>
                      updateCheckout({
                        paymentMethod: "cod",
                      })
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left ${
                      checkout.paymentMethod === "cod"
                        ? "border-[#f59e0b] bg-orange-50"
                        : "border-gray-100"
                    }`}
                  >
                    <WalletCards size={26} className="text-[#d97706]" />

                    <div>
                      <p className="font-black">Mock Cash on Delivery</p>
                      <p className="text-sm text-gray-500">
                        Simulated COD payment
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCheckout({
                        paymentMethod: "upi",
                      })
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left ${
                      checkout.paymentMethod === "upi"
                        ? "border-[#8b5cf6] bg-purple-50"
                        : "border-gray-100"
                    }`}
                  >
                    <WalletCards size={26} className="text-[#8b5cf6]" />

                    <div>
                      <p className="font-black">Mock UPI</p>
                      <p className="text-sm text-gray-500">
                        Simulated UPI payment
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCheckout({
                        paymentMethod: "card",
                      })
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left ${
                      checkout.paymentMethod === "card"
                        ? "border-[#ec4899] bg-pink-50"
                        : "border-gray-100"
                    }`}
                  >
                    <CreditCard size={26} className="text-[#ec4899]" />

                    <div>
                      <p className="font-black">Mock Card</p>
                      <p className="text-sm text-gray-500">
                        Simulated card payment
                      </p>
                    </div>
                  </button>
                </div>

                {paymentError && (
                  <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {paymentError}
                  </p>
                )}
              </section>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Navigation */}
            {checkout.step < 6 && (
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {checkout.step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-700"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#ef476f] to-[#8b5cf6] px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  {checkout.step === 5 ? "Place Order" : "Continue"}
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </form>

          {/* Order summary sidebar */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-[#29221b]">
              Order Total
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({items.length} items)
                </span>

                <span className="font-bold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>

                <span className="font-bold">
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery.toLocaleString("en-IN")}`}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-black text-[#29221b]">
                    Total
                  </span>

                  <span className="text-xl font-black text-[#d97706]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-bold text-[#d97706]">
                🔒 Safe simulated checkout
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                No real payment information is transmitted or stored.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;