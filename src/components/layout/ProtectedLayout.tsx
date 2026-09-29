import { Outlet } from "react-router-dom";
import Header from "./Header";
import ShoppingAssistant from "../assistant/ShoppingAssistant";

function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-[#fffaf0]">
      <Header />

      <main>
        <Outlet />
      </main>

      <ShoppingAssistant />
    </div>
  );
}

export default ProtectedLayout;