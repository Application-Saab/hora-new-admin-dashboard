import React from "react";
import Link from "next/link";
import "./globals.css";
import { FaTachometerAlt, FaPlusCircle , FaCamera} from "react-icons/fa";
const menuItems = [
  { label: "Dashboard",
     icon: <FaTachometerAlt />,
      url: "/dashboard" 
    },
  {
    label: "Decoration Create Order",
    icon: <FaPlusCircle />,
    url: "/dashboard/decoration-createorder",
  },
  {
    label: "Order Details",
    icon: <FaTachometerAlt />,
    url: "/dashboard/orderDetails",
  },
  {
    label: "Food Create Order",
    icon: <FaPlusCircle />,
    url: "/dashboard/food-create-order",
  },
  {
    label: "PhotoGraphy Create Order",
    icon: < FaCamera />,
    url: "/dashboard/photography-create-order",
  },
  {
    label: "PhotoGraphy Upload Images",
    icon: < FaCamera />,
    url: "/dashboard/photography-upload",
  },
];
const Sidebar = () => {
  return (
    <div className="sidebar">
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
    </div>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className='dashBoard_page' style={{ display: "flex" }}>
          <Sidebar />
          <div className="main-content" >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
