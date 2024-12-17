import React from "react";
import Link from "next/link";
import "./globals.css";
import { FaTachometerAlt, FaPlusCircle } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link href="/dashboard" className="link-button">
            <FaTachometerAlt style={{ marginRight: "8px" }} /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/decoration-createorder"
            className="link-button"
          >
            <FaPlusCircle style={{ marginRight: "8px" }} /> Decoration Create
            Order
          </Link>
        </li>
        <li>
          <Link href="/dashboard/orderDetails" className="link-button">
            <FaTachometerAlt style={{ marginRight: "8px" }} /> Order Details
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/food-create-order"
            className="link-button"
          >
            <FaPlusCircle style={{ marginRight: "8px" }} /> Food Create
            Order
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/photography"
            className="link-button"
          >
            <FaPlusCircle style={{ marginRight: "8px" }} /> Photography Create
          </Link>
        </li>
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
        <div style={{ display: "flex" }}>
          <Sidebar />
          <div className="main-content" style={{ flexGrow: 1 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
