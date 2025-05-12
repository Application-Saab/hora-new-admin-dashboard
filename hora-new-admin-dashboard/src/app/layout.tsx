"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./globals.css";
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaCartPlus,
  FaCamera,
  FaClipboardList,
  FaSignOutAlt,
  FaShippingFast,
  FaUsers,
  FaPen,
  FaUtensils,
  // FaPlusCircle,
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
//  import Login from "./login/page";
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
    label: "Chef For Party Create Order",
    icon: <FaPlusCircle />,
    url: "/dashboard/chef-for-party-food-create",
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
  {
    label: "Add Decoration Product",
    icon: <FaCartPlus />,
    url: "/dashboard/add-decoration-product",
  },
  {
    label: "Edit Decoration Product",
    icon: <FaPen />,
    url: "/dashboard/edit-decoration-product",
  },
  {
    label: "Supplier Details",
    icon: <FaShippingFast />,
    url: "/dashboard/supplier-details",
  },
  {
    label: "Users Details",
    icon: <FaUsers />,
    url: "/dashboard/users-details",
  },
  {
    label: "Dish List",
    icon: <FaUtensils />,
    url: "/dashboard/dish-list",
  },
 
  {
    label: "Create Dish",
    icon: <FaPlusCircle />,
    url: "/dashboard/create-dish",
  },

  // {
  //   label: "Edit Dish",
  //   icon: <FaPlusCircle />,
  //   url: "/dashboard/edit-dish/[id]",
  // },
];

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div className="sidebar">
      <ul>
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link href={item.url} className="link-button">
              {item.icon}
              <span style={{ marginLeft: "8px", fontSize: "14px" }}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={onLogout} className="logout-button">
        <FaSignOutAlt className="logout-icon" /> Logout
      </button>
    </div>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      // setIsLoading(true);
      setIsLoggedIn(true);
      if (window.location.pathname === "/dashboard-login") {
        router.replace("/dashboard"); // Redirect if already logged in
      }
    } else {
      // setIsLoading(false);
      setIsLoggedIn(false);
      router.replace("/dashboard-login");
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    router.replace("/dashboard-login");
  };

  if (isLoggedIn === null) {
    return <div>Loading...</div>; // Prevents flicker while checking auth status
  }

  return (
    <html lang="en">
      <body>
        <div
          className={`dashBoard_page ${isLoggedIn}`}
          style={{ display: "flex" }}
        >
          {isLoggedIn && <Sidebar onLogout={handleLogout} />}
          <div
            className={`main-content ${
              pathname === "/dashboard-login" ? "loginPage" : ""
            }`}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
