"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "../app/component/AuthGuard";
import "./globals.css";
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaCamera,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const menuItems = [
  { label: "Dashboard", icon: <FaTachometerAlt />, url: "/dashboard" },
  {
    label: "Order Details",
    icon: <FaClipboardList />,
    url: "/dashboard/orderDetails",
  },
  {
    label: "Decoration Create Order",
    icon: <FaPlusCircle />,
    url: "/dashboard/decoration-createorder",
  },
  {
    label: "Food Create Order",
    icon: <FaPlusCircle />,
    url: "/dashboard/food-create-order",
  },
  {
    label: "Photography Create Order",
    icon: <FaCamera />,
    url: "/dashboard/photography-create-order",
  },
  {
    label: "Photography Create Folder",
    icon: <FaCamera />,
    url: "/dashboard/photo-folder",
  },
  {
    label: "Vendor Order Details",
    icon: <FaClipboardList />,
    url: "/dashboard/vendor-orderDetails",
  },
];

const Sidebar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token
    router.push("/login");
  };

  return (
    <aside className="sidebar">
      <ul>
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link href={item.url} className="link-button">
              {item.icon}
              <span style={{ marginLeft: "8px" }}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout} className="logout-button">
        <FaSignOutAlt className="logout-icon" /> Logout
      </button>
    </aside>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebarRoutes = ["/login"];

  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <div className="dashboard-container" style={{ display: "flex" }}>
            {!hideSidebarRoutes.includes(pathname) && <Sidebar />}
            <main className="main-content">{children}</main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
