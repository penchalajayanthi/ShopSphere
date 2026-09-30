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

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] =
    useState(false);

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const cartItems = useCartStore(
    (state) => state.items,
  );

  const wishlistItems = useWishlistStore(
    (state) => state.items,
  );

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0,
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

    navigate("/");
  };

  /*
   * =====================================================
   * ADMIN HEADER
   *
   * Admin gets a completely separate header:
   *
   * Logo
   * Admin Dashboard
   * Logout
   *
   * No customer navigation.
   * =====================================================
   */

  if (user?.role === "admin") {
    return (
      <>
       <header className="fixed inset-x-0 top-0 z-[10000] w-full border-b border-blue-700 bg-blue-600 text-white shadow-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">

              <Link
                to="/admin"
                className="flex items-center gap-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-xl shadow-md">
                  🛍️
                </div>

                <div className="hidden sm:block">
                  <h1 className="text-lg font-black text-white">
                    ShopSphere
                  </h1>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                    Admin Panel
                  </p>
                </div>
              </Link>

              {/* ADMIN RIGHT SIDE */}
              <div className="flex items-center gap-2">
                {/* ADMIN LOGOUT */}
                <button
                  type="button"
                  onClick={
                    requestLogout
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#ef476f] px-4 py-2 text-sm font-black text-white shadow-md transition hover:bg-[#db2777] hover:shadow-lg"
                >
                  <LogOut
                    size={17}
                  />

                  <span className="hidden sm:inline">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* =================================================
            ADMIN LOGOUT CONFIRMATION MODAL
        ================================================== */}

        {logoutConfirmOpen && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-logout-confirm-title"
          >
            <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">

              {/* Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">
                <LogOut
                  size={26}
                  className="text-[#ef476f]"
                />
              </div>

              {/* Title */}
              <h2
                id="admin-logout-confirm-title"
                className="mt-4 text-center text-xl font-black text-[#29221b]"
              >
                Are you sure you want to logout?
              </h2>

              {/* Description */}
              <p className="mt-2 text-center text-sm leading-6 text-[#8c7a63]">
                You will be signed out of your
                ShopSphere admin account.
              </p>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={
                    cancelLogout
                  }
                  className="flex-1 rounded-xl border border-[#eadcc2] bg-white px-4 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-[#fffaf0]"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={
                    confirmLogout
                  }
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
      <header className="sticky top-0 z-50 border-b border-purple-900/30 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] shadow-lg backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link
              to="/"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ec4899] text-xl shadow-md">
                🛍️
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg font-black text-white">
                  ShopSphere
                </h1>

                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                  AI Shopping
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
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

            {/* Right Side */}
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

              {/* Guest */}
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <LogIn size={17} />

                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <UserPlus size={17} />

                    Register
                  </Link>
                </>
              ) : (
                /* Logged-in Customer */
                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(
                        (open) =>
                          !open,
                      )
                    }
                    aria-expanded={
                      accountOpen
                    }
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

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={
                          requestLogout
                        }
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

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 md:hidden">

              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white"
              >
                <ShoppingCart size={21} />

                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[9px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (open) =>
                      !open,
                  )
                }
                aria-label={
                  mobileMenuOpen
                    ? "Close menu"
                    : "Open menu"
                }
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-white px-4 py-4 shadow-lg md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1">

              <Link
                to="/"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="block rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="block rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
              >
                Products
              </Link>

              <Link
                to="/wishlist"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="flex items-center justify-between rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
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

              <Link
                to="/orders"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
              >
                <Package size={18} />

                Orders
              </Link>

              {user ? (
                <>
                  <div className="my-2 border-t border-orange-100" />

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

                  <Link
                    to="/dashboard"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
                  >
                    <User size={18} />

                    My Dashboard
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
                  >
                    <Package size={18} />

                    My Orders
                  </Link>

                  {/* Mobile Logout */}
                  <button
                    type="button"
                    onClick={
                      requestLogout
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-[#ef476f] hover:bg-pink-50"
                  >
                    <LogOut size={18} />

                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-orange-100" />

                  <Link
                    to="/login"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#d97706] hover:bg-orange-50"
                  >
                    <LogIn size={18} />

                    Login
                  </Link>

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
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-100">
              <LogOut
                size={26}
                className="text-[#ef476f]"
              />
            </div>

            {/* Title */}
            <h2
              id="logout-confirm-title"
              className="mt-4 text-center text-xl font-black text-[#29221b]"
            >
              Are you sure you want to logout?
            </h2>

            {/* Description */}
            <p className="mt-2 text-center text-sm leading-6 text-[#8c7a63]">
              You will be signed out of your
              ShopSphere account.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={
                  cancelLogout
                }
                className="flex-1 rounded-xl border border-[#eadcc2] bg-white px-4 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-[#fffaf0]"
              >
                No
              </button>

              <button
                type="button"
                onClick={
                  confirmLogout
                }
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