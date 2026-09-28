import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedLayout from "./components/layout/ProtectedLayout";

import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/Products/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/wishlist/Wishlist";
import Dashboard from "./pages/Dashboard/Dashboard";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import Orders from "./pages/Orders/Orders";
import OrderTracking from "./pages/OrderTracking/OrderTracking";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import ShoppingAssistant from "./components/assistant/ShoppingAssistant";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==================== PROTECTED ROUTES ==================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/wishlist"
              element={<Wishlist />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            <Route
              path="/order-success"
              element={<OrderSuccess />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/orders/:id"
              element={<OrderTracking />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-[#fffaf0] p-10 text-center">
                  <h1 className="text-3xl font-bold text-[#29221b]">
                    Page Not Found
                  </h1>
                </div>
              }
            />

            {/* AI Shopping Assistant */}
            <Route
              path="/ai-assistant"
              element={<ShoppingAssistant />}
            />
          </Route>
        </Route>
      </Routes>

      {/* Floating AI Assistant */}
      <ShoppingAssistant />
    </BrowserRouter>
  );
}

export default App;