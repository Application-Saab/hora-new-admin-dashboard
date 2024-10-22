import React from 'react';
import Link from 'next/link';
import './globals.css';
import { FaTachometerAlt, FaPlusCircle } from 'react-icons/fa';

// Sidebar component
const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link href="/dashboard" className="link-button">
            <FaTachometerAlt style={{ marginRight: '8px' }} /> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/dashboard/decoration-createorder" className="link-button">
            <FaPlusCircle style={{ marginRight: '8px' }} /> Decoration Create Order
          </Link>
        </li>
        <li>
          <Link href="/dashboard/orderDetails" className="link-button">
            <FaTachometerAlt style={{ marginRight: '8px' }} /> Order Details
          </Link>
        </li>
      </ul>
    </div>
  );
};

// Root layout component
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex' }}>
          {/* Sidebar stays static */}
          <Sidebar />
          {/* Main content dynamically changes based on the route */}
          <div className="main-content" style={{ flexGrow: 1 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}


// import "./globals.css";


// // Root layout component
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         {children}
//       </body>
//     </html>
//   );
// }
