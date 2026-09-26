import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Header from "./components/layout/Header";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import ProductDetails from "./pages/Products/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Wishlist from "./pages/wishlist/Wishlist";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/"
            element={
              <>
                <Header />
                <Home />
              </>
            }
          />
           <Route
  path="/dashboard"
  element={
    <>
      <Header />
      <Dashboard />
    </>
  }
/>
          <Route
            path="/products"
            element={
              <>
                <Header />
                <Products />
              </>
            }
          />

          <Route
            path="/products/:id"
            element={
              <>
                <Header />
                <ProductDetails />
              </>
            }
          />

          <Route
            path="/cart"
            element={
              <>
                <Header />
                <Cart />
              </>
            }
          />

          <Route
            path="/wishlist"
            element={
              <>
                <Header />
                <Wishlist />
              </>
            }
          />

          <Route
            path="/checkout"
            element={
              <>
                <Header />
                <Checkout />
              </>
            }
          />

          <Route
            path="/order-success"
            element={
              <>
                <Header />
                <OrderSuccess />
              </>
            }
          />

          <Route
            path="/orders"
            element={
              <>
                <Header />
                <Orders />
              </>
            }
          />

          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center bg-[#fffaf0] px-4">
                <div className="text-center">
                  <div className="text-6xl">
                    🛍️
                  </div>

                  <h1 className="mt-4 text-3xl font-black text-[#29221b]">
                    Page Not Found
                  </h1>

                  <p className="mt-2 text-[#8c7a63]">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              </div>
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;