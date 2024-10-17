// import "./Actionpopup.css";
// import Image from 'next/image';
// const ActionPopup = ({ isOpen, orderDetails, onClose }) => {
//   if (!isOpen) return null;

//   const getOrderType = (orderTypeValue) => {
//     const orderTypes = {
//       1: "Decoration",
//       2: "Chef",
//       3: "Waiter",
//       4: "Bar Tender",
//       5: "Cleaner",
//       6: "Food Delivery",
//       7: "Live Catering",
//     };

//     return orderTypes[orderTypeValue] || "Unknown Order Type"; // Default value if not found
//   };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <button onClick={onClose} className="close-btn">
//           ✖
//         </button>
//         {orderDetails ? (
//           <div className="order-details-container">
//             <h2 className="popup-title">Order Details</h2>

//             <div className="order-grid">
//               <div className="order-details-box">
//                 <div className="order-detail-row">
//                   <p>
//                     <strong>Order Number</strong> {orderDetails.order_id}
//                   </p>
//                   <p>
//                     <strong>Order Date</strong>{" "}
//                     {new Date(orderDetails.order_date).toLocaleDateString()}
//                   </p>
//                   <p>
//                     <strong>No of burners</strong> {orderDetails.burners || 0}
//                   </p>
//                   <p>
//                     <strong>No of people</strong>{" "}
//                     {orderDetails.no_of_people || 0}
//                   </p>
//                   <p>
//                     <strong>Type</strong> {orderDetails.type || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Order Type:</strong>{" "}
//                     {getOrderType(orderDetails.type)}
//                   </p>
//                   <p>
//                     <strong>Order Address:</strong>
//                     {orderDetails.addressId?.address1 || "Veg"}
//                   </p>
//                 </div>
//                  <h3>Ordered Items:</h3>
//                  <ul className="order-items-list">
//                   {orderDetails.selecteditems.map((item) => (
//                     <li key={item._id} className="order-item">
//                       <Image
//                         src={`https://horaservices.com/api/uploads/${item.image}`}
//                         alt={item.name}
//                         width={100}
//                         height={100}
//                         className="order-item-image"
//                       />
//                       <div className="order-item-details">
//                         <strong className="order-item-title">{item.name}</strong>
//                         <span className="order-item-price">₹{item.price}</span>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div className="order-summary-box">
//                 <h3 style={{ color: "white" }}>Order Summary</h3>
//                 <ul style={{ listStyleType: "none", padding: 0 }}>
//                   <li
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <strong>Subtotal:</strong>{" "}
//                     <span>₹{orderDetails.total_amount}</span>
//                   </li>
//                   <li
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <strong>Discount:</strong>{" "}
//                     <span>₹{orderDetails.discount || 0}</span>
//                   </li>
//                   <li
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <strong>GST:</strong> <span>₹{orderDetails.gst || 0}</span>
//                   </li>
//                   <li
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <strong>Per person cost:</strong>{" "}
//                     <span>₹{orderDetails.per_person_cost || 0}</span>
//                   </li>
//                   <li
//                     className="total-amount"
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     <strong>Total:</strong>{" "}
//                     <span>₹{orderDetails.payable_amount}</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p>Loading order details...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ActionPopup;




// this is for decoration
// import Image from 'next/image';
// import './Actionpopup.css';  // Ensure you import your styles

// const ActionPopup = ({ isOpen, orderDetails, onClose }) => {
//   if (!isOpen) return null;  // Do not render if the popup is closed

//   const getOrderType = (orderTypeValue) => {
//     const orderTypes = {
//       1: "Decoration",
//       2: "Chef",
//       3: "Waiter",
//       4: "Bar Tender",
//       5: "Cleaner",
//       6: "Food Delivery",
//       7: "Live Catering",
//     };
//     return orderTypes[orderTypeValue] || "Unknown Order Type";  // Default value if not found
//   };



//   console.log(orderDetails, "orderdetails");

// const imageBaseUrl = 'https://horaservices.com/api/uploads/';


// const decorations = [];
// if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
//     orderDetails.items.forEach(item => {
//         if (item.decoration && item.decoration.length > 0) {
//             item.decoration.forEach(dec => {
//                 // Push the decoration details including the image into the array
//                 decorations.push({
//                     name: dec.name,
//                     price: dec.price,
//                     // featuredImage: dec.featured_image, // Assuming this property exists
//                     featuredImage: `${imageBaseUrl}${dec.featured_image}`, // Load image from URL
                  
//                 });
//             });
//         }
//     });
// } else {
//     console.log("No items found or items is not an array.");
// }

  
//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <button onClick={onClose} className="close-btn">✖</button>
//         {orderDetails ? (
//           <div className="order-details-container">
//             <h2 className="popup-title">Order Details</h2>

//             <div className="order-grid">
//               <div className="order-details-box">
//                 <div className="order-detail-row">
//                   <p><strong>Order Number:</strong> {orderDetails._doc.order_id}</p>
//                   <p><strong>Order Date:</strong> {new Date(orderDetails._doc.order_date).toLocaleDateString()}</p>
//                   <p><strong>No of burners:</strong> {orderDetails._doc.burners || 0}</p>
//                   <p><strong>No of people:</strong> {orderDetails._doc.no_of_people || 0}</p>
//                   <p><strong>Type:</strong> {orderDetails._doc.type || "N/A"}</p>
//                   <p><strong>Order Type:</strong> {getOrderType(orderDetails._doc.type)}</p>
//                   <p><strong>Order Address:</strong> {orderDetails._doc.addressId?.address1 || "N/A"}</p>
//                 </div>
//                 <h3>Ordered Items:</h3>
//                 {/* Uncomment and modify this section to show selected items, if available */}

//                 <div>
//             {decorations.length > 0 ? (
//                 decorations.map((dec, index) => (
//                     <div key={index} style={{ marginBottom: '10px' }}>
//                         {dec.featuredImage && (
//                             <Image
//                                 src={dec.featuredImage}
//                                 alt={dec.name}
//                                 width={100}
//                                 height={100}
//                             />
//                         )}
//                         <p>{dec.name}: ₹{dec.price}</p>
//                     </div>
//                 ))
//             ) : (
//                 <p>No decorations available.</p>
//             )}
//         </div>

//               </div>

//               <div className="order-summary-box">
//                 <h3 style={{ color: "white" }}>Order Summary</h3>
//                 <ul style={{ listStyleType: "none", padding: 0 }}>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>Subtotal:</strong> <span>₹{orderDetails._doc.total_amount}</span>
//                   </li>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>Discount:</strong> <span>₹{orderDetails._doc.discount || 0}</span>
//                   </li>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>GST:</strong> <span>₹{orderDetails._doc.gst || 0}</span>
//                   </li>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>Per person cost:</strong> <span>₹{orderDetails._doc.per_person_cost || 0}</span>
//                   </li>
//                   <li className="total-amount" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
//                     <strong>Total:</strong> <span>₹{orderDetails._doc.payable_amount}</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p>Loading order details...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ActionPopup;


import Image from 'next/image';
import './Actionpopup.css';  

const ActionPopup = ({ isOpen, orderDetails, onClose, popupType }) => {
  if (!isOpen) return null; 

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      3: "Waiter",
      4: "Bar Tender",
      5: "Cleaner",
      6: "Food Delivery",
      7: "Live Catering",
    };
    return orderTypes[orderTypeValue] || "Unknown Order Type";  
  };

  // console.log(orderDetails, "orderdetails");

  const imageBaseUrl = 'https://horaservices.com/api/uploads/';
  const decorations = [];

  if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
    orderDetails.items.forEach(item => {
      if (item.decoration && item.decoration.length > 0) {
        item.decoration.forEach(dec => {
          decorations.push({
            name: dec.name,
            price: dec.price,
            featuredImage: `${imageBaseUrl}${dec.featured_image}`, // Load image from URL
          });
        });
      }
    });
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button onClick={onClose} className="close-btn">✖</button>
        {popupType === "decoration" && orderDetails ? (
          <div className="order-details-container">
            <h2 className="popup-title">Order Details</h2>
            <div className="order-grid">
              <div className="order-details-box">
                <div className="order-detail-row">
                  <p><strong>Order Number:</strong> {orderDetails._doc.order_id}</p>
                  <p><strong>Order Date:</strong> {new Date(orderDetails._doc.order_date).toLocaleDateString()}</p>
                  <p><strong>No of burners:</strong> {orderDetails._doc.burners || 0}</p>
                  <p><strong>No of people:</strong> {orderDetails._doc.no_of_people || 0}</p>
                  <p><strong>Type:</strong> {orderDetails._doc.type || "N/A"}</p>
                  <p><strong>Order Type:</strong> {getOrderType(orderDetails._doc.type)}</p>
                  <p><strong>Order Address:</strong> {orderDetails._doc.addressId?.address1 || "N/A"}</p>
                </div>
                <h3>Ordered Items:</h3>
                <div>
                  {decorations.length > 0 ? (
                    decorations.map((dec, index) => (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        {dec.featuredImage && (
                          <Image
                            src={dec.featuredImage}
                            alt={dec.name}
                            width={100}
                            height={100}
                          />
                        )}
                        <p>{dec.name}: ₹{dec.price}</p>
                      </div>
                    ))
                  ) : (
                    <p>No decorations available.</p>
                  )}
                </div>
              </div>

              <div className="order-summary-box">
                <h3 style={{ color: "white" }}>Order Summary</h3>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Subtotal:</strong> <span>₹{orderDetails._doc.total_amount}</span>
                  </li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Discount:</strong> <span>₹{orderDetails._doc.discount || 0}</span>
                  </li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>GST:</strong> <span>₹{orderDetails._doc.gst || 0}</span>
                  </li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Per person cost:</strong> <span>₹{orderDetails._doc.per_person_cost || 0}</span>
                  </li>
                  <li className="total-amount" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <strong>Total:</strong> <span>₹{orderDetails._doc.payable_amount}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p></p>
        )}
        {popupType === "chef" && (
           <div>
           
           <div className="order-details-container">
            <h2 className="popup-title">Order Details</h2>
            <div className="order-grid">
              <div className="order-details-box">
                <div className="order-detail-row">
                  <p><strong>Order Number:</strong> {orderDetails.order_id}</p>
                  <p><strong>Order Date:</strong> {new Date(orderDetails.order_date).toLocaleDateString()}</p>
                  <p><strong>No of burners:</strong> {orderDetails.burners || 0}</p>
                  <p><strong>No of people:</strong> {orderDetails.no_of_people || 0}</p>
                  <p><strong>Type:</strong> {orderDetails.type || "N/A"}</p>
                  <p><strong>Order Type:</strong> {getOrderType(orderDetails.type)}</p>
                  <p><strong>Order Address:</strong> {orderDetails.addressId?.address1 || "N/A"}</p>
                </div>
                <h3>Ordered Items:</h3>

       <div className="order-items-container">
                  <ul className="order-items-list">
                    {orderDetails.selecteditems.map((item) => (
                      <li key={item._id} className="order-item">
                        <Image
                          src={`https://horaservices.com/api/uploads/${item.image}`}
                          alt={item.name}
                          width={80} // Smaller size for items
                          height={80} // Smaller size for items
                          className="order-item-image"
                        />
                        <div className="order-item-details">
                          <strong className="order-item-title">{item.name}</strong>
                          <span className="order-item-price">₹{item.price}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="order-summary-box">
                <h3 style={{ color: "white" }}>Order Summary</h3>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Subtotal:</strong> <span>₹{orderDetails.total_amount}</span>
                  </li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Discount:</strong> <span>₹{orderDetails.discount || 0}</span>
                  </li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>GST:</strong> <span>₹{orderDetails.gst || 0}</span>
                  </li>
                  <li style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Per person cost:</strong> <span>₹{orderDetails.per_person_cost || 0}</span>
                  </li>
                  <li className="total-amount" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <strong>Total:</strong> <span>₹{orderDetails.payable_amount}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
         </div>
        )}

{popupType === "foodDelivery" && (
   <div>
           
   <div className="order-details-container">
    <h2 className="popup-title">Order Details</h2>
    <div className="order-grid">
      <div className="order-details-box">
        <div className="order-detail-row">
          <p><strong>Order Number:</strong> {orderDetails[0].order_id}</p>
          <p><strong>Order Date:</strong> {new Date(orderDetails[0].order_date).toLocaleDateString()}</p>
          <p><strong>No of burners:</strong> {orderDetails[0].burners || 0}</p>
          <p><strong>No of people:</strong> {orderDetails[0].no_of_people || 0}</p>
          <p><strong>Type:</strong> {orderDetails[0].type || "N/A"}</p>
          <p><strong>Order Type:</strong> {getOrderType(orderDetails[0].type)}</p>
          <p><strong>Order Address:</strong> {orderDetails[0].addressId?.address1 || "N/A"}</p>
        </div>
        <h3>Ordered Items:</h3>



<div className="order-items-container">
          <ul className="order-items-list">
            {orderDetails[0].selecteditems.map((item) => (
              <li key={item._id} className="order-item">
                <Image
                  src={`https://horaservices.com/api/uploads/${item.image}`}
                  alt={item.name}
                  width={80} 
                  height={80}
                  className="order-item-image"
                />
                <div className="order-item-details">
                  <strong className="order-item-title">{item.name}</strong>
                  <span className="order-item-price">₹{item.price}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="order-summary-box">
        <h3 style={{ color: "white" }}>Order Summary</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Subtotal:</strong> <span>₹{orderDetails[0].total_amount}</span>
          </li>
          <li style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Discount:</strong> <span>₹{orderDetails[0].discount || 0}</span>
          </li>
          <li style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>GST:</strong> <span>₹{orderDetails[0].gst || 0}</span>
          </li>
          <li style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Per person cost:</strong> <span>₹{orderDetails[0].per_person_cost || 0}</span>
          </li>
          <li className="total-amount" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <strong>Total:</strong> <span>₹{orderDetails[0].payable_amount}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
 </div>
)}
      </div>
    </div>
  );
};

export default ActionPopup;


// import Image from 'next/image';
// import './Actionpopup.css'; // Ensure you import your styles

// const ActionPopup = ({ isOpen, orderDetails, onClose }) => {
//   if (!isOpen) return null;

  
//   const getOrderType = (orderTypeValue) => {
//     const orderTypes = {
//       1: "Decoration",
//       2: "Chef",
//       3: "Waiter",
//       4: "Bar Tender",
//       5: "Cleaner",
//       6: "Food Delivery",
//       7: "Live Catering",
//     };

//     return orderTypes[orderTypeValue] || "Unknown Order Type"; // Default value if not found
//   };

//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <button onClick={onClose} className="close-btn">
//           ✖
//         </button>
//         {orderDetails ? (
//           <div className="order-details-container">
//             <h2 className="popup-title">Order Details</h2>

//             <div className="order-grid">
//               <div className="order-details-box">
//                 <div className="order-detail-row">
//                   <p>
//                     <strong>Order Number:</strong> {orderDetails.order_id}
//                   </p>
//                   <p>
//                     <strong>Order Date:</strong>{" "}
//                     {new Date(orderDetails.order_date).toLocaleDateString()}
//                   </p>
//                   <p>
//                     <strong>No of burners:</strong> {orderDetails.burners || 0}
//                   </p>
//                   <p>
//                     <strong>No of people:</strong>{" "}
//                     {orderDetails.no_of_people || 0}
//                   </p>
//                   <p>
//                     <strong>Type:</strong> {orderDetails.type || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Order Type:</strong>{" "}
//                     {getOrderType(orderDetails.type)}
//                   </p>
//                   <p>
//                     <strong>Order Address:</strong>
//                     {orderDetails.addressId?.address1 || "Veg"}
//                   </p>
//                 </div>
//                 <h3>Ordered Items:</h3>
//                 {/* <div className="order-items-container">
//                   <ul className="order-items-list">
//                     {orderDetails.selecteditems.map((item) => (
//                       <li key={item._id} className="order-item">
//                         <Image
//                           src={`https://horaservices.com/api/uploads/${item.image}`}
//                           alt={item.name}
//                           width={80} // Smaller size for items
//                           height={80} // Smaller size for items
//                           className="order-item-image"
//                         />
//                         <div className="order-item-details">
//                           <strong className="order-item-title">{item.name}</strong>
//                           <span className="order-item-price">₹{item.price}</span>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div> */}
//               </div>

//               <div className="order-summary-box">
//                 <h3 style={{ color: "white" }}>Order Summary</h3>
//                 <ul style={{ listStyleType: "none", padding: 0 }}>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>Subtotal:</strong> <span>₹{orderDetails.total_amount}</span>
//                   </li>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>Discount:</strong> <span>₹{orderDetails.discount || 0}</span>
//                   </li>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>GST:</strong> <span>₹{orderDetails.gst || 0}</span>
//                   </li>
//                   <li style={{ display: "flex", justifyContent: "space-between" }}>
//                     <strong>Per person cost:</strong> <span>₹{orderDetails.per_person_cost || 0}</span>
//                   </li>
//                   <li className="total-amount" style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
//                     <strong>Total:</strong> <span>₹{orderDetails.payable_amount}</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p>Loading order details...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ActionPopup;
