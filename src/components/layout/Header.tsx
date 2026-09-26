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
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

function Header() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
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

  const handleLogout = () => {
    logout();

    setAccountOpen(false);
    setMobileMenuOpen(false);

    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur">
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
              <h1 className="text-lg font-black text-[#29221b]">
                ShopSphere
              </h1>

              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6]">
                AI Shopping
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="rounded-xl px-4 py-2 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
            >
              Products
            </Link>

            <Link
              to="/wishlist"
              className="relative rounded-xl px-4 py-2 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
            >
              Wishlist

              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-black text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right Side */}
          <div className="hidden items-center gap-2 md:flex">

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
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
                  className="flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-[#d97706] transition hover:bg-orange-50"
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
              /* Logged-in User */
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
                  className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 transition hover:bg-orange-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] text-sm font-black text-white">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="hidden lg:block text-left">
                    <p className="max-w-[120px] truncate text-sm font-black text-[#29221b]">
                      {user.name}
                    </p>

                    <p className="text-[10px] font-bold uppercase text-[#8b5cf6]">
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
                        setAccountOpen(false)
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
                        setAccountOpen(false)
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
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#6b5b47] transition hover:bg-orange-50 hover:text-[#d97706]"
                    >
                      <Heart size={18} />
                      Wishlist
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        onClick={() =>
                          setAccountOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#8b5cf6] transition hover:bg-purple-50"
                      >
                        <span className="text-lg">
                          ⚙️
                        </span>
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
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
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#6b5b47]"
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
                  (open) => !open,
                )
              }
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6b5b47] transition hover:bg-orange-50"
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
        <div className="border-t border-orange-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1">

            <Link
              to="/"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="block rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
            >
              Home
            </Link>

            <Link
              to="/products"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="block rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
            >
              Products
            </Link>

            <Link
              to="/wishlist"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center justify-between rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
            >
              <span>Wishlist</span>

              {wishlistCount > 0 && (
                <span className="rounded-full bg-[#ec4899] px-2 py-1 text-xs font-black text-white">
                  {wishlistCount}
                </span>
              )}
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
                    setMobileMenuOpen(false)
                  }
                  className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
                >
                  <User size={18} />
                  My Dashboard
                </Link>

                <Link
                  to="/orders"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#6b5b47] hover:bg-orange-50"
                >
                  <Package size={18} />
                  My Orders
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#8b5cf6] hover:bg-purple-50"
                  >
                    ⚙️
                    Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
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
                    setMobileMenuOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-[#d97706] hover:bg-orange-50"
                >
                  <LogIn size={18} />
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() =>
                    setMobileMenuOpen(false)
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
  );
}

export default Header;