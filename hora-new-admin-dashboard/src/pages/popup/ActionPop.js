import Image from "next/image";
import "./Actionpopup.css";

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


  const imageBaseUrl = "https://horaservices.com/api/uploads/";
  const decorations = []; 


  if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
    orderDetails.items.forEach((item) => {
      if (item.decoration && item.decoration.length > 0) {
        item.decoration.forEach((dec) => {
          decorations.push({
            name: dec.name,
            price: dec.price,
            featuredImage: `${imageBaseUrl}${dec.featured_image}`,
            inclusion: dec.inclusion,
          });
        });
      }
    });
  }
  const getCleanInclusionText = (inclusionArray) => {
    if (!inclusionArray || inclusionArray.length === 0)
      return "No inclusion details available";

    return inclusionArray[0].replace(/<[^>]+>/g, "").replace(/&#10;/g, "\n");
  };

  const sendOrderDetailsToWhatsApp = () => {
    const orderId = orderDetails._doc.order_id || "N/A";
    const orderDate = new Date(
      orderDetails._doc.order_date
    ).toLocaleDateString();
    // const burners = orderDetails._doc.burners || 0;
    // const noOfPeople = orderDetails._doc.no_of_people || 0;
    // const type = orderDetails._doc.type || "N/A";
    const orderType = getOrderType(orderDetails._doc.type);
    // const orderStatus = getOrderStatus(orderDetails._doc.type);
    const address = orderDetails._doc.addressId?.address1 || "N/A";
    const orderTime = orderDetails._doc.order_time || "N/A";
    // const phone = orderDetails._doc.fromId?.phone || "N/A";
    const decorationComments = orderDetails._doc.decoration_comments || "N/A";
    // const subtotal = orderDetails._doc.total_amount || 0;
    // const advanceAmount = orderDetails._doc.advance_amount || 0;
    // const balanceAmount = orderDetails._doc.balance_amount || 0;
    // const discount = orderDetails._doc.discount || 0;
    // const gst = orderDetails._doc.gst || 0;
    // const perPersonCost = orderDetails._doc.per_person_cost || 0;
    // const totalAmount = orderDetails._doc.payable_amount || 0;

    // Prepare the WhatsApp message content
    let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\nOrder Type: ${orderType}\nAddress: ${address}\nOrder Time: ${orderTime}\nComments: ${decorationComments}\n\nOrder Summary:`;

    // Add each decoration item to the message
    decorations.forEach((dec, index) => {
      const inclusion = getCleanInclusionText(dec.inclusion) || "N/A";
      message += `\nItem ${index + 1}: ${dec.name}\nBalance Amount: ₹${
        dec.price
      }\nInclusion: ${inclusion}\n`;

      // Check if the decoration has a featured image and add it to the message
      if (dec.featuredImage) {
        message += `Featured Image: ${dec.featuredImage}\n`;
      }
    });

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const getOrderStatus = (orderStatusValue) => {
    switch (orderStatusValue) {
      case 0:
        return { status: "Booked", className: "status-booked" };
      case 1:
        return { status: "Accepted", className: "status-accepted" };
      case 2:
        return { status: "In-progress", className: "status-in-progress" };
      case 3:
        return { status: "Completed", className: "status-completed" };
      case 4:
        return { status: "Cancelled", className: "status-cancelled" };
      case 5:
        return { status: "", className: "status-empty" };
      case 6:
        return { status: "Expired", className: "status-expired" };
      default:
        return { status: "Unknown", className: "status-unknown" };
    }
  };
  // const orderStatus = getOrderStatus(orderDetails._doc.type); // Get the order status object
  // const statusClass = orderStatus.className;


  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };


  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button onClick={onClose} className="close-btn">
          ✖
        </button>
        {popupType === "decoration" && orderDetails ? (
          <div className="order-details-container">
            <h2 className="popup-title">Order Details</h2>
            <div className="order-grid">
              <div className="order-details-box">
                <div className="order-detail-row">
                  <p>
                    <strong>Customer Order Id:</strong> {orderDetails._doc.order_id}
                  </p>
                  <p>
                    <strong>Supplier Order Id:</strong> {getOrderId(orderDetails._doc.order_id)}
                  </p>
                  {/* <p><strong>Order Id:</strong> {orderDetails._doc.otp}</p> */}
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(
                      orderDetails._doc.order_date
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>No of burners:</strong>{" "}
                    {orderDetails._doc.burners || 0}
                  </p>
                  <p>
                    <strong>No of people:</strong>{" "}
                    {orderDetails._doc.no_of_people || 0}
                  </p>
                  <p>
                    <strong>Type:</strong> {orderDetails._doc.type || "N/A"}
                  </p>
                  <p>
                    <strong>Order Type:</strong>{" "}
                    {getOrderType(orderDetails._doc.type)}
                  </p>
                  <p>
                    <strong>Order Address:</strong>{" "}
                    {orderDetails._doc.addressId?.address1 || "N/A"}
                  </p>
                  <p>
                    <strong>Order Time:</strong>{" "}
                    {orderDetails._doc.order_time || "N/A"}
                  </p>
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    {orderDetails._doc.fromId.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Order Add On:</strong>{" "}
                    {orderDetails._doc.add_on.map((item, index) => (
                      <li key={index}>
                        <strong>{item.name}</strong>: ₹{item.price}
                      </li>
                    ))}
                  </p>
                  <p>
                    <strong>Order decoration_comments:</strong>{" "}
                    {orderDetails._doc.decoration_comments || "N/A"}
                  </p>
                </div>
                <h3>Ordered Items:</h3>
                <div>
                  {decorations.length > 0 ? (
                    decorations.map((dec, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        <p>
                          <strong>Inclusion:</strong>{" "}
                          {getCleanInclusionText(dec.inclusion)}{" "}
                        </p>
                        {dec.featuredImage && (
                          <Image
                            src={dec.featuredImage}
                            alt={dec.name}
                            width={100}
                            height={100}
                          />
                        )}
                        <p>
                          {dec.name}: ₹{dec.price}
                        </p>
                        {/* <div>{parse(dec.inclusion[0])}</div> */}
                        <button
                          className="startbutton"
                          onClick={sendOrderDetailsToWhatsApp}
                        >
                          Share On WhatsApp
                        </button>
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
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Subtotal:</strong>{" "}
                    <span>₹{orderDetails._doc.total_amount}</span>
                  </li>
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Advance Amount:</strong>{" "}
                    <span>₹{orderDetails._doc.advance_amount}</span>
                  </li>
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Balance Amount:</strong>{" "}
                    <span>₹{orderDetails._doc.balance_amount}</span>
                  </li>
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Discount:</strong>{" "}
                    <span>₹{orderDetails._doc.discount || 0}</span>
                  </li>
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>GST:</strong>{" "}
                    <span>₹{orderDetails._doc.gst || 0}</span>
                  </li>
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Per person cost:</strong>{" "}
                    <span>₹{orderDetails._doc.per_person_cost || 0}</span>
                  </li>
                  <li
                    className="total-amount"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                    }}
                  >
                    <strong>Total:</strong>{" "}
                    <span>₹{orderDetails._doc.payable_amount}</span>
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
                    <p>
                      <strong>Order Number:</strong> {orderDetails.order_id}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(orderDetails.order_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>No of burners:</strong>{" "}
                      {orderDetails.burners || 0}
                    </p>
                    <p>
                      <strong>No of people:</strong>{" "}
                      {orderDetails.no_of_people || 0}
                    </p>
                    <p>
                      <strong>Type:</strong> {orderDetails.type || "N/A"}
                    </p>
                    <p>
                      <strong>Order Type:</strong>{" "}
                      {getOrderType(orderDetails.type)}
                    </p>
                    <p>
                      <strong>Order Address:</strong>{" "}
                      {orderDetails.addressId?.address1 || "N/A"}
                    </p>
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
                            <strong className="order-item-title">
                              {item.name}
                            </strong>
                            <span className="order-item-price">
                              ₹{item.price}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="order-summary-box">
                  <h3 style={{ color: "white" }}>Order Summary</h3>
                  <ul style={{ listStyleType: "none", padding: 0 }}>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>Subtotal:</strong>{" "}
                      <span>₹{orderDetails.total_amount}</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>Discount:</strong>{" "}
                      <span>₹{orderDetails.discount || 0}</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>GST:</strong>{" "}
                      <span>₹{orderDetails.gst || 0}</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>Per person cost:</strong>{" "}
                      <span>₹{orderDetails.per_person_cost || 0}</span>
                    </li>
                    <li
                      className="total-amount"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                      }}
                    >
                      <strong>Total:</strong>{" "}
                      <span>₹{orderDetails.payable_amount}</span>
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
                    <p>
                      <strong>Order Number:</strong> {orderDetails[0].order_id}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(
                        orderDetails[0].order_date
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>No of burners:</strong>{" "}
                      {orderDetails[0].burners || 0}
                    </p>
                    <p>
                      <strong>No of people:</strong>{" "}
                      {orderDetails[0].no_of_people || 0}
                    </p>
                    <p>
                      <strong>Type:</strong> {orderDetails[0].type || "N/A"}
                    </p>
                    <p>
                      <strong>Order Type:</strong>{" "}
                      {getOrderType(orderDetails[0].type)}
                    </p>
                    <p>
                      <strong>Order Address:</strong>{" "}
                      {orderDetails[0].addressId?.address1 || "N/A"}
                    </p>
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
                            <strong className="order-item-title">
                              {item.name}
                            </strong>
                            <span className="order-item-price">
                              ₹{item.price}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="order-summary-box">
                  <h3 style={{ color: "white" }}>Order Summary</h3>
                  <ul style={{ listStyleType: "none", padding: 0 }}>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>Subtotal:</strong>{" "}
                      <span>₹{orderDetails[0].total_amount}</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>Discount:</strong>{" "}
                      <span>₹{orderDetails[0].discount || 0}</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>GST:</strong>{" "}
                      <span>₹{orderDetails[0].gst || 0}</span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>Per person cost:</strong>{" "}
                      <span>₹{orderDetails[0].per_person_cost || 0}</span>
                    </li>
                    <li
                      className="total-amount"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                      }}
                    >
                      <strong>Total:</strong>{" "}
                      <span>₹{orderDetails[0].payable_amount}</span>
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
