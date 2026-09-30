import {
  Heart,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User,
  UserPlus,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

function Header() {
  const navigate = useNavigate();

  /*
   * =====================================================
   * GENERAL UI STATE
   * =====================================================
   */

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [adminMenuOpen, setAdminMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] =
    useState(false);

  /*
   * =====================================================
   * AUTH
   * =====================================================
   */

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  /*
   * =====================================================
   * CART
   * =====================================================
   */

  const cartItems = useCartStore(
    (state) => state.items,
  );

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  /*
   * =====================================================
   * WISHLIST
   * =====================================================
   */

  const wishlistItems = useWishlistStore(
    (state) => state.items,
  );

  const wishlistCount =
    wishlistItems.length;

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const requestLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    logout();

    setLogoutConfirmOpen(false);
    setAccountOpen(false);
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);

    navigate("/");
  };

  /*
   * =====================================================
   * ADMIN MOBILE NAVIGATION
   * =====================================================
   */

  const adminTabs = [
    {
      label: "Overview",
      tab: "overview",
      icon: "📊",
    },
    {
      label: "Products",
      tab: "products",
      icon: "📦",
    },
    {
      label: "Orders",
      tab: "orders",
      icon: "🛍️",
    },
    {
      label: "Customers",
      tab: "customers",
      icon: "👥",
    },
    {
      label: "Recommendation Analytics",
      tab: "analytics",
      icon: "📈",
    },
  ];

  const openAdminTab = (tab: string) => {
    setAdminMenuOpen(false);

    navigate(`/admin?tab=${tab}`);
  };

  /*
   * =====================================================
   * ADMIN HEADER
   * =====================================================
   */

  if (user?.role === "admin") {
    return (
      <>
        <header className="fixed inset-x-0 top-0 z-[10000] w-full border-b border-blue-800 bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] text-white shadow-lg">

          <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8">

            <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">

              {/* ==================================================
                  ADMIN MAIN HEADER BRANDING
              ================================================== */}

              <Link
                to="/admin"
                onClick={() => {
                  setAdminMenuOpen(false);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
              >

                {/* ShopSphere Icon */}

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl shadow-lg backdrop-blur sm:h-[52px] sm:w-[52px]">
                  🛍️
                </div>

                {/* Branding */}

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <p className="truncate text-[9px] font-black uppercase tracking-[0.17em] text-yellow-300 sm:text-[10px] sm:tracking-[0.22em]">
                      SHOPSPHERE AI
                    </p>

                    <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/90 sm:text-[9px]">
                      Admin
                    </span>

                  </div>

                  <h1 className="mt-0.5 truncate text-lg font-black tracking-tight text-white sm:mt-1 sm:text-3xl">
                    Admin Dashboard
                  </h1>

                </div>
              </Link>

              {/* ==================================================
                  ADMIN RIGHT SIDE
              ================================================== */}

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

                {/* ==================================================
                    MOBILE ADMIN MENU
                    Menu is BEFORE Logout
                ================================================== */}

                <div className="relative sm:hidden">

                  <button
                    type="button"
                    onClick={() =>
                      setAdminMenuOpen(
                        (open) => !open,
                      )
                    }
                    aria-label={
                      adminMenuOpen
                        ? "Close admin menu"
                        : "Open admin menu"
                    }
                    aria-expanded={
                      adminMenuOpen
                    }
                    aria-haspopup="menu"
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2.5 text-xs font-black text-white shadow-sm backdrop-blur transition hover:bg-white/20"
                  >

                    {adminMenuOpen ? (
                      <X size={18} />
                    ) : (
                      <Menu size={18} />
                    )}

                  </button>

                  {/* ==================================================
                      ADMIN MOBILE DROPDOWN
                  ================================================== */}

                  {adminMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[52px] z-[10001] w-[270px] overflow-hidden rounded-2xl border border-blue-100 bg-white p-2 shadow-2xl"
                    >

                      {/* Menu Header */}

                      <div className="border-b border-orange-100 px-3 py-3">

                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8b5cf6]">
                          Admin Menu
                        </p>

                        <p className="mt-1 text-xs text-[#8c7a63]">
                          Navigate ShopSphere Admin
                        </p>

                      </div>

                      {/* Menu Items */}

                      <div className="mt-2 space-y-1">

                        {adminTabs.map(
                          (item) => (
                            <button
                              key={item.tab}
                              type="button"
                              role="menuitem"
                              onClick={() =>
                                openAdminTab(
                                  item.tab,
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
                            >

                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-purple-50 text-base">
                                {
                                  item.icon
                                }
                              </span>

                              <span>
                                {
                                  item.label
                                }
                              </span>

                            </button>
                          ),
                        )}

                      </div>
                    </div>
                  )}

                </div>

                {/* ==================================================
                    ADMIN LOGOUT
                ================================================== */}

                <button
                  type="button"
                  onClick={requestLogout}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-[#ef476f] px-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#db2777] hover:shadow-lg sm:gap-2 sm:px-4 sm:text-sm"
                >

                  <LogOut size={17} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            ADMIN LOGOUT CONFIRMATION
        ================================================== */}

        {logoutConfirmOpen && (
          <div
            className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-logout-confirm-title"
          >

            <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">

                <LogOut
                  size={26}
                  className="text-[#ef476f]"
                />

              </div>

              <h2
                id="admin-logout-confirm-title"
                className="mt-4 text-center text-xl font-black text-[#29221b]"
              >
                Are you sure you want to logout?
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-[#8c7a63]">
                You will be signed out of your
                ShopSphere admin account.
              </p>

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={cancelLogout}
                  className="flex-1 rounded-xl border border-[#eadcc2] bg-white px-4 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-[#fffaf0]"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={confirmLogout}
                  className="flex-1 rounded-xl bg-[#ef476f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#db2777]"
                >
                  Yes, Logout
                </button>

              </div>

            </div>
          </div>
        )}
      </>
    );
  }

  /*
   * =====================================================
   * CUSTOMER / GUEST HEADER
   * =====================================================
   */

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[10000] w-full border-b border-blue-800 bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] text-white shadow-lg">

        <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8">

          <div className="flex h-16 items-center justify-between gap-4">

            {/* ==================================================
                CUSTOMER LOGO
            ================================================== */}

            <Link
              to="/"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex min-w-0 items-center gap-2"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-xl shadow-md">
                🛍️
              </div>

              <div className="hidden min-w-0 sm:block">

                <h1 className="truncate text-lg font-black text-white">
                  ShopSphere
                </h1>

                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                  AI Shopping
                </p>

              </div>
            </Link>

            {/* ==================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav className="hidden items-center gap-1 md:flex">

              <Link
                to="/"
                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 hover:text-yellow-300"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 hover:text-yellow-300"
              >
                Products
              </Link>

              <Link
                to="/wishlist"
                className="relative rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 hover:text-yellow-300"
              >
                Wishlist

                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-black text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/orders"
                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15 hover:text-yellow-300"
              >
                Orders
              </Link>

            </nav>

            {/* ==================================================
                DESKTOP RIGHT SIDE
            ================================================== */}

            <div className="hidden items-center gap-2 md:flex">

              {/* Cart */}

              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/15 hover:text-yellow-300"
              >

                <ShoppingCart size={21} />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                )}

              </Link>

              {/* ==================================================
                  GUEST / CUSTOMER ACCOUNT
              ================================================== */}

              {!user ? (
                <>
                  {/* Login */}

                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  >

                    <LogIn size={17} />

                    Login

                  </Link>

                  {/* Register */}

                  <Link
                    to="/register"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >

                    <UserPlus size={17} />

                    Register

                  </Link>
                </>
              ) : (
                /* ==================================================
                   CUSTOMER ACCOUNT
                ================================================== */

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(
                        (open) => !open,
                      )
                    }
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 transition hover:bg-white/20"
                  >

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] text-sm font-black text-white">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="hidden text-left lg:block">

                      <p className="max-w-[120px] truncate text-sm font-black text-white">
                        {user.name}
                      </p>

                      <p className="text-[10px] font-bold uppercase text-yellow-300">
                        {user.role}
                      </p>

                    </div>

                  </button>

                  {/* Account Dropdown */}

                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-orange-100 bg-white p-2 shadow-2xl"
                    >

                      <div className="border-b border-orange-100 px-3 py-3">

                        <p className="font-black text-[#29221b]">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-[#8c7a63]">
                          {user.email}
                        </p>

                      </div>

                      <Link
                        to="/dashboard"
                        role="menuitem"
                        onClick={() =>
                          setAccountOpen(
                            false,
                          )
                        }
                        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
                      >

                        <User size={18} />

                        My Dashboard

                      </Link>

                      <Link
                        to="/orders"
                        role="menuitem"
                        onClick={() =>
                          setAccountOpen(
                            false,
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
                      >

                        <Package size={18} />

                        My Orders

                      </Link>

                      <Link
                        to="/wishlist"
                        role="menuitem"
                        onClick={() =>
                          setAccountOpen(
                            false,
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
                      >

                        <Heart size={18} />

                        Wishlist

                      </Link>

                      <button
                        type="button"
                        onClick={requestLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-[#ef476f] transition hover:bg-pink-50"
                      >

                        <LogOut size={18} />

                        Logout

                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ==================================================
                CUSTOMER MOBILE ACTIONS
            ================================================== */}

            <div className="flex items-center gap-1 md:hidden">

              {/* Mobile Cart */}

              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
              >

                <ShoppingCart size={21} />

                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[9px] font-black text-white">
                    {cartCount}
                  </span>
                )}

              </Link>

              {/* Mobile Menu */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (open) => !open,
                  )
                }
                aria-label={
                  mobileMenuOpen
                    ? "Close menu"
                    : "Open menu"
                }
                aria-expanded={mobileMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
              >

                {mobileMenuOpen ? (
                  <X size={23} />
                ) : (
                  <Menu size={23} />
                )}

              </button>

            </div>

          </div>
        </div>

        {/* ==================================================
            CUSTOMER MOBILE MENU
        ================================================== */}

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-white px-4 py-4 shadow-xl md:hidden">

            <nav className="mx-auto max-w-7xl space-y-1">

              {/* Home */}

              <Link
                to="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="block rounded-xl px-4 py-3 font-bold text-[#6b5b47] transition hover:bg-orange-50"
              >
                Home
              </Link>

              {/* Products */}

              <Link
                to="/products"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="block rounded-xl px-4 py-3 font-bold text-[#6b5b47] transition hover:bg-orange-50"
              >
                Products
              </Link>

              {/* Wishlist */}

              <Link
                to="/wishlist"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex items-center justify-between rounded-xl px-4 py-3 font-bold text-[#6b5b47] transition hover:bg-orange-50"
              >

                <span>
                  Wishlist
                </span>

                {wishlistCount > 0 && (
                  <span className="rounded-full bg-[#ec4899] px-2 py-1 text-xs font-black text-white">
                    {wishlistCount}
                  </span>
                )}

              </Link>

              {/* Orders */}

              <Link
                to="/orders"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] transition hover:bg-orange-50"
              >

                <Package size={18} />

                Orders

              </Link>

              {/* ==================================================
                  LOGGED-IN CUSTOMER
              ================================================== */}

              {user ? (
                <>

                  <div className="my-2 border-t border-orange-100" />

                  {/* User Info */}

                  <div className="flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] font-black text-white">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <p className="font-black text-[#29221b]">
                        {user.name}
                      </p>

                      <p className="text-xs font-bold capitalize text-[#8b5cf6]">
                        {user.role}
                      </p>

                    </div>

                  </div>

                  {/* Dashboard */}

                  <Link
                    to="/dashboard"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] transition hover:bg-orange-50"
                  >

                    <User size={18} />

                    My Dashboard

                  </Link>

                  {/* Orders */}

                  <Link
                    to="/orders"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] transition hover:bg-orange-50"
                  >

                    <Package size={18} />

                    My Orders

                  </Link>

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={requestLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-[#ef476f] transition hover:bg-pink-50"
                  >

                    <LogOut size={18} />

                    Logout

                  </button>

                </>
              ) : (
                /* ==================================================
                   GUEST MOBILE
                ================================================== */

                <>

                  <div className="my-2 border-t border-orange-100" />

                  {/* Login */}

                  <Link
                    to="/login"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#d97706] transition hover:bg-orange-50"
                  >

                    <LogIn size={18} />

                    Login

                  </Link>

                  {/* Register */}

                  <Link
                    to="/register"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-3 font-bold text-white"
                  >

                    <UserPlus size={18} />

                    Register

                  </Link>

                </>
              )}

            </nav>
          </div>
        )}

      </header>

      {/* =================================================
          CUSTOMER LOGOUT CONFIRMATION MODAL
      ================================================== */}

      {logoutConfirmOpen && (
        <div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >

          <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">

              <LogOut
                size={26}
                className="text-[#ef476f]"
              />

            </div>

            <h2
              id="logout-confirm-title"
              className="mt-4 text-center text-xl font-black text-[#29221b]"
            >
              Are you sure you want to logout?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-[#8c7a63]">
              You will be signed out of your
              ShopSphere account.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={cancelLogout}
                className="flex-1 rounded-xl border border-[#eadcc2] bg-white px-4 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-[#fffaf0]"
              >
                No
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-[#ef476f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#db2777]"
              >
                Yes, Logout
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Header;