import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore(
    (state) => state.login,
  );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const from =
    (
      location.state as {
        from?: string;
      } | null
    )?.from || "/";

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    setLoading(true);

    const success = login(
      email,
      password,
    );

    setLoading(false);

    if (!success) {
      setError(
        "Invalid email or password.",
      );
      return;
    }

    navigate(from, {
      replace: true,
    });
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#fffaf0] px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden bg-gradient-to-br from-[#f59e0b] via-[#e87500] to-[#8b5cf6] p-10 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <ShoppingBag
              size={34}
            />
          </div>

          <h1 className="text-4xl font-black">
            Welcome back!
          </h1>

          <p className="mt-4 max-w-md text-lg leading-8 text-white/90">
            Sign in to continue shopping,
            manage your wishlist, track
            orders and discover personalized
            recommendations.
          </p>

          <div className="mt-8 rounded-2xl bg-white/15 p-5">
            <p className="text-sm font-bold">
              ShopSphere AI
            </p>

            <p className="mt-1 text-sm text-white/80">
              Your personalized shopping
              experience.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 lg:hidden">
              <ShoppingBag
                size={28}
                className="text-[#e87500]"
              />
            </div>

            <h2 className="text-3xl font-black text-[#29221b]">
              Sign in
            </h2>

            <p className="mt-2 text-sm text-[#8c7a63]">
              Welcome back to ShopSphere AI
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-bold text-[#29221b]"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a88d6c]"
                />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-bold text-[#29221b]"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a88d6c]"
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#8c7a63] hover:bg-orange-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#e87500] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>


          <p className="mt-7 text-center text-sm text-[#8c7a63]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-black text-[#e87500] hover:text-[#8b5cf6]"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;