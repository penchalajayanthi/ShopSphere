import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { storage } from "../../utils/storage";
import type { Order } from "../../types/order";

const trackingSteps = [
  {
    status: "Placed",
    title: "Order Placed",
    description:
      "Your order has been successfully placed.",
    icon: CheckCircle2,
  },
  {
    status: "Processing",
    title: "Confirmed",
    description:
      "Your order has been confirmed and is being prepared.",
    icon: Package,
  },
  {
    status: "Shipped",
    title: "Shipped",
    description:
      "Your order has been handed over to the delivery partner.",
    icon: Truck,
  },
  {
    status: "Out for Delivery",
    title: "Out for Delivery",
    description:
      "Your package is on the way to your address.",
    icon: MapPin,
  },
  {
    status: "Delivered",
    title: "Delivered",
    description:
      "Your order has been delivered successfully.",
    icon: CheckCircle2,
  },
];

function getStepIndex(status: Order["status"]) {
  if (status === "Placed") {
    return 0;
  }

  if (status === "Processing") {
    return 1;
  }

  if (status === "Shipped") {
    return 2;
  }

  if (status === "Delivered") {
    return 4;
  }

  if (status === "Cancelled") {
    return -1;
  }

  return 0;
}

function OrderTracking() {
  const { id } = useParams();

  const orders = storage.get<Order[]>(
    "shopsphere_orders",
    [],
  );

  const order = orders.find(
    (item) => item.id === id,
  );

  if (!order) {
    return (
      <main className="min-h-screen bg-[#fffaf0] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <Package
                size={36}
                className="text-[#f59e0b]"
              />
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#29221b]">
              Order Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#8c7a63]">
              We couldn't find an order with this
              order ID.
            </p>

            <Link
              to="/orders"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5"
            >
              <ArrowLeft size={17} />
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentStep =
    getStepIndex(order.status);

  const isCancelled =
    order.status === "Cancelled";

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          to="/orders"
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>

        {/* Header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#f59e0b] via-[#ef476f] to-[#8b5cf6] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-bold text-white/80">
                Order Tracking
              </p>

              <h1 className="mt-1 break-all text-2xl font-black sm:text-3xl">
                #{order.id}
              </h1>

              <p className="mt-2 text-sm text-white/90">
                Placed on{" "}
                {new Date(
                  order.createdAt,
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Truck size={32} />
            </div>

          </div>
        </section>

        {/* Cancelled */}
        {isCancelled ? (
          <section className="mt-6 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4 rounded-2xl bg-red-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Clock3
                  size={22}
                  className="text-red-500"
                />
              </div>

              <div>
                <h2 className="font-black text-red-700">
                  Order Cancelled
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-600">
                  This order has been cancelled and
                  is no longer being processed.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* Tracking Timeline */
          <section className="mt-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-8">
              <h2 className="text-xl font-black text-[#29221b]">
                Delivery Status
              </h2>

              <p className="mt-1 text-sm text-[#8c7a63]">
                Track your order from placement to
                delivery.
              </p>
            </div>

            <div className="relative">

              {/* Desktop/Tablet connecting line */}
              <div className="absolute left-6 top-6 hidden h-[calc(100%-3rem)] w-1 rounded-full bg-orange-100 sm:block" />

              <div className="space-y-7">
                {trackingSteps.map(
                  (
                    step,
                    index,
                  ) => {
                    const Icon =
                      step.icon;

                    const completed =
                      index <=
                      currentStep;

                    const active =
                      index ===
                      currentStep;

                    return (
                      <div
                        key={
                          step.status
                        }
                        className="relative flex gap-4"
                      >

                        <div
                          className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            completed
                              ? "bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-white shadow-md"
                              : "bg-orange-50 text-[#c9b9a5]"
                          }`}
                        >
                          <Icon
                            size={22}
                          />
                        </div>

                        <div className="flex-1 pt-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <h3
                                className={`font-black ${
                                  completed
                                    ? "text-[#29221b]"
                                    : "text-[#9b8b78]"
                                }`}
                              >
                                {
                                  step.title
                                }
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-[#8c7a63]">
                                {
                                  step.description
                                }
                              </p>
                            </div>

                            {active && (
                              <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#d97706]">
                                Current Status
                              </span>
                            )}

                            {completed &&
                              !active && (
                                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                                  Completed
                                </span>
                              )}

                          </div>
                        </div>

                      </div>
                    );
                  },
                )}
              </div>

            </div>
          </section>
        )}

        {/* Order Information */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Products */}
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm lg:col-span-2">

            <h2 className="text-xl font-black text-[#29221b]">
              Ordered Products
            </h2>

            <div className="mt-5 space-y-3">

              {order.items.map(
                (item) => (
                  <div
                    key={
                      item.product.id
                    }
                    className="flex gap-4 rounded-2xl bg-[#fffaf0] p-3"
                  >
                    <img
                      src={
                        item.product
                          .thumbnail
                      }
                      alt={
                        item.product.title
                      }
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-black text-[#29221b]">
                        {
                          item.product
                            .title
                        }
                      </h3>

                      <p className="mt-1 text-xs text-[#8c7a63]">
                        {
                          item.product
                            .brand
                        }{" "}
                        •{" "}
                        {
                          item.product
                            .category
                        }
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-[#6b5b47]">
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </span>

                        <span className="font-black text-[#d97706]">
                          ₹
                          {(
                            item.price *
                            item.quantity
                          ).toFixed(
                            0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ),
              )}

            </div>
          </div>

          {/* Summary */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black text-[#29221b]">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#8c7a63]">
                  Subtotal
                </span>

                <span className="font-bold text-[#29221b]">
                  ₹
                  {order.subtotal.toFixed(
                    0,
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#8c7a63]">
                  Delivery
                </span>

                <span className="font-bold text-[#29221b]">
                  {order.delivery ===
                  0
                    ? "FREE"
                    : `₹${order.delivery.toFixed(
                        0,
                      )}`}
                </span>
              </div>

              <div className="border-t border-orange-100 pt-4">
                <div className="flex justify-between gap-4">
                  <span className="font-black text-[#29221b]">
                    Total
                  </span>

                  <span className="text-xl font-black text-[#d97706]">
                    ₹
                    {order.total.toFixed(
                      0,
                    )}
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-6 rounded-2xl bg-purple-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8b5cf6]">
                Payment Method
              </p>

              <p className="mt-1 font-black capitalize text-[#29221b]">
                {order.paymentMethod ===
                "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod ===
                      "upi"
                    ? "UPI"
                    : "Card"}
              </p>
            </div>

          </div>

        </section>

        {/* Delivery Address */}
        <section className="mt-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
              <MapPin size={21} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#29221b]">
                Delivery Address
              </h2>

              <p className="text-sm text-[#8c7a63]">
                Your order will be delivered here.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#fffaf0] p-5">
            <p className="font-black text-[#29221b]">
              {
                order.shippingAddress
                  .fullName
              }
            </p>

            <p className="mt-2 text-sm leading-6 text-[#6b5b47]">
              {
                order.shippingAddress
                  .address
              }
              <br />
              {
                order.shippingAddress
                  .city
              }
              ,{" "}
              {
                order.shippingAddress
                  .state
              }{" "}
              -{" "}
              {
                order.shippingAddress
                  .pincode
              }
            </p>

            <p className="mt-2 text-sm text-[#8c7a63]">
              Phone:{" "}
              {
                order.shippingAddress
                  .phone
              }
            </p>
          </div>

        </section>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-3 py-8 sm:flex-row sm:justify-center">

          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-[#d97706] transition hover:bg-orange-50"
          >
            <ArrowLeft size={17} />
            All Orders
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-6 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5"
          >
            <ShoppingBagIcon />
            Continue Shopping
          </Link>

        </div>

      </div>
    </main>
  );
}

function ShoppingBagIcon() {
  return <Package size={17} />;
}

export default OrderTracking;