import Image from "next/image";
import "./Actionpopup.css";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const categoryMap = {
  "65a92271ae1586258ccd0628": "anniversary-decoration",
  "65a95dcb6995e7401e78c2ea": "baby-shower-decoration",
  "65aeaf3747d5cb78ba19d4b6": "balloon-bouquets-decoration",
  "65a91598ae1586258cccffd4": "birthday-decoration",
  "65a92085ae1586258ccd04ff": "first-night-decoration",
  "66ad224731c3672040d8d32a": "haldi-mehendi-decoration",
  "65aeaf5147d5cb78ba19d4d3": "kids-birthday-decoration",
  "65a92efbae1586258ccd0c6e": "premium-decoration",
  "66c9df0922ed47b721180334": "Proposal-Decorations",
  "65a2d129513d9389d34e31d4": "welcome-baby-decoration",
  "66c44baf8bd9c45aaa2c42b5": "bachelorette-decoration",
};

const ActionPopup = ({
  isOpen,
  actionPopupOrderId,
  actionPopupChefOrderId,
  actionPopupOrderType,
  actionPopupChefOrder_Id,
  onClose,
}) => {
  const [popupType, setPopupType] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  let apiUrl = "";

  let foodDeliveryInclusions = [
    "Complementary - Green salad, Mint Chutney, Achar",
    "Doorstep Delivery",
    "Freshly cooked food",
    "Fork, Spoon, Tissue papers",
  ];
  let liveCateringInclusions = [
    "Well Groomed Waiters (2 Nos)",
    "Bone-china Crockery & Quality disposal for loose items",
    "Transport (to & fro)",
    "Dustbin with Garbage bag",
    "Head Mask for waiters & chefs",
    "Chafing Dish",
    "Cocktail Napkins",
    "2 Chefs",
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Set the popup type and corresponding API URL based on order type
    if (actionPopupOrderType === 1) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_decoration/${actionPopupOrderId}`;
      setPopupType("decoration");
    } else if (actionPopupOrderType === 2) {
      const chefOrderId = actionPopupChefOrder_Id.toString();
      apiUrl = `https://horaservices.com:3000/api/order/order_details/v1/${chefOrderId}`;
      setPopupType("chef");
    } else if (actionPopupOrderType === 6 || actionPopupOrderType === 7) {
      // alert(actionPopupOrderType)
      apiUrl = `https://horaservices.com:3000/api/order/order_details_food_delivery/${actionPopupOrderId}`;
      setPopupType("foodDelivery");
    } else if (actionPopupOrderType === 8) {
      // Need new api for photograpgy
      const photographyOrderId = actionPopupChefOrderId.toString();
      apiUrl = `https://horaservices.com:3000/api/order/order_details_photography/${photographyOrderId}`;
      // https://horaservices.com:3000/api/order/order_details_photography/9753
      setPopupType("Photography");
    } else {
      setError("Currently, data is not available");
      setPopupType("");
      setLoading(false);
      return;
    }

    // Fetch data from the API
    const fetchOrderapi = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setLoading(false);
        // setPhotographyProductName(data.data.items[0].photography.name);

        if (!data.error && data.status === 200) {
          setOrderDetails(data.data);
        } else {
          setError("Failed to fetch order details");
        }
      } catch (error) {
        setLoading(false);
        setError("Error fetching order details");
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderapi();
  }, [actionPopupOrderId, actionPopupChefOrderId, actionPopupOrderType]);

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };

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

  const getItemInclusion = (inclusion) => {
    if (!Array.isArray(inclusion) || inclusion.length === 0) {
      return null;
    }
    const htmlString = inclusion[0];
    const withoutTags = htmlString.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const withoutSpecialChars = withoutTags.replace(/&#[^;]*;/g, " "); // Replace &# sequences with space
    const statements = withoutSpecialChars.split("<div>");
    const inclusionItems = statements.flatMap((statement) =>
      statement.split("-").filter((item) => item.trim() !== "")
    );
    const inclusionList = inclusionItems.map((item, index) => (
      <li key={index} className="inclusionstyle">
        {item.trim()}
      </li>
    ));
    return (
      <>
        <div
          style={{
            fontSize: "21px",
            borderBottom: "1px solid #e7eff9",
            marginBottom: "10px",
          }}
        >
          Inclusions
        </div>
        <ul>
          <li>{inclusionList}</li>
        </ul>
      </>
    );
  };

  // console.log(orderDetails.items[0].photography.name, "orderdetailssorry");
  // setPhotographyProductName(orderDetails.items[0].photography.name);
  // fetch orderdetails
  const FetchOrderDetails = ({ orderDetails }) => {
    // console.log(getOrderType(orderDetails?.type), JSON.stringify(orderDetails))

    return (
      <div>
        <div className="order-details-container">
          <h2 className="popup-title">Order Details</h2>
          <div className="order-grid">
            <div className="order-details-box">
              <div className="order-detail-row">
                <p>
                  <strong>Order Number:</strong>{" "}
                  {getOrderId(orderDetails?.order_id)}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(orderDetails?.order_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>No of burners:</strong>{" "}
                  {orderDetails?.no_of_burner || 0}
                </p>
                <p>
                  <strong>No of people:</strong>{" "}
                  {orderDetails?.no_of_people || 0}
                </p>
                <p>
                  <strong>City:</strong> {orderDetails?.order_locality || "N/A"}
                </p>
                <p>
                  <strong>Order Type:</strong>{" "}
                  {getOrderType(orderDetails?.type)}
                </p>
                <p>
                  <strong>Order Address:</strong>{" "}
                  {orderDetails?.addressId?.address1 || "N/A"}
                </p>
                <p>
                  <strong>Order Comments:</strong>{" "}
                  {orderDetails.decoration_comments || "N/A"}
                </p>
              </div>
              <h3>Ordered Items:</h3>
              <div className="order-items-container">
                {orderDetails?.type === 6 ? (
                  <>
                    {orderDetails?.order_taken_by === "Booked Online"
                      ? // Use selecteditems with userOrderDishImageArray for quantity and price
                        orderDetails?.selecteditems?.length > 0 && (
                          <ul className="order-items-list">
                            {orderDetails.selecteditems.map((item) => {
                              const dishDetails =
                                orderDetails?.userOrderDishImageArray[0]?.[
                                  item.name
                                ] || null;
                              return (
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
                                    {dishDetails?.quantity && (
                                      <span className="order-item-quantity">
                                        {dishDetails.quantity}{" "}
                                        {dishDetails.unit || ""}
                                      </span>
                                    )}
                                    <span className="order-item-price">
                                      ₹{dishDetails?.price}
                                    </span>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )
                      : // Original logic for type 6 when not "Booked Online"
                        orderDetails?.items?.length > 0 && (
                          <ul className="order-items-list">
                            {orderDetails.items.map((item) => (
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
                                  <span className="order-item-quantity">
                                    {item.quantity} {item.unit}
                                  </span>
                                  <span className="order-item-price">
                                    ₹{item.price}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                  </>
                ) : orderDetails?.type === 7 ? (
                  <ul className="order-items-list">
                    {orderDetails?.selecteditems?.map((item) => {

                      const d2 = orderDetails.items;
                      const dishDetails =
                        orderDetails?.userOrderDishImageArray[0]?.[item.name] ||
                        null;
                      return (
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
                            {dishDetails?.quantity && (
                              <span className="order-item-quantity">
                                {dishDetails.quantity} {dishDetails.unit || ""}
                              </span>
                            )}
                            <span>{d2.quantity}</span>
                            <span className="order-item-price">
                              ₹{dishDetails?.price}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div>
                    <ul className="order-items-list">
                      {orderDetails?.selecteditems?.map((item) => (
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
                )}
              </div>

              {orderDetails?.type === 2 && (
                <>
                  <h3>Ingredient Used:</h3>
                  <div className="order-items-container">
                    <ul className="order-items-list">
                      {orderDetails?.selecteditems[0]?.ingredientUsed.map(
                        (item) => (
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
                                {item.qty} {item.unit}
                              </span>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </>
              )}

              {orderDetails?.type === 6 ? (
                <>
                  <h3>Inclusions</h3>
                  <ul>
                    {foodDeliveryInclusions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                    {orderDetails?.userOrderDishImageArray[0].hasOwnProperty(
                      "water/disposal"
                    ) && <li>Disposable plates,Bisleri Water bottles</li>}
                  </ul>
                </>
              ) : orderDetails?.type === 7 ? (
                <>
                  <h3>Inclusions</h3>
                  <ul>
                    {liveCateringInclusions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
            <div className="order-summary-box">
              <h3 style={{ color: "white" }}>Order Summary</h3>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <li className="priceList">
                  <strong>Total Amount:</strong>{" "}
                  <span>₹{orderDetails.total_amount}</span>
                </li>
                <li className="priceList">
                  <strong>Advance Amount:</strong>{" "}
                  <span>₹{orderDetails.advance_amount || 0}</span>
                </li>

                <li className="priceList">
                  <span>Balance Amount</span>
                  <span>
                    {/* {orderDetails?.total_amount && orderDetails?.advance_amount
                      ? `₹ ${(orderDetails.total_amount - orderDetails.advance_amount)}`
                      : 0} */}
                    ₹{orderDetails.balance_amount || 0}
                  </span>
                </li>

                <li className="priceList">
                  <strong>Discount:</strong>{" "}
                  <span>₹{orderDetails.discount || 0}</span>
                </li>
                <li className="priceList">
                  <strong>GST:</strong> <span>₹{orderDetails.gst || 0}</span>
                </li>
                <li className="priceList">
                  <strong>Per person cost:</strong>{" "}
                  <span>₹{orderDetails.per_person_cost || 0}</span>
                </li>
              </ul>
              <button
                className="startbutton"
                onClick={() => {
                  if (orderDetails?.type === 2) {
                    sendOrderDetailsToWhatsAppchef(orderDetails); // Call for type 2
                  } else if (
                    orderDetails?.type === 6 ||
                    orderDetails?.type === 7
                  ) {
                    sendOrderDetailsToWhatsAppFood(orderDetails); // Call for type 6 or 7
                  }
                }}
              >
                Copy Order Summary(For Vendor)
              </button>
              <button
                className="startbutton"
                onClick={() => createdCsvFileOfVendorFood(orderDetails)}
              >
                Vendor Food Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // share on whatsapp========================
  const sendOrderDetailsToWhatsAppDoc = () => {

    // Extract order details
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";
    const orderDate =
      new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    // const orderType = getOrderType(orderDetails.type) || "N/A";
    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const decorationComments = orderDetails?.decoration_comments || "N/A";
    const addOnItems = orderDetails?.add_on || [];
    // Create a Google Maps link
    const googleMapUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(
      googleMapLocation
    )}`;
    // Calculate balance amount
    let balanceAmount = 0;
    if (orderDetails?.phone_no) {
      balanceAmount = orderDetails?.total_amount - orderDetails?.advance_amount;
    } else {
      if ([2, 3, 4, 5].includes(orderDetails?.type)) {
        balanceAmount = Math.round((orderDetails?.payable_amount * 4) / 5);
      } else if ([6, 7].includes(orderDetails?.type)) {
        balanceAmount = Math.round(orderDetails?.payable_amount * 0.35);
      } else {
        balanceAmount = Math.round(orderDetails?.payable_amount * 0.65);
      }
    }

    // Construct the message
    // Order Type: ${orderType}\n
    let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\nAddress: ${address}\nGoogleMapLocation: ${googleMapUrl}\nArrival Time: ${orderTime}\n\n*Amount:₹${balanceAmount}*\n\n*Comments*:\n ${decorationComments}\n`;

    // Add Add-On Items
    message += `\n*Add-On Items:*\n`;

    if (addOnItems && addOnItems?.length > 0) {
      addOnItems.forEach((item, index) => {
        const itemLabel = [item.name, item.title].filter(Boolean).join(" ");
        message += `\n${index + 1}. ${itemLabel}: ₹${item.price}`;
      });
    } else {
      message += ` None`;
    }

    // Add Decoration Items
    orderDetails?.items.forEach((item) => {
      const dec = item?.decoration;
      if (dec) {
        // check if decoration exists
        message += `\n\n*Product Name:* ${dec?.name}\n*Image URL:* https://horaservices.com/api/uploads/${dec?.featured_image}\n`;
        const inclusionText = getCleanInclusionText(dec?.inclusion); // format inclusion text
        message += `\n*Inclusion:* \n${inclusionText}`;
      }
    });

    // Open WhatsApp with the pre-filled message
    // const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    // window.open(whatsappUrl, "_blank");
    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Order details have been copied to the clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy order details to clipboard: ", err);
      });
  };

  const sendOrderDetailsToWhatsAppDocUsers = async () => {
    try {
      setLoading(true);


      const orderId = getOrderId(orderDetails?.order_id) || "N/A";
      const orderDate =
        new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
      const address = orderDetails?.addressId?.address1 || "N/A";
      const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
      const orderTime = orderDetails?.order_time || "N/A";
      const decorationComments = orderDetails?.decoration_comments || "N/A";
      const addOnItems = orderDetails?.add_on || [];
      const googleMapUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(
        googleMapLocation
      )}`;

      let balanceAmount = orderDetails.total_amount;
      let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\nAddress: ${address}\nGoogleMapLocation: ${googleMapUrl}\nArrival Time: ${orderTime}\n\n*Amount: ₹${balanceAmount}*\n\n*Comments*:\n ${decorationComments}\n`;

      message += `\n*Add-On Items:*\n`;

      if (addOnItems && addOnItems?.length > 0) {
        addOnItems.forEach((item, index) => {
          const itemLabel = [item?.name, item?.title].filter(Boolean).join(" ");
          message += `\n${index + 1}. ${itemLabel}: ₹${item?.price}`;
        });
      } else {
        message += ` None`;
      }

      // Loop through decorations and append dynamic URL info
      for (const item of orderDetails.items) {
        const dec = item?.decoration; // single object
        if (!dec) continue; // skip if no decoration

        message += `\n\n*Product Name:* ${dec.name}\n`;

        // 🔄 Dynamic URL based on API response
        const encodedName = encodeURIComponent(dec.name);
        try {
          const response = await axios.get(
            `https://horaservices.com:3000/api/Decoration/searchByName/${encodedName}`
          );
          const product = response.data.data?.[0];

          if (product && product.tag?.length > 0) {
            const matchedTag = product.tag.find((tag) => categoryMap[tag]);
            if (matchedTag) {
              const categoryName = categoryMap[matchedTag];
              const formattedName = dec.name.split(" ").join("-");
              const finalUrl = `https://horaservices.com/balloon-decoration/${categoryName}/product/${formattedName}`;
              message += `*Product Page:* ${finalUrl}\n`;
            } else {
              console.warn("❌ No matching tag found for:", dec.name);
            }
          } else {
            console.warn("❌ Product not found in API for:", dec.name);
          }
        } catch (apiErr) {
          console.error("❌ API call failed for:", dec.name, apiErr);
        }

        const inclusionText = getCleanInclusionText(dec.inclusion);
        message += `\n*Inclusion:* \n${inclusionText}`;
      }

      await navigator.clipboard.writeText(message);
      alert("Order details have been copied to the clipboard!");
    } catch (err) {
      console.error("Failed to send order details:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendOrderDetailsToWhatsAppPhoto = () => {
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";
    const orderDate =
      new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const decorationComments = orderDetails?.decoration_comments || "N/A";
    const addOnItems = orderDetails?.add_on || [];

    // Format Inclusion Section
    let inclusionText = "None";
    const inclusionRaw =
      orderDetails.items?.[0]?.photography?.inclusion?.[0] || "";

    if (inclusionRaw) {
      const cleaned = inclusionRaw
        .replace(/<\/div>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/\n+/g, "\n")
        .trim();

      // Add '-' at the beginning of each line
      inclusionText = cleaned
        .split("\n")
        .map((line) => `${line.trim()}`)
        .join("\n");
    }

    const googleMapUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(
      googleMapLocation
    )}`;

    let balanceAmount = 0;
    if (orderDetails.phone_no) {
      balanceAmount = orderDetails.total_amount - orderDetails.advance_amount;
    } else {
      if ([2, 3, 4, 5].includes(orderDetails?.type)) {
        balanceAmount = Math.round((orderDetails?.payable_amount * 4) / 5);
      } else if ([6, 7].includes(orderDetails?.type)) {
        balanceAmount = Math.round(orderDetails?.payable_amount * 0.35);
      } else {
        balanceAmount = Math.round(orderDetails?.payable_amount * 0.65);
      }
    }

    let message = `📸 *Photography Order Details:*\n\n`;
    message += `*Order ID:* ${orderId}\n`;
    message += `*Order Date:* ${orderDate}\n`;
    message += `*Address:* ${address}\n`;
    message += `*Google Map Location:* ${googleMapUrl}\n`;
    message += `*Arrival Time:* ${orderTime}\n`;
    message += `\n💰 *Amount: ₹${balanceAmount}*\n`;
    message += `\n📝 *Comments:*\n${decorationComments || "None"}\n`;

    // ✅ Final Bullet-formatted Inclusion section
    message += `\n📷 *Order Included:*\n${inclusionText}\n`;

    // ✅ Add-ons
    message += `\n➕ *Add-ons:*\n`;
    if (addOnItems.length > 0) {
      addOnItems.forEach((item, index) => {
        message += `\n${index + 1}. ${item.title}\n   - ₹${item.price} x ${
          item.quantity
        }\n   - ${item.description}`;
      });
    } else {
      message += `\nNone`;
    }

    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Order details have been copied to the clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy order details to clipboard: ", err);
      });
  };

  const sendOrderDetailsToWhatsAppchef = (orderDetails) => {

    // Extract details
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";
    const orderDate =
      new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const decorationComments = orderDetails?.decoration_comments || "N/A";
    // Create a Google Maps link
    const googleMapUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(
      googleMapLocation
    )}`;
    // Calculate balance amount
    const balanceAmount =
      orderDetails?.total_amount && orderDetails?.advance_amount
        ? orderDetails.total_amount - orderDetails.advance_amount
        : "N/A";

    // Start building the message
    let message = `Chef Order Summary::\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\n\nAddress: ${address}\nGoogleMapLocation: ${googleMapUrl}\n\nArrival Time: ${orderTime}\n\n*Amount: ₹${balanceAmount}*\nComments: ${decorationComments}\n\n*Dishes*\n`;

    // Append each dish to the message
    if (orderDetails?.selecteditems?.length) {
      message += orderDetails.selecteditems.map((item) => item.name).join("\n");
    } else {
      message += "No dishes selected";
    }
    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Order details have been copied to the clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy order details to clipboard: ", err);
      });
    // Open WhatsApp with the pre-filled message
    // const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    // window.open(whatsappUrl, "_blank");
  };

  const sendOrderDetailsToWhatsAppFood = (orderDetails) => {

    // Extract details
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";
    const orderDate =
      new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    const address = orderDetails?.addressId?.address1;
    const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const orderCity = orderDetails?.order_locality || "NA";
    const peopleCount = orderDetails?.no_of_people || "NA";
    const orderType = getOrderType(orderDetails?.type) || "NA";
    let disposalInclusion =
      orderDetails?.userOrderDishImageArray[0].hasOwnProperty("water/disposal");
    let inclusions = [];
    // const ItemQuantity = orderDetails?.userOrderDishImageArray || "NA"
    // Create a Google Maps link
    const googleMapUrl = orderDetails?.addressId?.address2
      ? `https://www.google.com/maps/search/?q=${encodeURIComponent(
          googleMapLocation
        )}`
      : "NA";
    // Calculate balance amount
    const balanceAmount =
      orderDetails?.total_amount && orderDetails?.advance_amount
        ? orderDetails?.total_amount - orderDetails?.advance_amount
        : "N/A";
    if (orderType === "Food Delivery") {
      inclusions = [...foodDeliveryInclusions]; // Copy the food delivery inclusions

      if (disposalInclusion) {
        inclusions.push(
          "Disposable plates, Fork, Spoon, Tissue papers, Bisleri Water bottles"
        );
      }
    } else if (orderType === "Live Catering") {
      inclusions = [...liveCateringInclusions]; // Copy the live catering inclusions
    } else {
      inclusions = ["No specific inclusions for this order type"];
    }
    // Start building the message
    let message = `*${orderType} Order Summary:*\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\n\nCity: ${orderCity}\nGuest Count: ${peopleCount}\nTime of Delivery: ${orderTime}\n\nAddress: ${address}\n\nGoogleMapLocation: ${googleMapUrl}\n*Amount: ₹${balanceAmount}*\n\n*Dishes*\n`;

    // Append each dish to the message

    if (orderDetails?.order_taken_by === "Booked Online") {
      // Use userOrderDishImageArray
      if (orderDetails?.userOrderDishImageArray?.length) {
        const dishesObject = orderDetails.userOrderDishImageArray[0];
        message += Object.entries(dishesObject)
          .map(([dishName, details]) => {
            if (details.quantity && details.unit) {
              return `${dishName}: ${details.quantity} ${details.unit}`;
            } else if (details.quantity) {
              return `${dishName}: ${details.quantity}`;
            }
            return null;
          })
          .filter(Boolean)
          .join("\n");
      } else {
        message += "No dishes selected";
      }
    } else {
      // Use items
      if (orderDetails?.items?.length) {
        message += orderDetails.items
          .map((item) => {
            if (item.quantity && item.unit) {
              return `${item.name}: ${item.quantity} ${item.unit}`;
            } else if (item.quantity) {
              return `${item.name}: ${item.quantity}`;
            }
            return `${item.name}`;
          })
          .join("\n");
      } else {
        message += "No items selected";
      }
    }

    message += "\n\n*Inclusions:*\n-" + inclusions.join("\n-");
    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Order details have been copied to the clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy order details to clipboard: ", err);
      });
    // Open WhatsApp with the pre-filled message
    // const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    // window.open(whatsappUrl, "_blank");
  };

  // const createdCsvFileOfVendorFood = (orderDetails) => {
  //   console.log(orderDetails, "orderdetaillskeyboard");
  // };

  function createdCsvFileOfVendorFood(orderDetails) {
    // Build order info section
    const orderInfo = [
      ["Guest Count", orderDetails.no_of_people || ""],
      [
        "Order Date",
        orderDetails.order_date
          ? new Date(orderDetails.order_date).toLocaleDateString("en-GB")
          : "",
      ],
      ["Times of Delivery", orderDetails.order_time || ""],
      ["Address", orderDetails.addressId?.address1 || ""],
      ["Google Map Location", orderDetails.addressId?.address2 || ""],
      ["City", orderDetails.order_locality || ""],
      [],
    ];

    // Build items table headers
    const headers = ["Item Name", "Quantity(Customer)", "Price", "Amount"];
    const rows = [];

    // Map selecteditems array (array of IDs) to actual items
    const selectedItemsMap = {};
    if (Array.isArray(orderDetails.selecteditems)) {
      orderDetails.items.forEach((item) => {
        if (orderDetails.selecteditems.includes(item.itemId)) {
          selectedItemsMap[item.itemId] = item;
        }
      });
    }

    // Loop through items
    orderDetails.items.forEach((item) => {
      const matchedItem = selectedItemsMap[item.itemId] || item;

      let itemName = matchedItem.photography?.name || matchedItem.name || "N/A";
      let quantity = matchedItem.quantity || 1;
      let unit = matchedItem.unit || "";
      let price = matchedItem.photography?.price || matchedItem.price || 0;
      let displayQuantity = unit ? `${quantity} ${unit}` : quantity;

      const amount = price * quantity;

      rows.push([itemName, displayQuantity, price, amount.toFixed(2)]);
    });

    if (rows.length === 0) {
      alert("No matching items found.");
      return;
    }

    // Merge order info + table data
    const sheetData = [...orderInfo, headers, ...rows];

    // Create XLSX workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Style headers
    for (let C = 0; C < headers.length; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: orderInfo.length, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Set column widths
    ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Vendor Food Report");

    // Export as XLSX file
    XLSX.writeFile(wb, "vendor_food_report.xlsx");
  }

  //   function createdCsvFileOfVendorFood(orderDetails) {
  //     const headers = ["Item Name", "Quantity(Customer)", "Price", "Packaging Material", "Amount"];
  //     const rows = [];

  //     orderDetails.items.forEach(item => {
  //         const selectedItem = orderDetails.selecteditems.find(sel => sel._id === item._id);

  //         if (selectedItem && Array.isArray(selectedItem.cuisineArray) && selectedItem.cuisineArray.length >= 4) {
  //             const pieces = parseFloat(selectedItem.cuisineArray[1]); // e.g. 2.5
  //             const price = parseFloat(selectedItem.cuisineArray[3]);  // e.g. 35
  //             const packagingMaterial = selectedItem.cuisineArray[selectedItem.cuisineArray.length - 1];

  //             // Handle quantity conversion if KG
  //             let quantity = parseFloat(item.quantity);
  //             let displayQuantity = `${item.quantity} ${item.unit}`;
  //             if (item.unit && item.unit.toLowerCase() === "kg") {
  //                 quantity = quantity * 1000; // Convert KG to grams
  //                 displayQuantity = `${quantity} g`; // Show in grams
  //             }

  //             // Calculate Amount
  //             const amount = (quantity / pieces) * price;

  //             rows.push([
  //                 item.name,
  //                 displayQuantity,
  //                 price,
  //                 packagingMaterial,
  //                 amount.toFixed(2)
  //             ]);
  //         }
  //     });

  //     if (rows.length === 0) {
  //         alert("No matching items found.");
  //         return;
  //     }

  //     // Convert order date to dd/mm/yy
  //     let orderDateStr = "";
  //     if (orderDetails.order_date) {
  //         const dateObj = new Date(orderDetails.order_date);
  //         const dd = String(dateObj.getDate()).padStart(2, '0');
  //         const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  //         const yy = String(dateObj.getFullYear()).slice(-2);
  //         orderDateStr = `${dd}/${mm}/${yy}`;
  //     }

  //     // Build CSV content with order info at the top
  //     let csvContent = "";
  //     csvContent += `Guest Count,${orderDetails.no_of_people || ""}\n`;
  //     csvContent += `Order Date,${orderDateStr}\n`;
  //     csvContent += `Times of Delivery,${orderDetails.order_time || ""}\n`;
  //     csvContent += `Address,${orderDetails.addressId?.address1 || ""}\n`;
  //     csvContent += `Google Map Location,${orderDetails.addressId?.address2 || ""}\n`;
  //     csvContent += `City,${orderDetails.order_locality || ""}\n\n`;

  //     // Add table headers and rows
  //     csvContent += headers.join(",") + "\n";
  //     rows.forEach(row => {
  //         csvContent += row.map(val => `"${val}"`).join(",") + "\n";
  //     });

  //     // Trigger CSV download
  //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.setAttribute("href", url);
  //     link.setAttribute("download", "vendor_food.csv");
  //     link.click();
  // }

  // working model
  //   function createdCsvFileOfVendorFood(orderDetails) {
  //     const headers = ["Item Name", "Quantity(Customer)", "Price", "Packaging Material", "Amount"];
  //     const rows = [];

  //     orderDetails.items.forEach(item => {
  //         const selectedItem = orderDetails.selecteditems.find(sel => sel._id === item._id);

  //         if (selectedItem && Array.isArray(selectedItem.cuisineArray) && selectedItem.cuisineArray.length >= 4) {
  //             const pieces = parseFloat(selectedItem.cuisineArray[1]); // 2.5 in example
  //             const price = parseFloat(selectedItem.cuisineArray[3]);  // 35 in example
  //             const packagingMaterial = selectedItem.cuisineArray[selectedItem.cuisineArray.length - 1];

  //             // Handle quantity conversion if KG
  //             let quantity = parseFloat(item.quantity);
  //             let displayQuantity = `${item.quantity} ${item.unit}`;
  //             if (item.unit && item.unit.toLowerCase() === "kg") {
  //                 quantity = quantity * 1000; // Convert KG to grams
  //                 displayQuantity = `${quantity} g`; // Display in grams
  //             }

  //             // Calculate Amount
  //             const amount = (quantity / pieces) * price;

  //             rows.push([
  //                 item.name,
  //                 displayQuantity,
  //                 price,
  //                 packagingMaterial,
  //                 amount.toFixed(2)
  //             ]);
  //         }
  //     });

  //     if (rows.length === 0) {
  //         alert("No matching items found.");
  //         return;
  //     }

  //     let csvContent = headers.join(",") + "\n";
  //     rows.forEach(row => {
  //         csvContent += row.map(val => `"${val}"`).join(",") + "\n";
  //     });

  //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.setAttribute("href", url);
  //     link.setAttribute("download", "vendor_food.csv");
  //     link.click();
  // }

  //   function createdCsvFileOfVendorFood(orderDetails) {
  //     console.log(orderDetails, "orderdorkdfjdslkjfdsf");
  //     const headers = ["Item Name", "Quantity(Customer)", "Price", "Packaging Material"];
  //     const rows = [];

  //     orderDetails.items.forEach(item => {
  //         const selectedItem = orderDetails.selecteditems.find(sel => sel._id === item._id);

  //         if (selectedItem && Array.isArray(selectedItem.cuisineArray)) {
  //             const packagingMaterial = selectedItem.cuisineArray[selectedItem.cuisineArray.length - 1];

  //             rows.push([
  //                 item.name,
  //                 `${item.quantity} ${item.unit}`, // Quantity with unit
  //                 item.price,
  //                 packagingMaterial
  //             ]);
  //         }
  //     });

  //     if (rows.length === 0) {
  //         alert("No matching items found.");
  //         return;
  //     }

  //     let csvContent = headers.join(",") + "\n";
  //     rows.forEach(row => {
  //         csvContent += row.map(val => `"${val}"`).join(",") + "\n";
  //     });

  //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.setAttribute("href", url);
  //     link.setAttribute("download", "vendor_food.csv");
  //     link.click();
  // }

  return (
    <>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button onClick={onClose} className="close-btn">
              ✖
            </button>

            {error && <div className="error-message">{error}</div>}
            {popupType === "decoration" && orderDetails ? (
              loading ? (
                <div className="loader">Loading...</div> // Replace with a styled loader if needed
              ) : (
                <div className="order-details-container">
                  <h2 className="popup-title">Order Details</h2>
                  <div className="order-grid">
                    <div className="order-details-box">
                      <div className="order-detail-row">
                        <p>
                          <strong> Order Id:</strong>{" "}
                          {getOrderId(orderDetails.order_id)}
                        </p>
                        {/* <p><strong>Order Id:</strong> {orderDetails.otp}</p> */}
                        <p>
                          <strong>Order Date:</strong>{" "}
                          {new Date(
                            orderDetails.order_date
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Order Type:</strong>{" "}
                          {getOrderType(orderDetails.type)}
                        </p>
                        <p>
                          <strong>Order City:</strong>{" "}
                          {orderDetails.order_locality || "N/A"}
                        </p>
                        <p>
                          <strong>Order Address:</strong>{" "}
                          {orderDetails.addressId?.address1 || "N/A"}
                        </p>
                        <p>
                          <strong>Order Google Map Location:</strong>{" "}
                          {orderDetails.addressId?.address2 || "N/A"}
                        </p>
                        <p>
                          <strong>Order Time:</strong>{" "}
                          {orderDetails.order_time || "N/A"}
                        </p>

                        <p>
                          <strong>Order Add On:</strong>{" "}
                          {orderDetails.add_on.length > 0 ? (
                            <ul>
                              {orderDetails.add_on.map((item, index) => (
                                <li key={index}>
                                  <strong>
                                    {item.name} {item.title}
                                  </strong>
                                  : ₹{item.price}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </p>

                        <p>
                          <strong>Order decoration_comments:</strong>{" "}
                          {orderDetails.decoration_comments || "N/A"}
                        </p>
                        <p>
                          {orderDetails.items.map((item, itemIndex) => {
                            const dec = item.decoration; // single object
                            if (!dec) return null; // skip if no decoration

                            return (
                              <div key={`item-${itemIndex}-${dec.name}`}>
                                <p>
                                  <strong>Product Name:</strong> {dec.name}
                                </p>
                                <p>
                                  <strong>Product Price:</strong> {dec.price}
                                </p>
                                <p>
                                  <Image
                                    src={`https://horaservices.com/api/uploads/compressed_webp/${
                                      dec.featured_image.split(".")[0]
                                    }.webp`}
                                    width={200}
                                    height={200}
                                    alt={`${dec.featured_image}-name`}
                                  />
                                </p>
                                <div>{getItemInclusion(dec.inclusion)}</div>
                              </div>
                            );
                          })}
                        </p>
                        {/* <p>Decoration Order Images</p> */}
                        <strong>Decoration Order Images</strong>
                        <p>
                          {/* {orderDetails.userOrderDishImageArray[0]} */}

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap", // allows the images to wrap to the next row
                              gap: "10px", // space between images
                              justifyContent: "flex-start", // align items to the left (can be adjusted)
                            }}
                          >
                            {orderDetails.userOrderDishImageArray.map(
                              (image, index) => {
                                const imageName = typeof image === "string" ? image : image?.image;
                                const imageUrl = imageName
                                ? `https://horaservices.com/api/uploads/${imageName}`
                                 : "";             
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      width: "150px", // Adjust the width of the image containers
                                      height: "150px", // Adjust the height as well
                                      overflow: "hidden", // Prevents images from overflowing their container
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Dish ${index + 1}`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover", // Keeps the aspect ratio and covers the area
                                      }}
                                    />
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </p>

                        {/* <p>{userOrderDishImageArray[0]}</p> */}
                      </div>
                    </div>

                    <div className="order-summary-box">
                      <h3 style={{ color: "white" }}>Order Summary</h3>
                      <ul style={{ listStyleType: "none", padding: 0 }}>
                        <li className="priceList">
                          <strong>Total Amount:</strong>{" "}
                          <span>₹{orderDetails.total_amount}</span>
                        </li>
                        <li className="priceList">
                          <strong>Advance Amount:</strong>{" "}
                          <span>₹{orderDetails.advance_amount || 0}</span>
                        </li>

                        <li className="priceList">
                          <span>Balance Amount</span>
                          <span>
                            {orderDetails?.total_amount &&
                            orderDetails?.advance_amount
                              ? `₹ ${
                                  orderDetails.total_amount -
                                  orderDetails.advance_amount
                                }`
                              : "N/A"}
                          </span>
                        </li>

                        <li className="priceList">
                          <strong>Discount:</strong>{" "}
                          <span>₹{orderDetails.discount || 0}</span>
                        </li>
                        <li className="priceList">
                          <strong>GST:</strong>{" "}
                          <span>₹{orderDetails.gst || 0}</span>
                        </li>
                        <li className="priceList">
                          <strong>Per person cost:</strong>{" "}
                          <span>₹{orderDetails.per_person_cost || 0}</span>
                        </li>
                      </ul>
                      <button
                        className="startbutton"
                        onClick={sendOrderDetailsToWhatsAppDoc}
                      >
                        Copy Order Summary(For Vendor)
                      </button>

                      <button
                        className="startbutton"
                        onClick={sendOrderDetailsToWhatsAppDocUsers}
                      >
                        Copy Order Summary(For Users)
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : null}
            {popupType === "chef" && orderDetails ? (
              loading ? (
                <div className="loader">Loading...</div> // Replace with a styled loader if needed
              ) : (
                <FetchOrderDetails orderDetails={orderDetails} />
              )
            ) : null}

            {popupType === "foodDelivery" && orderDetails ? (
              loading ? (
                <div className="loader">Loading...</div> // Replace with a styled loader if needed
              ) : (
                <FetchOrderDetails orderDetails={orderDetails} />
              )
            ) : null}
            {popupType === "Photography" && orderDetails ? (
              loading ? (
                <div className="loader">Loading...</div> // Replace with a styled loader if needed
              ) : (
                <div className="order-details-container">
                  <h2 className="popup-title">Order Details</h2>
                  <div className="order-grid">
                    <div className="order-details-box">
                      <div className="order-detail-row">
                        <p>
                          <strong>Product Name:</strong>{" "}
                          {orderDetails.items[0].photography.name}
                        </p>
                        <p>
                          <strong>Order Id:</strong>{" "}
                          {getOrderId(orderDetails.order_id)}
                        </p>
                        <p>
                          <strong>Order Date:</strong>{" "}
                          {new Date(
                            orderDetails.order_date
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Order Type:</strong>{" "}
                          {getOrderType(orderDetails.type)}
                        </p>
                        <p>
                          <strong>Order City:</strong>{" "}
                          {orderDetails.order_locality || "N/A"}
                        </p>
                        <p>
                          <strong>Order Address:</strong>{" "}
                          {orderDetails.addressId?.address1 || "N/A"}
                        </p>
                        <p>
                          <strong>Order Google Map Location:</strong>{" "}
                          {orderDetails.addressId?.address2 || "N/A"}
                        </p>
                        <p>
                          <strong>Order Time:</strong>{" "}
                          {orderDetails.order_time || "N/A"}
                        </p>
                        <p>
                          <strong>Order Comments:</strong>{" "}
                          {orderDetails.decoration_comments || "N/A"}
                        </p>

                        <div
                          style={{
                            backgroundColor: "#f9f9f9",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            marginTop: "16px",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            color: "#333",
                          }}
                        >
                          <p
                            style={{
                              marginBottom: "8px",
                              fontWeight: "600",
                              fontSize: "15px",
                              color: "#444",
                            }}
                          >
                            Order Included:
                          </p>
                          {orderDetails.items[0].photography &&
                          orderDetails.items[0].photography.length > 0 &&
                          orderDetails.items[0].photography.inclusion &&
                          orderDetails.items[0].photography.inclusion.length >
                            0 ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  orderDetails.items[0].photography
                                    .inclusion[0],
                              }}
                            />
                          ) : (
                            <p style={{ fontSize: "13px", color: "#777" }}>
                              N/A
                            </p>
                          )}
                        </div>

                        <div
                          style={{
                            backgroundColor: "#f3f4f6",
                            padding: "16px 12px",
                            borderRadius: "12px",
                            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.03)",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                              padding: "16px",
                            }}
                          >
                            <p
                              style={{
                                fontWeight: "600",
                                fontSize: "14px",
                                marginBottom: "12px",
                              }}
                            >
                              <strong>ADD-ON:</strong>
                            </p>

                            {(() => {
                              const addOns =
                                Array.isArray(orderDetails.add_on) &&
                                orderDetails.add_on.filter(
                                  (item) =>
                                    item &&
                                    typeof item === "object" &&
                                    Object.keys(item).length > 0 &&
                                    item.title
                                );

                              if (!addOns || addOns.length === 0) {
                                return (
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "#6b7280",
                                      marginTop: "6px",
                                    }}
                                  >
                                    N/A
                                  </p>
                                );
                              }

                              return (
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "16px",
                                  }}
                                >
                                  {addOns.map((item, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "10px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                        overflow: "hidden",
                                        display: "flex",
                                        flexDirection: "column",
                                        border: "1px solid #e5e7eb",
                                      }}
                                    >
                                      {/* Image */}
                                      <div
                                        style={{
                                          width: "100%",
                                          height: "120px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <Image
                                          src={item.image}
                                          alt={item.title}
                                          width={240}
                                          height={120}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      </div>

                                      {/* Info */}
                                      <div
                                        style={{
                                          padding: "10px",
                                          textAlign: "left",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#059669",
                                          }}
                                        >
                                          ₹{item.price}
                                        </p>
                                        <h3
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            color: "#1f2937",
                                            marginTop: "2px",
                                          }}
                                        >
                                          {item.title}
                                        </h3>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            marginTop: "4px",
                                          }}
                                        >
                                          {item.description}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/*  */}
                      </div>
                    </div>

                    <div className="order-summary-box">
                      <h3 style={{ color: "white" }}>Order Summary</h3>
                      <ul style={{ listStyleType: "none", padding: 0 }}>
                        <li className="priceList">
                          <strong>Total Amount:</strong>{" "}
                          <span>₹{orderDetails.total_amount}</span>
                        </li>
                        <li className="priceList">
                          <strong>Advance Amount:</strong>{" "}
                          <span>₹{orderDetails.advance_amount || 0}</span>
                        </li>
                        <li className="priceList">
                          <span>Balance Amount</span>
                          <span>
                            {orderDetails.total_amount -
                              orderDetails.advance_amount}
                          </span>
                        </li>
                        <li className="priceList">
                          <strong>Discount:</strong>{" "}
                          <span>₹{orderDetails.discount || 0}</span>
                        </li>
                        <li className="priceList">
                          <strong>GST:</strong>{" "}
                          <span>₹{orderDetails.gst || 0}</span>
                        </li>
                        <li className="priceList">
                          <strong>Per person cost:</strong>{" "}
                          <span>₹{orderDetails.per_person_cost || 0}</span>
                        </li>
                      </ul>
                      <button
                        className="startbutton"
                        onClick={sendOrderDetailsToWhatsAppPhoto}
                      >
                        Copy Order Summary
                        <br />
                        (For Vendor)
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default ActionPopup;
