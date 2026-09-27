import { Outlet } from "react-router-dom";
import Header from "./Header";
import AIAssistant from "../assistant/AIAssistant";

function ProtectedLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <AIAssistant />
    </>
  );
}

export default ProtectedLayout;