import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
