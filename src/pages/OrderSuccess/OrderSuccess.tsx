import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  ClipboardList,
  Sparkles,
} from "lucide-react";

import { storage } from "../../utils/storage";
import type { Order } from "../../types/order";

interface LocationState {
  orderId?: string;
}

function OrderSuccess() {
  const location = useLocation();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const state = location.state as LocationState | null;

    const savedOrder = storage.get<Order | null>(
      "shopsphere_last_order",
      null,
    );

    if (savedOrder) {
      setOrder(savedOrder);
    } else if (state?.orderId) {
      const orders = storage.get<Order[]>(
        "shopsphere_orders",
        [],
      );

      const foundOrder = orders.find(
        (item) => item.id === state.orderId,
      );

      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [location.state]);

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff7ed] via-white to-[#fdf4ff] shadow-xl">
          <div className="px-5 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-md">
              <CheckCircle
                size={46}
                className="text-green-600"
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <Sparkles
                size={20}
                className="text-[#f59e0b]"
              />

              <h1 className="text-3xl font-extrabold text-[#29221b] sm:text-4xl">
                Order Placed Successfully!
              </h1>

              <Sparkles
                size={20}
                className="text-[#ec4899]"
              />
            </div>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Thank you for shopping with ShopSphere AI.
              Your order has been successfully placed and
              is now being prepared.
            </p>

            {/* Order Information */}
            {order && (
              <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <ClipboardList
                        size={20}
                        className="text-[#d97706]"
                      />
                    </div>

                    <p className="text-xs font-medium text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-[#29221b]">
                      {order.id}
                    </p>
                  </div>

                  <div>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Package
                        size={20}
                        className="text-[#8b5cf6]"
                      />
                    </div>

                    <p className="text-xs font-medium text-gray-500">
                      Order Status
                    </p>

                    <p className="mt-1 text-sm font-bold text-green-600">
                      {order.status}
                    </p>
                  </div>

                  <div>
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                      <ShoppingBag
                        size={20}
                        className="text-[#ec4899]"
                      />
                    </div>

                    <p className="text-xs font-medium text-gray-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#29221b]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-5 text-left">
              <div className="flex gap-3">
                <Sparkles
                  size={22}
                  className="mt-0.5 shrink-0 text-[#8b5cf6]"
                />

                <div>
                  <h2 className="font-bold text-[#29221b]">
                    ShopSphere AI says
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Your shopping journey continues! You can
                    check your order history anytime or continue
                    exploring our products.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <ShoppingBag size={18} />
                Continue Shopping
              </Link>

              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#8b5cf6] bg-white px-6 py-3 text-sm font-bold text-[#7c3aed] transition hover:bg-purple-50"
              >
                <ClipboardList size={18} />
                View My Orders
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderSuccess;