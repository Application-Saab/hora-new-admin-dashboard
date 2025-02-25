import React from "react";
import Link from "next/link";
import "./globals.css";
import { FaTachometerAlt, FaPlusCircle , FaCamera, FaClipboardList} from "react-icons/fa";
const menuItems = [
  { label: "Dashboard",
     icon: <FaTachometerAlt />,
      url: "/dashboard" 
    },
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
    label: "PhotoGraphy Create Order",
    icon: < FaCamera />,
    url: "/dashboard/photography-create-order",
  },
  {
    label: "PhotoGraphy Create Folder",
    icon: < FaCamera />,
    url: "/dashboard/photo-folder",
  },
  {
    label: "Vendor OrderDeatils",
    icon: <FaClipboardList />,
    url: "/dashboard/vendor-orderDetails",
  }
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
