import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  MapPin,
  CreditCard,
  Truck,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "../../types/order";
import { storage } from "../../utils/storage";

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const savedOrders = storage.get<Order[]>(
      "shopsphere_orders",
      [],
    );

    setOrders(savedOrders);
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId,
    );
  };

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "Placed":
        return "bg-orange-100 text-orange-700";

      case "Processing":
        return "bg-purple-100 text-purple-700";

      case "Shipped":
        return "bg-pink-100 text-pink-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#fff3d6] via-[#fff7ed] to-[#fdf0ff] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Package
                  size={28}
                  className="text-[#d97706]"
                />

                <span className="text-sm font-bold uppercase tracking-wider text-[#d97706]">
                  ShopSphere AI
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-[#29221b] sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                View your previous purchases and track your
                orders in one place.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
              <ShoppingBag
                size={32}
                className="text-[#8b5cf6]"
              />
            </div>
          </div>
        </section>

        {/* Empty State */}
        {orders.length === 0 && (
          <section className="rounded-3xl bg-white px-6 py-16 text-center shadow-lg">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <Package
                size={40}
                className="text-[#f59e0b]"
              />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold text-[#29221b]">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't placed any orders yet. Start
              shopping and your orders will appear here.
            </p>

           <Link
  to="/products"
  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
>
  <ShoppingBag size={18} />
  Start Shopping
</Link>
          </section>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded =
                expandedOrder === order.id;

              const orderDate = new Date(
                order.createdAt,
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <section
                  key={order.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg"
                >
                  {/* Order Header */}
                  <div className="border-b border-orange-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Order ID
                          </p>

                          <p className="mt-1 max-w-[150px] truncate text-sm font-bold text-[#29221b]">
                            {order.id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Order Date
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#29221b]">
                            {orderDate}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Total
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#d97706]">
                            ₹{order.total.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Status
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleOrder(order.id)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-bold text-[#7c3aed] transition hover:bg-purple-100"
                      >
                        {isExpanded
                          ? "Hide Details"
                          : "View Details"}

                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Details */}
                  {isExpanded && (
                    <div className="space-y-6 bg-[#fffdfa] p-5 sm:p-6">
                      {/* Products */}
                      <div>
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-[#29221b]">
                          <ShoppingBag
                            size={20}
                            className="text-[#f59e0b]"
                          />
                          Products
                        </h2>

                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.product.id}
                              className="flex gap-4 rounded-2xl border border-orange-100 bg-white p-3 sm:p-4"
                            >
                              <img
                                src={item.product.thumbnail}
                                alt={item.product.title}
                                className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                              />

                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 text-sm font-bold text-[#29221b] sm:text-base">
                                  {item.product.title}
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                  {item.product.brand}
                                </p>

                                <p className="mt-2 text-xs text-gray-500">
                                  Quantity:{" "}
                                  <span className="font-bold text-[#29221b]">
                                    {item.quantity}
                                  </span>
                                </p>

                                <p className="mt-1 text-sm font-extrabold text-[#d97706]">
                                  ₹
                                  {(
                                    item.price *
                                    item.quantity
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Information Grid */}
                      <div className="grid gap-5 lg:grid-cols-2">
                        {/* Delivery Address */}
                        <div className="rounded-2xl border border-orange-100 bg-white p-5">
                          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#29221b]">
                            <MapPin
                              size={19}
                              className="text-[#ec4899]"
                            />
                            Delivery Address
                          </h2>

                          <div className="mt-4 space-y-1 text-sm text-gray-600">
                            <p className="font-bold text-[#29221b]">
                              {
                                order.shippingAddress
                                  .fullName
                              }
                            </p>

                            <p>
                              {
                                order.shippingAddress
                                  .address
                              }
                            </p>

                            <p>
                              {order.shippingAddress.city},{" "}
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

                            <p>
                              Phone:{" "}
                              {
                                order.shippingAddress
                                  .phone
                              }
                            </p>

                            <p>
                              Email:{" "}
                              {
                                order.shippingAddress
                                  .email
                              }
                            </p>
                          </div>
                        </div>

                        {/* Delivery & Payment */}
                        <div className="rounded-2xl border border-purple-100 bg-white p-5">
                          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#29221b]">
                            <Truck
                              size={19}
                              className="text-[#8b5cf6]"
                            />
                            Delivery & Payment
                          </h2>

                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-gray-500">
                                Delivery
                              </span>

                              <span className="font-bold text-[#29221b]">
                                {order.deliveryMethod}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="flex items-center gap-2 text-gray-500">
                                <CreditCard size={16} />
                                Payment
                              </span>

                              <span className="font-bold uppercase text-[#29221b]">
                                {order.paymentMethod}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-sm">
                              <span className="text-gray-500">
                                Subtotal
                              </span>

                              <span className="font-semibold text-[#29221b]">
                                ₹
                                {order.subtotal.toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-gray-500">
                                Delivery Fee
                              </span>

                              <span className="font-semibold text-[#29221b]">
                                {order.delivery === 0
                                  ? "FREE"
                                  : `₹${order.delivery.toLocaleString(
                                      "en-IN",
                                    )}`}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                              <span className="font-extrabold text-[#29221b]">
                                Total
                              </span>

                              <span className="text-lg font-extrabold text-[#d97706]">
                                ₹
                                {order.total.toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-5">
                        <div className="flex gap-3">
                          <Sparkles
                            size={22}
                            className="mt-0.5 shrink-0 text-[#8b5cf6]"
                          />

                          <div>
                            <h3 className="font-extrabold text-[#29221b]">
                              ShopSphere AI
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              Based on your shopping history,
                              we'll personalize future product
                              recommendations for you.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;