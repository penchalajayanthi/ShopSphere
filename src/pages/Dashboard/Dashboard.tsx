import {
  Heart,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Star,
  User,
  UserRound,
} from "lucide-react";

import { useMemo } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";

import { storage } from "../../utils/storage";

import type { Order } from "../../types/order";

import RecentlyViewed from "../Products/RecentlyViewed";

import AddressManager from "../../components/addresses/AddressManager";
import RecommendationPreferences from "../../components/recommendations/RecommendationPreferences";

function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const wishlistItems = useWishlistStore(
    (state) => state.items,
  );

  /*
   * Get all orders from localStorage.
   */
  const orders = useMemo(() => {
    return storage.get<Order[]>(
      "shopsphere_orders",
      [],
    );
  }, []);

  /*
   * Show only orders belonging
   * to the logged-in user.
   */
  const userOrders = useMemo(() => {
    if (!user) {
      return [];
    }

    return orders.filter(
      (order) =>
        order.shippingAddress.email.toLowerCase() ===
        user.email.toLowerCase(),
    );
  }, [orders, user]);

  /*
   * Calculate total amount spent
   * by the logged-in customer.
   */
  const totalSpent = useMemo(() => {
    return userOrders.reduce(
      (total, order) =>
        total + order.total,
      0,
    );
  }, [userOrders]);

  /*
   * Get review count for the
   * logged-in user.
   *
   * IMPORTANT:
   * user?.id prevents the
   * "possibly null" TypeScript error.
   */
  const reviewCount = useMemo(() => {
    if (!user) {
      return 0;
    }

    const reviews = storage.get<
      Array<{
        id: string;
        productId: number;
        userId: number;
        userName: string;
        rating: number;
        comment: string;
        createdAt: string;
      }>
    >(
      "shopsphere_reviews",
      [],
    );

    return reviews.filter(
      (review) =>
        review.userId === user.id,
    ).length;
  }, [user]);

  /*
   * Logout handler.
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /*
   * If there is no authenticated user,
   * don't render the dashboard.
   */
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            WELCOME BANNER
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#f59e0b] via-[#ef476f] to-[#8b5cf6] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-bold text-white/80">
                Welcome back 👋
              </p>

              <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                {user.name}
              </h1>

              <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
                Manage your ShopSphere account,
                orders, wishlist and shopping
                preferences from one place.
              </p>
            </div>

            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-black shadow-lg backdrop-blur"
              aria-label={`Profile avatar for ${user.name}`}
            >
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>
        </section>

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Total Orders */}

          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
                <Package size={22} />
              </div>

              <span className="text-2xl font-black text-[#29221b]">
                {userOrders.length}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-[#8c7a63]">
              Total Orders
            </p>
          </div>

          {/* Wishlist */}

          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-[#ec4899]">
                <Heart size={22} />
              </div>

              <span className="text-2xl font-black text-[#29221b]">
                {wishlistItems.length}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-[#8c7a63]">
              Wishlist Items
            </p>
          </div>

          {/* Total Spent */}

          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-[#8b5cf6]">
                <ShoppingBag size={22} />
              </div>

              <span className="text-lg font-black text-[#29221b]">
                ₹
                {totalSpent.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  },
                )}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-[#8c7a63]">
              Total Spent
            </p>
          </div>

          {/* Reviews */}

          <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-[#f59e0b]">
                <Star size={22} />
              </div>

              <span className="text-2xl font-black text-[#29221b]">
                {reviewCount}
              </span>

            </div>

            <p className="mt-4 text-sm font-bold text-[#8c7a63]">
              My Reviews
            </p>
          </div>

        </section>

        {/* =====================================================
            PROFILE + QUICK ACTIONS
        ====================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Profile */}

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black text-[#29221b]">
                  Profile Information
                </h2>

                <p className="mt-1 text-sm text-[#8c7a63]">
                  Your account details
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
                <UserRound size={22} />
              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#fffaf0] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8c7a63]">
                  Full Name
                </p>

                <p className="mt-1 font-black text-[#29221b]">
                  {user.name}
                </p>
              </div>

              <div className="rounded-2xl bg-[#fffaf0] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8c7a63]">
                  Email
                </p>

                <p className="mt-1 break-all font-black text-[#29221b]">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl bg-[#fffaf0] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8b5cf6]">
                  Account Type
                </p>

                <p className="mt-1 font-black capitalize text-[#8b5cf6]">
                  {user.role}
                </p>
              </div>

              <div className="rounded-2xl bg-[#fffaf0] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#8c7a63]">
                  Account ID
                </p>

                <p className="mt-1 font-black text-[#29221b]">
                  #{user.id}
                </p>
              </div>

            </div>
          </div>

          {/* Quick Actions */}

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black text-[#29221b]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[#8c7a63]">
              Quickly access your account
            </p>

            <div className="mt-5 space-y-2">

              <Link
                to="/orders"
                className="flex items-center gap-3 rounded-2xl p-3 font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
                  <Package size={19} />
                </span>

                My Orders
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center gap-3 rounded-2xl p-3 font-bold text-[#6b5b47] transition hover:bg-pink-50 hover:text-[#ec4899]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[#ec4899]">
                  <Heart size={19} />
                </span>

                My Wishlist
              </Link>

              <Link
                to="/products"
                className="flex items-center gap-3 rounded-2xl p-3 font-bold text-[#6b5b47] transition hover:bg-purple-50 hover:text-[#8b5cf6]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#8b5cf6]">
                  <ShoppingBag size={19} />
                </span>

                Continue Shopping
              </Link>
              <section className="mt-6">
                <RecommendationPreferences />
              </section>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl p-3 text-left font-bold text-[#ef476f] transition hover:bg-pink-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-[#ef476f]">
                  <LogOut size={19} />
                </span>

                Logout
              </button>

            </div>
          </div>

        </section>

        {/* =====================================================
            RECENT ORDERS
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-black text-[#29221b]">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-[#8c7a63]">
                Your latest purchases
              </p>
            </div>

            <Link
              to="/orders"
              className="font-bold text-[#d97706] hover:underline"
            >
              View All Orders →
            </Link>

          </div>

          {userOrders.length === 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-orange-100 bg-[#fffaf0] px-6 py-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-[#f59e0b]">
                <Package size={30} />
              </div>

              <h3 className="mt-4 text-lg font-black text-[#29221b]">
                No orders yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#8c7a63]">
                Start shopping and your orders
                will appear here.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5"
              >
                Start Shopping
              </Link>

            </div>
          ) : (
            <div className="mt-6 space-y-3">

              {userOrders
                .slice(0, 3)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-[#fffaf0] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#d97706]">
                        <Package size={21} />
                      </div>

                      <div>
                        <p className="font-black text-[#29221b]">
                          Order #{order.id}
                        </p>

                        <p className="mt-1 text-xs text-[#8c7a63]">
                          {new Date(
                            order.createdAt,
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#d97706]">
                        {order.status}
                      </span>

                      <span className="font-black text-[#29221b]">
                        ₹
                        {order.total.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          },
                        )}
                      </span>

                      <Link
                        to={`/orders/${order.id}`}
                        className="text-sm font-black text-[#8b5cf6] hover:underline"
                      >
                        Track
                      </Link>

                    </div>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* =====================================================
            WISHLIST
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-black text-[#29221b]">
                Wishlist
              </h2>

              <p className="mt-1 text-sm text-[#8c7a63]">
                Products you saved for later
              </p>
            </div>

            <Link
              to="/wishlist"
              className="font-bold text-[#ec4899] hover:underline"
            >
              View Wishlist →
            </Link>

          </div>

          {wishlistItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-pink-100 bg-pink-50/30 px-6 py-8 text-center">

              <Heart
                size={32}
                className="mx-auto text-[#ec4899]"
              />

              <p className="mt-3 font-bold text-[#6b5b47]">
                Your wishlist is empty.
              </p>

              <Link
                to="/products"
                className="mt-3 inline-block font-black text-[#ec4899] hover:underline"
              >
                Discover Products →
              </Link>

            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

              {wishlistItems
                .slice(0, 4)
                .map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group overflow-hidden rounded-2xl border border-pink-100 bg-[#fffaf0] transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="aspect-square overflow-hidden bg-white">

                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                    </div>

                    <div className="p-3">

                      <p className="truncate text-sm font-black text-[#29221b]">
                        {product.title}
                      </p>

                      <p className="mt-1 font-black text-[#d97706]">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          },
                        )}
                      </p>

                    </div>
                  </Link>
                ))}

            </div>
          )}

        </section>

        {/* =====================================================
            RECENTLY VIEWED
        ====================================================== */}

        <section className="mt-6">
          <RecentlyViewed />
        </section>

        {/* =====================================================
            ADDRESSES
        ====================================================== */}

        <section className="mt-6">
          <AddressManager
            userId={user.id}
          />
        </section>

        {/* =====================================================
            RECOMMENDATION PREFERENCES
        ====================================================== */}

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8b5cf6] shadow-sm">
                <Settings size={23} />
              </div>

              <div>

                <h2 className="font-black text-[#29221b]">
                  Recommendation Preferences
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6b5b47]">
                  ShopSphere AI uses your shopping
                  activity and preferences to provide
                  personalized product recommendations.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#8b5cf6]">
                      Recommendation Signals
                    </p>

                    <p className="mt-1 text-sm text-[#6b5b47]">
                      Recently viewed products,
                      wishlist items, cart activity,
                      categories and product ratings.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-[#ec4899]">
                      Personalization
                    </p>

                    <p className="mt-1 text-sm text-[#6b5b47]">
                      Your shopping activity helps
                      ShopSphere AI understand your
                      product interests.
                    </p>
                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-[#8c7a63]">
                  Recommendation preferences and
                  signal reset controls can be connected
                  to the recommendation service next.
                </p>

              </div>

            </div>

            <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-[#8b5cf6] shadow-sm">
              AI Personalization
            </span>

          </div>

        </section>

        {/* =====================================================
            ACCOUNT SECURITY
        ====================================================== */}

        <section className="mt-6 pb-10">

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-[#8b5cf6]">
                <User size={21} />
              </div>

              <div>
                <h2 className="font-black text-[#29221b]">
                  Account Security
                </h2>

                <p className="text-xs text-[#8c7a63]">
                  Your ShopSphere account
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-purple-50 p-4">

              <p className="text-sm font-bold text-[#6b5b47]">
                Session protected
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8c7a63]">
                Your current mock authentication
                session is stored locally in your
                browser. Protected pages require an
                authenticated ShopSphere session.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

export default Dashboard;