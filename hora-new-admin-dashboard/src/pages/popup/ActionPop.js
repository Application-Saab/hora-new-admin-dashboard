import Image from "next/image";
import "./Actionpopup.css";

const ActionPopup = ({ isOpen, orderDetails, onClose, popupType }) => {
  if (!isOpen) return null;

  console.log(orderDetails, "action wal");

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      3: "Waiter",
      4: "Bar Tender",
      5: "Cleaner",
      6: "Food Delivery",
      7: "Live Catering",
      8: "Photography",
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

    return inclusionArray
      .join("")
      .replace(/<\/?(div|span)>/g, "")
      .replace(/&#10;/g, "\n")
      .replace(/\s*-\s*/g, "\n- ")
      .trim();
  };

  const sendOrderDetailsToWhatsApp = () => {
    const orderId =
      getOrderId(orderDetails._doc?.order_id || orderDetails.order_id) || "N/A";
    const orderDate = new Date(
      orderDetails._doc?.order_date || orderDetails.order_date
    ).toLocaleDateString();
    const orderType =
      getOrderType(orderDetails._doc?.type || orderDetails.type) || "N/A";
    const address =
      orderDetails._doc?.addressId?.address1 ||
      orderDetails.addressId?.address1 ||
      "N/A";
    const googleMapLocation =
      orderDetails._doc?.addressId?.address2 ||
      orderDetails.addressId?.address2 ||
      "N/A";
    const orderTime =
      orderDetails._doc?.order_time || orderDetails.order_time || "N/A";
    console.log(orderDetails.order_time, "fdsfsd");
    const Comments =
      orderDetails._doc?.decoration_comments ||
      orderDetails.decoration_comments ||
      "N/A";
    const addOnItems = orderDetails._doc?.add_on || orderDetails.add_on || [];
    const selectedItems = orderDetails.selecteditems || [];
    const burners = orderDetails._doc?.burners || orderDetails.burners;

    let balanceAmount = 0;
    if (orderDetails._doc?.phone_no || orderDetails.phone_no) {
      balanceAmount =
        (orderDetails._doc?.total_amount || orderDetails.total_amount) -
        (orderDetails._doc?.advance_amount || orderDetails.advance_amount);
    } else {
      const orderType = orderDetails._doc?.type || orderDetails.type;
      if ([2, 3, 4, 5].includes(orderType)) {
        balanceAmount = Math.round(
          ((orderDetails._doc?.payable_amount || orderDetails.payable_amount) *
            4) /
            5
        );
      } else if ([6, 7].includes(orderType)) {
        balanceAmount = Math.round(
          (orderDetails._doc?.payable_amount || orderDetails.payable_amount) *
            0.35
        );
      } else {
        balanceAmount = Math.round(
          (orderDetails._doc?.payable_amount || orderDetails.payable_amount) *
            0.65
        );
      }
    }

    const noOfPeople =
      orderDetails._doc?.no_of_people || orderDetails.no_of_people;
    const perPersonCost =
      orderDetails._doc?.per_person_cost || orderDetails.per_person_cost;

    let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\nOrder Type: ${orderType}\nAddress: ${address}\nGoogle Map Location: ${googleMapLocation}\nOrder Time: ${orderTime}\nBalance Amount: ₹${balanceAmount}\nComments: ${Comments}\n`;

    if (noOfPeople) {
      message += `Number of People: ${noOfPeople}\n`;
    }

    if (perPersonCost) {
      message += `Per Person Cost: ₹${perPersonCost}\n`;
    }

    if (burners) {
      message += `Burners: ${burners}\n`;
    }

    if (addOnItems.length > 0 && addOnItems.some(item => item.name && item.price)) {
      message += `\nOrder Add-On Items:`;
      addOnItems.forEach((item, index) => {
        if (item.name && item.price) {
          message += `\n${index + 1}. ${item.name}: ₹${item.price}`;
        }
      });
    } else {
      // No add-ons to display, so do nothing
    }
    
    decorations.forEach((dec, index) => {
      const inclusion = getCleanInclusionText(dec.inclusion) || "N/A";
      message += `\n\nOrder Summary:\nItem ${index + 1}: ${
        dec.name
      }\nInclusion:\n${inclusion}\n`;

      if (dec.featuredImage) {
        message += `Featured Image: ${dec.featuredImage}\n`;
      }
    });

    if (selectedItems.length > 0) {
      message += `\n\nOrdered Items:`;
      selectedItems.forEach((item, index) => {
        message += `\nItem ${index + 1}: ${item.name}\nPrice: ₹${item.price}`;
      });
    } else {
      console.log("nt");
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

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

        <div className="order-details-container">
          <h2 className="popup-title">Order Details</h2>
          <div className="order-grid">
            <div className="order-details-box">
              <div className="order-detail-row">
                <p>
                  <strong>Customer Order Id:</strong>{" "}
                  {orderDetails &&
                  (orderDetails._doc?.order_id || orderDetails.order_id)
                    ? getOrderId(
                        orderDetails._doc?.order_id || orderDetails.order_id
                      ) ||
                      orderDetails._doc?.order_id ||
                      orderDetails.order_id
                    : "N/A"}
                </p>
                <p>
                  <strong>Supplier Order Id:</strong>{" "}
                  {orderDetails &&
                  (orderDetails._doc?.order_id || orderDetails.order_id)
                    ? getOrderId(
                        orderDetails._doc?.order_id || orderDetails.order_id
                      ) ||
                      orderDetails._doc?.order_id ||
                      orderDetails.order_id
                    : "N/A"}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(
                    orderDetails._doc?.order_date || orderDetails.order_date
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Order Type:</strong>{" "}
                  {getOrderType(orderDetails._doc?.type || orderDetails.type)}
                </p>
                <p>
                  <strong>Order Address:</strong>{" "}
                  {orderDetails._doc?.addressId?.address1 ||
                    orderDetails.addressId?.address1 ||
                    "N/A"}
                </p>
                <p>
                  <strong>Order Google Map Location:</strong>{" "}
                  {orderDetails._doc?.addressId?.address2 ||
                    orderDetails.addressId?.address2 ||
                    "N/A"}
                </p>
                <p>
                  <strong>Order Time:</strong>{" "}
                  {orderDetails._doc?.order_time ||
                    orderDetails.order_time ||
                    "N/A"}
                </p>
                <p>
                  <strong>Phone Number:</strong>{" "}
                  {orderDetails._doc?.fromId?.phone ||
                    orderDetails.fromId?.phone ||
                    "N/A"}
                </p>
                <p>
                  <strong>Order Add On:</strong>{" "}
                  {orderDetails._doc?.add_on &&
                  orderDetails._doc?.add_on.length > 0 ? (
                    <ul>
                      {orderDetails._doc.add_on.map((item, index) => (
                        <li key={index}>
                          <strong>{item.name}</strong>: ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p>
                  <strong>Order Decoration Comments:</strong>{" "}
                  {orderDetails._doc?.decoration_comments ||
                    orderDetails.order_time ||
                    "N/A"}
                </p>
              </div>

              <h3>Ordered Items:</h3>
              <div className="order-items-container">
                <ul className="order-items-list">
                  {orderDetails.selecteditems &&
                  orderDetails.selecteditems.length > 0
                    ? orderDetails.selecteditems.map((item) => (
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
                      ))
                    : null}
                </ul>

                {/* Render decorations if they exist */}
                {decorations && decorations.length > 0
                  ? decorations.map((dec, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        <p>
                          <strong>Inclusion:</strong>
                          <div>
                            {getCleanInclusionText(dec.inclusion)
                              .split("\n")
                              .map((item, index) => (
                                <span key={index} style={{ display: "block" }}>
                                  • {item.trim()}
                                </span>
                              ))}
                          </div>
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
                      </div>
                    ))
                  : null}
              </div>

              <button
                className="startbutton"
                onClick={sendOrderDetailsToWhatsApp}
              >
                Share On WhatsApp
              </button>
            </div>
            <div className="order-summary-box">
              <h3 style={{ color: "white" }}>Order Summary</h3>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {orderDetails._doc?.total_amount ||
                orderDetails.total_amount ? (
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Total Amount:</strong>
                    <span>
                      ₹
                      {orderDetails._doc?.total_amount ||
                        orderDetails.total_amount ||
                        0}
                    </span>
                  </li>
                ) : null}

                {orderDetails._doc?.advance_amount ||
                orderDetails.advance_amount ? (
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Advance Amount:</strong>
                    <span>
                      ₹
                      {orderDetails._doc?.advance_amount ||
                        orderDetails.advance_amount ||
                        0}
                    </span>
                  </li>
                ) : null}

                {(orderDetails._doc?.total_amount &&
                  orderDetails._doc?.advance_amount) ||
                (orderDetails.total_amount && orderDetails.advance_amount) ? (
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>Balance Amount:</span>
                    <span>
                      ₹
                      {orderDetails._doc?.total_amount &&
                      orderDetails._doc?.advance_amount
                        ? orderDetails._doc.total_amount -
                          orderDetails._doc.advance_amount
                        : orderDetails.total_amount &&
                          orderDetails.advance_amount
                        ? orderDetails.total_amount -
                          orderDetails.advance_amount
                        : "N/A"}
                    </span>
                  </li>
                ) : null}

                {orderDetails._doc?.discount || orderDetails.discount ? (
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Discount:</strong>
                    <span>
                      ₹
                      {orderDetails._doc?.discount ||
                        orderDetails.discount ||
                        0}
                    </span>
                  </li>
                ) : null}

                {orderDetails._doc?.gst || orderDetails.gst ? (
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>GST:</strong>
                    <span>
                      ₹{orderDetails._doc?.gst || orderDetails.gst || 0}
                    </span>
                  </li>
                ) : null}

                {orderDetails._doc?.per_person_cost ||
                orderDetails.per_person_cost ? (
                  <li
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>Per person cost:</strong>
                    <span>
                      ₹
                      {orderDetails._doc?.per_person_cost ||
                        orderDetails.per_person_cost ||
                        0}
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPopup;
