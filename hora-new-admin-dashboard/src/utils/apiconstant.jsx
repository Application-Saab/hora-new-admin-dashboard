export const BASE_URL = 'https://horaservices.com:3000';
export const GET_DECORATION_BY_NAME = '/api/Decoration/searchByName/';
export const CONFIRM_ORDER_ENDPOINT = "/api/order/add";
export const SAVE_LOCATION_ENDPOINT='/api/users/address/editByUserID';
export const ADMIN_USER_DETAILS="/api/admin/getUserDetails/";
export const ADMIN_ORDER_LIST="/api/admin/adminOrderList";
export const GET_MEAL_DISH_ENDPOINT = "/api/user/getMealDish";
export const API_SUCCESS_CODE = 200;


// https://horaservices.com:3000/api/admin/admin_user_list



// return (
//     <div>
//       <h1>Order List</h1>
//       {loading && <p>Loading...</p>}

//       {/* Search Box */}
//       <input
//         type="text"
//         placeholder="Search by Order ID"
//         value={searchTerm}
//         onChange={handleSearch}
//       />

//       {/* Export Button */}
//       <button onClick={exportToExcel}>Export to Excel</button>

//       {/* Order Table */}
//       <table>
//         <thead>
//           <tr>
//             <th>Order ID</th>
//             <th>Order Date</th>
//             <th>Customer Name</th>
//             <th>Customer Phone</th>
//             <th>Status</th>
//             <th>Total Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredOrders.map((order) => (
//             <tr key={order._id}>
//               <td>{order._id}</td>
//               <td>{new Date(order.order_date).toLocaleDateString()}</td>
//               <td>{order.customer_name || "N/A"}</td>
//               <td>{customerNumbers[order._id] || "Loading..."}</td>
//               <td>{order.status || "N/A"}</td>
//               <td>{order.total_amount || 0}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div>
//         <button
//           disabled={currentPage <= 1}
//           onClick={() => handlePageChange(currentPage - 1)}
//         >
//           Previous
//         </button>
//         <span>
//           Page {pagination.current_page} of {pagination.last_page}
//         </span>
//         <button
//           disabled={currentPage >= pagination.last_page}
//           onClick={() => handlePageChange(currentPage + 1)}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderList;