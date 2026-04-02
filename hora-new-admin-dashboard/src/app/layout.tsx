"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { GiFireworkRocket } from "react-icons/gi";
import { useRouter, usePathname } from "next/navigation";

//  MENU ITEMS WITH GROUPS
const menuItems = [
  { label: "Dashboard", icon: <FaTachometerAlt />, url: "/dashboard" },

  { label: "Analysis", icon: <FaClipboardList />, url: "/dashboard/analysis" },

  
  { label: "User Analysis", icon: <FaClipboardList />, url: "/dashboard/user-analysis" },

  { label: "Wonderland Tracking", icon: <FaClipboardList />, url: "/dashboard/wonderland-tracking" },

  {
    label: "Order Details",
    icon: <FaClipboardList />,
    url: "/dashboard/orderDetails",
  },

  {
    label: "Decoration",
    icon: <FaCartPlus />,
    children: [
      {
        label: "Create Order",
        icon: <FaPlusCircle />,
        url: "/dashboard/decoration-createorder",
      },
      {
        label: "Add Product",
        icon: <FaCartPlus />,
        url: "/dashboard/add-decoration-product",
      },
      {
        label: "Edit Product",
        icon: <FaPen />,
        url: "/dashboard/edit-decoration-product",
      },
      {
        label: "Decoration Actual Photo",
        icon: <FaCamera />,
        url: "/dashboard/decoration-actual-photo",
      },
      {
        label: "Decoration-Order-Report",
        icon: <FaCamera />,
        url: "/dashboard/Decoration-Order-Report"
      },
    ],
  },

  {
    label: "Photography",
    icon: <FaCamera />,
    children: [
      {
        label: "Create Order",
        icon: <FaCamera />,
        url: "/dashboard/photography-create-order",
      },
        {
        label: "Add Product",
        icon: <FaCartPlus />,
        url: "/dashboard/add-photography-product",
      },
          {
        label: "Edit Product",
        icon: <FaPen />,
        url: "/dashboard/edit-photography-product",
      },
      {
        label: "Create Folder",
        icon: <FaCamera />,
        url: "/dashboard/photo-folder",
      },
      {
        label: "Add More Images",
        icon: <FaPlusCircle />,
        url: "/dashboard/add-more-images",
      },
    ],
  },

  {
    label: "Celebration Boosters",
    icon: <GiFireworkRocket />,
    children: [
      {
        label: "Create Order",
        icon: <FaPlusCircle />,
        url: "/dashboard/booster-createorder",
      },
      {
        label: "Boosters List",
        icon: <GiFireworkRocket />,
        url: "/dashboard/celebration-booster",
      },
    ],
  },

  {
    label: "Vendor",
    icon: <FaClipboardList />,
    children: [
      {
        label: "Order Details",
        icon: <FaClipboardList />,
        url: "/dashboard/vendor-orderDetails",
      },
      {
        label: "Order Reports",
        icon: <FaClipboardList />,
        url: "/dashboard/vendor-orderReports",
      },
      {
        label: "Vendor Rating",
        icon: <FaClipboardList />,
        url: "/dashboard/vendor-rating",
      },
    ],
  },

  {
    label: "Supplier & Users",
    icon: <FaUsers />,
    children: [
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
        label: "Supplier Create",
        icon: <FaClipboardList />,
        url: "/dashboard/supplier-create",
      },
    ],
  },

  {
    label: "Food & Chef For Party",
    icon: <FaUtensils />,
    children: [
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
        label : "Create Food Package",
        icon : <FaPlusCircle />,
        url : "/dashboard/create-food-package"
      }
    ],
  },


  { label: "Dish List", icon: <FaUtensils />, url: "/dashboard/dish-list" },

  {
    label: "Create Dish",
    icon: <FaPlusCircle />,
    url: "/dashboard/create-dish",
  },
];

// SIDEBAR COMPONENT WITH RIGHT-SIDE TOGGLE ICON
const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="sidebar">
      <ul>
        {menuItems.map((item, index) => {
          if (item.children) {
            const isOpen = openGroups[item.label];
            return (
              <li key={index}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="link-button group-button"
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {item.icon}
                    <span style={{ marginLeft: "8px", fontSize: "14px" }}>
                      {item.label}
                    </span>
                  </div>
                  <span className="chevron-icon">
                    {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                </button>
                {isOpen && (
                  <ul className="nested-menu">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex} className="nested-item">
                        <Link href={child.url} className="link-button">
                          {child.icon}
                          <span style={{ marginLeft: "8px", fontSize: "13px" }}>
                            {child.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          } else {
            return (
              <li key={index}>
                <Link href={item.url} className="link-button">
                  {item.icon}
                  <span style={{ marginLeft: "8px", fontSize: "14px" }}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }
        })}
      </ul>
      <button onClick={onLogout} className="logout-button">
        <FaSignOutAlt className="logout-icon" /> Logout
      </button>
    </div>
  );
};

// ROOT LAYOUT SAME AS BEFORE
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
      if (window.location.pathname === "/dashboard-login") {
        router.replace("/dashboard");
      }
    } else {
      setIsLoggedIn(false);
      router.replace("/dashboard-login");
    }
  }, [pathname]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const savedHash = localStorage.getItem("adminHashPassword");
      const token = localStorage.getItem("authToken");
      const adminEmail =
        localStorage.getItem("adminEmail") || "admin@admin.com";

      if (!token || !savedHash) {
        setIsLoggedIn(false);
        router.replace("/dashboard-login");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/admin/admin_user_list",
          {
            email: adminEmail,
            role: "admin",
          }
        );

        const users = response?.data?.data?.users;
        if (!Array.isArray(users) || users.length === 0) {
          localStorage.clear();
          setIsLoggedIn(false);
          router.replace("/dashboard-login");
          return;
        }

        const passwordFromAPI = users[0]?.hashpassword;
        if (passwordFromAPI !== savedHash) {
          localStorage.clear();
          setIsLoggedIn(false);
          router.replace("/dashboard-login");
        }
      } catch (err) {
        console.error("Error verifying password hash:", err);
      }
    }, 10800000); // every 3 hours

    return () => clearInterval(intervalId);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    router.replace("/dashboard-login");
  };

  if (isLoggedIn === null) {
    return <div>Loading...</div>;
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
