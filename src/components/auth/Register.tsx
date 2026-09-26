import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
  User,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

function Register() {
  const navigate = useNavigate();

  const register = useAuthStore(
    (state) => state.register,
  );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (name.trim().length < 2) {
      setError(
        "Name must contain at least 2 characters.",
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setLoading(true);

    const success = register(
      name,
      email,
      password,
    );

    setLoading(false);

    if (!success) {
      setError(
        "An account with this email already exists.",
      );
      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#fffaf0] px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

        {/* Left */}
        <div className="hidden bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] p-10 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <ShoppingBag
              size={34}
            />
          </div>

          <h1 className="text-4xl font-black">
            Join ShopSphere
          </h1>

          <p className="mt-4 max-w-md text-lg leading-8 text-white/90">
            Create your account and enjoy
            personalized shopping,
            wishlists, order tracking and
            intelligent recommendations.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 lg:hidden">
              <ShoppingBag
                size={28}
                className="text-[#8b5cf6]"
              />
            </div>

            <h2 className="text-3xl font-black text-[#29221b]">
              Create account
            </h2>

            <p className="mt-2 text-sm text-[#8c7a63]">
              Start your personalized shopping journey
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
            className="space-y-4"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-bold text-[#29221b]"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a88d6c]"
                />

                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
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
                  id="register-password"
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
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

            {/* Confirm password */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-2 block text-sm font-bold text-[#29221b]"
              >
                Confirm password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a88d6c]"
                />

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] py-3.5 pl-11 pr-12 text-sm outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-orange-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#8c7a63] hover:bg-orange-50"
                >
                  {showConfirmPassword ? (
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
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#e87500] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#8c7a63]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-black text-[#e87500] hover:text-[#8b5cf6]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;