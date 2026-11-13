import Image from "next/image";
import "./Actionpopup.css";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import CallChecklistContent from "./CallChecklistContent";
import { BASE_URL, CREATE_WONDERLAND_EVENT } from "@/utils/apiconstant";

// const categoryMap = {
//   "65a92271ae1586258ccd0628": "anniversary-decoration",
//   "65a95dcb6995e7401e78c2ea": "baby-shower-decoration",
//   "65aeaf3747d5cb78ba19d4b6": "balloon-bouquets-decoration",
//   "65a91598ae1586258cccffd4": "birthday-decoration",
//   "65a92085ae1586258ccd04ff": "first-night-decoration",
//   "66ad224731c3672040d8d32a": "haldi-mehendi-decoration",
//   "65aeaf5147d5cb78ba19d4d3": "kids-birthday-decoration",
//   "65a92efbae1586258ccd0c6e": "premium-decoration",
//   "66c9df0922ed47b721180334": "Proposal-Decorations",
//   "65a2d129513d9389d34e31d4": "welcome-baby-decoration",
//   "66c44baf8bd9c45aaa2c42b5": "bachelorette-decoration",
// };

const ActionPopup = ({
  isOpen,
  actionPopupOrderId,
  actionPopupChefOrderId,
  actionPopupOrderType,
  actionPopupChefOrder_Id,
  onClose,
  order,
  setRefetchData
}) => {
  const [popupType, setPopupType] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [wonderlandevent, setWonderlandEvent] = useState(
    order?.eventData?.[0]?.hostName || "",
  );
  const [eventResponse, setEventResponse] = useState({});
  const [eventFormData, setEventFormData] = useState({
    userId: "",
    eventType: "",
    hostName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    googleMapLink: "",
    fromInternational: "NO",
    orderId: "",
  });

  useEffect(() => {
    setEventFormData((prev) => ({
      ...prev,
      userId: order?.fromId || "",
      eventType: order?.eventName || "",
      hostName: wonderlandevent || "",
      // eventDate: (order?.order_date && convertToISO(order?.order_date)) || "",
      eventDate: order?.order_date || "",
      location: order?.addressId[0]?.address1 || "",
      googleMapLink: order?.addressId[0]?.address2 || "",
    }));
  }, [order, wonderlandevent]);

  const createWonderlandEvent = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}${CREATE_WONDERLAND_EVENT}`,
        {
          ...eventFormData,
          orderId: order?.order_id || "",
        },
      );
      if (response.status === 200 || response.status === 201) {
        setEventResponse(response?.data?.data);
        setRefetchData(true)
      }
    } catch (error) {
      console.error("Error creating wonderland event:", error);
      alert("There was an error creating wonderland event.");
    }
  };

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
      apiUrl = `${BASE_URL}/api/order/order_details_decoration/${actionPopupOrderId}`;
      setPopupType("decoration");
    } else if (actionPopupOrderType === 2) {
      const chefOrderId = actionPopupChefOrder_Id.toString();
      apiUrl = `${BASE_URL}/api/order/order_details/v1/${chefOrderId}`;
      setPopupType("chef");
    } else if (actionPopupOrderType === 6 || actionPopupOrderType === 7) {
      apiUrl = `${BASE_URL}/api/order/order_details_food_delivery/${actionPopupOrderId}`;
      setPopupType("foodDelivery");
    } else if (actionPopupOrderType === 8) {
      // Need new api for photograpgy
      const photographyOrderId = actionPopupChefOrderId.toString();
      apiUrl = `${BASE_URL}/api/order/order_details_photography/${photographyOrderId}`;
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

  const handleCallClick = () => {
    setShowChecklist(true);
  };

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
      statement.split("-").filter((item) => item.trim() !== ""),
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
                  <strong>Order Pincode:</strong>{" "}
                  {orderDetails?.order_pincode || "N/A"}
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
                                  src={`${BASE_URL}/api/uploads/${item.image}`}
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
                                src={`${BASE_URL}/api/uploads/${item.image}`}
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
                            src={`${BASE_URL}/api/uploads/${item.image}`}
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
                            src={`${BASE_URL}/api/uploads/${item.image}`}
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
                              src={`${BASE_URL}/api/uploads/${item.image}`}
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
                        ),
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
                      "water/disposal",
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
              <div
                style={{
                  marginTop: "10px",
                  backgroundColor: "#e46363",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  Wonderland Event Name
                </div>
                {order?.eventData?.length > 0 || eventResponse?._id ? (
                  <div>
                    {order?.eventData[0]?.hostName || eventResponse?.hostName}
                  </div>
                ) : (
                  <div>
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Event Name"
                        className="event-name-field"
                        onChange={(e) => {
                          setWonderlandEvent(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="event-submit-btn"
                        onClick={() => {
                          createWonderlandEvent();
                        }}
                      >
                        Add Event Name
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getGoogleMapLocation = (url) => {
    if (!url || url === "N/A") return "";

    try {
      let decodedUrl = url;

      // Decode only if URL is encoded
      for (let i = 0; i < 3; i++) {
        const decoded = decodeURIComponent(decodedUrl);
        if (decoded === decodedUrl) break;
        decodedUrl = decoded;
      }

      // Extract original shared Google Maps link
      const match = decodedUrl.match(
        /https?:\/\/maps\.app\.goo\.gl\/[^\s&]+/
      );

      if (match) return match[0];

      // Already a Google Maps URL
      if (/^https?:\/\/(www\.)?google\.[^/]+\/maps\//i.test(url)) {
        return url;
      }

      // Normal address
      return "";
    } catch (error) {
      console.log('%c [ error ]', 'font-size:13px; background:pink; color:#bf2c9f;', error)
      return "";
    }
  };

  const getProductImageUrl = (product) => {
    const fileName = product?.featured_images?.[0]?.fileName;

    if (!fileName) return "";

    const decodedFileName = decodeURIComponent(fileName);


    return `${BASE_URL}/api/uploads/compressed_webp/${decodedFileName.split(".")[0]}.webp`;
  };

  // share on whatsapp========================
  const sendOrderDetailsToWhatsAppDoc = () => {
    // Extract order details
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";
    const orderDate =
      new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    // const orderType = getOrderType(orderDetails.type) || "N/A";
    const address = orderDetails?.addressId?.address1 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const decorationComments = orderDetails?.decoration_comments || "N/A";
    const addOnItems = orderDetails?.add_on || [];
    // Create a Google Maps link
    const googleMapLocation = getGoogleMapLocation(
      orderDetails?.addressId?.address2
    );

    const googleMapUrl = googleMapLocation
      ? googleMapLocation
      : `https://www.google.com/maps/search/?q=${encodeURIComponent(
        orderDetails?.addressId?.address2 || orderDetails?.addressId?.address1 || ""
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
    let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\nAddress: ${address}\nGoogleMapLocation: ${googleMapUrl}\nArrival Time: ${orderTime}\n\n*Amount:₹${balanceAmount}`;


    // Add Decoration Items
    orderDetails?.items.forEach((item) => {
      const dec = item?.decoration;
      if (dec) {
        // check if decoration exists
        message += `\n\n*Product Name:* ${dec?.name}\n*Product Image URL: ${(dec?.name === "Custom Product" && orderDetails?.customProductImage) ? encodeURI(`${BASE_URL}/api/uploads/compressed_webp/${orderDetails?.customProductImage}`) : encodeURI(getProductImageUrl(dec)) || "N/A"}\n`;
        const inclusionText = getCleanInclusionText(dec?.inclusion); // format inclusion text
        message += `\n*Inclusion:* \n${inclusionText}`;
      }
    });


   message += `\n\n*Event: ${ orderDetails?.eventData?.[0]?.hostName || orderDetails?.eventName || "N/A" }*`;

    // Add Add-On Items
    message += `\n\n*Add-On Items:*\n`;

    if (addOnItems && addOnItems?.length > 0) {
      addOnItems.forEach((item, index) => {
        const itemLabel = [item.name, item.title].filter(Boolean).join(" ");
        message += `\n${index + 1}. ${itemLabel}: quantity : ${item.quantity}`;
      });
    } else {
      message += ` None`;
    }

    message += `\n\nComments : \n ${decorationComments
      ?.split("\n")
      .filter(Boolean)
      .map((comment, index) => `${index + 1}. ${comment.trim()}`)
      .join("\n")
      } \n`


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

      const orderDate = orderDetails?.order_date
        ? orderDetails.order_date.split("T")[0]
        : "N/A";

      const orderTime = orderDetails?.order_time || "N/A";
      const contactNumber =
        orderDetails?.phone_no || orderDetails?.fromId?.phone || "N/A";

      const address = orderDetails?.addressId?.address1 || "N/A";
      const googleMapLocation = getGoogleMapLocation(
        orderDetails?.addressId?.address2
      );

      const googleMapUrl = googleMapLocation
        ? googleMapLocation
        : `https://www.google.com/maps/search/?q=${encodeURIComponent(
          orderDetails?.addressId?.address2 ||
          orderDetails?.addressId?.address1 ||
          ""
        )}`;

      const totalAmount = orderDetails?.total_amount ?? 0;
      const advanceAmount = orderDetails?.advance_amount ?? 0;
      const balanceAmount = orderDetails?.balance_amount ?? 0;

      const decorationComments = orderDetails?.decoration_comments || "";
      const addOnItems = orderDetails?.add_on || [];

      // Format comments
      const formattedComments = decorationComments
        ? decorationComments
          .split("\n")
          .map((comment) => comment.trim())
          .filter(Boolean)
          .map((comment, index) => `${index + 1}. ${comment}`)
          .join("\n")
        : "None";

      // Initial order details
      let message = `*Decoration Order Details*

Date: ${orderDate}
Time Slot: ${orderTime}
Contact Number: ${contactNumber}
Address: ${address}
Google Map Location: ${googleMapUrl}

Total Amount: ₹${totalAmount}
Advance Amount: ₹${advanceAmount}
Balance Amount: ₹${balanceAmount}

Event: ${orderDetails?.eventData?.[0]?.hostName || orderDetails?.eventName || "N/A"}
`;

      // Product Details

      // Product Details
      for (const item of orderDetails?.items || []) {
        const product = item?.decoration;
        if (!product) continue;

        const productName = product?.name || "N/A";



        // Product Site URL
        const productUrl = product?.productUrl || "N/A";

        message += `

Product Name: ${productName}
Product site Url: ${productUrl}
Product Image URL: ${(productName === "Custom Product" && orderDetails?.customProductImage) ? encodeURI(`${BASE_URL}/api/uploads/compressed_webp/${orderDetails?.customProductImage}`) : encodeURI(getProductImageUrl(product)) || "N/A"}
`;

        // Inclusions
        const inclusionText = getCleanInclusionText(
          product?.inclusion || []
        );

        const inclusionList = inclusionText
          ? inclusionText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `• ${line.replace(/^[-•]\s*/, "")}`)
            .join("\n")
          : "None";

        message += `
*Inclusions:*
${inclusionList}
`;
      }


      // Add-on Items
      message += `\n*Add-On Items:`;

      if (addOnItems.length > 0) {
        addOnItems.forEach((item, index) => {
          const itemLabel = item?.title || item?.name || "N/A";
          const price = Number(item?.price) || 0;
          const quantity = Number(item?.quantity) || 1;
          const itemTotal = price * quantity;

          if (quantity > 1) {
            message += `\n${index + 1}. ${itemLabel}: ₹${price} × ${quantity} = ₹${itemTotal}`;
          } else {
            message += `\n${index + 1}. ${itemLabel}: ₹${price}`;
          }
        });
      } else {
        message += `\nNone`;
      }

      // Comments
      message += `
\nComment:
${formattedComments}

Order Taken By: ${orderDetails?.order_taken_by || "N/A"}`;

      await navigator.clipboard.writeText(message);

      alert("Order details have been copied to the clipboard!");

    } catch (err) {
      console.error("Failed to copy order details:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendOrderDetailsToWhatsAppPhoto = () => {
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";

    const orderDate = orderDetails?.order_date
      ? new Date(orderDetails.order_date).toLocaleDateString()
      : "N/A";

    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = getGoogleMapLocation(
      orderDetails?.addressId?.address2
    );

    const googleMapUrl = googleMapLocation
      ? googleMapLocation
      : `https://www.google.com/maps/search/?q=${encodeURIComponent(
        orderDetails?.addressId?.address2 ||
        orderDetails?.addressId?.address1 ||
        ""
      )}`;
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

      inclusionText = cleaned
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => `${index + 1}. ${line}`)
        .join("\n");
    }

    // Balance Amount Calculation
    let balanceAmount = 0;

    if (orderDetails.phone_no) {
      balanceAmount =
        orderDetails.total_amount - orderDetails.advance_amount;
    } else {
      if ([2, 3, 4, 5].includes(orderDetails?.type)) {
        balanceAmount = Math.round(
          (orderDetails?.payable_amount * 4) / 5
        );
      } else if ([6, 7].includes(orderDetails?.type)) {
        balanceAmount = Math.round(
          orderDetails?.payable_amount * 0.35
        );
      } else {
        balanceAmount = Math.round(
          orderDetails?.payable_amount * 0.65
        );
      }
    }

    // Add-ons
    const addons = addOnItems.length > 0
      ? addOnItems.map((item, index) => {
        return `${index + 1}. ${item.title}\n   Quantity: ${item.quantity}`;
      }).join("\n")
      : "None";

    const themes = orderDetails?.themes?.length > 0
      ? orderDetails.themes.map((theme, index) => {
        return `${index + 1}. ${theme.title}`;
      }).join("\n")
      : "None";

    const orderSummary = `
*Photography Order Details*

Order ID: ${orderId}
Date: ${orderDate}
Time Slot: ${orderTime}
Address: ${address}
Google Map Location: ${googleMapUrl}

Balance Amount: ₹${balanceAmount}

Product Name: ${orderDetails.items?.[0]?.photography?.name || "N/A"}

*Add-On Items:*
${addons}

*Selected Themes:*
${themes}

*Product Inclusions:*
${inclusionText}

Event: ${orderDetails?.eventData?.[0]?.hostName || orderDetails?.eventName || "N/A"}

*Comments:*
${decorationComments
        ?.split("\n")
        .filter(Boolean)
        .map((comment, index) => `${index + 1}. ${comment.trim()}`)
        .join("\n")}

Order Taken By: ${orderDetails?.order_taken_by || "N/A"}

`;

    navigator.clipboard.writeText(orderSummary.trim())
      .then(() => {
        alert("Order details have been copied to the clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy order details to clipboard: ", err);
      });
  };

  const sendOrderDetailsToWhatsAppchef = (orderDetails) => {
    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleDateString("en-GB");
    };

    const orderDate = formatDate(orderDetails?.order_date);
    const orderTime = orderDetails?.order_time || "N/A";

    const phoneNumber = orderDetails?.phone_no || "N/A";
    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = getGoogleMapLocation(
      orderDetails?.addressId?.address2
    );

    const googleMapUrl = googleMapLocation
      ? googleMapLocation
      : `https://www.google.com/maps/search/?q=${encodeURIComponent(
        orderDetails?.addressId?.address2 ||
        orderDetails?.addressId?.address1 ||
        ""
      )}`;
    const city = orderDetails?.addressId?.city || "N/A";
    const pincode = orderDetails?.order_pincode || "N/A";

    const numberOfPeople = Number(orderDetails?.no_of_people) || 0;
    const selectedItems = orderDetails?.selecteditems || [];

    const totalAmount = orderDetails?.total_amount ?? 0;
    const advanceAmount = orderDetails?.advance_amount ?? 0;
    const balanceAmount =
      Number(totalAmount) - Number(advanceAmount);

    const comments = orderDetails?.comments || "N/A";

    // Selected dishes
    const selectedDishes = selectedItems.length
      ? selectedItems
        .map((item, index) => `${index + 1}. ${item?.name || "N/A"}`)
        .join("\n")
      : "None";

    // Required ingredients (quantity × number of people)
    const ingredientMap = new Map();

    selectedItems.forEach((item) => {
      (item?.ingredientUsed || []).forEach((ingredient) => {
        const name = ingredient?.name || "N/A";
        const qty = Number(ingredient?.qty) || 0;
        const unit = ingredient?.unit || "";

        const key = `${name}_${unit}`;

        if (ingredientMap.has(key)) {
          ingredientMap.get(key).qty += qty * numberOfPeople;
        } else {
          ingredientMap.set(key, {
            name,
            qty: qty * numberOfPeople,
            unit,
          });
        }
      });
    });

    const requiredIngredients = ingredientMap.size
      ? Array.from(ingredientMap.values())
        .map(
          (ingredient, index) =>
            `${index + 1}. ${ingredient.name}: ${ingredient.qty} ${ingredient.unit}`
        )
        .join("\n")
      : "None";

    // Build message
    const message = `Chef For Party Details

Date: ${orderDate}
Time Slot: ${orderTime}
Contact Number: ${phoneNumber}
Address: ${address}
Google Map Location: ${googleMapUrl}
City: ${city}
Pincode: ${pincode}

Event: ${orderDetails?.eventData?.[0]?.hostName || orderDetails?.eventName || "N/A"}

Number of People: ${numberOfPeople}
Total Dishes: ${selectedItems.length}

Price Details:
Amount: ₹${balanceAmount}

Selected Dishes:
${selectedDishes}

Required Ingredients:
${requiredIngredients}

Comments: ${comments}`;

    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Chef for Party details copied successfully!");
      })
      .catch((err) => {
        console.error("Failed to copy order details: ", err);
      });
  };

  const sendOrderDetailsToWhatsAppFood = (orderDetails) => {
    // Extract details
    const orderId = getOrderId(orderDetails?.order_id) || "N/A";

    const formatDate = (date) => {
      if (!date) return "N/A";

      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    const orderDate = formatDate(orderDetails?.order_date);
    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = getGoogleMapLocation(
      orderDetails?.addressId?.address2
    );

    const googleMapUrl = googleMapLocation
      ? googleMapLocation
      : `https://www.google.com/maps/search/?q=${encodeURIComponent(
        orderDetails?.addressId?.address2 ||
        orderDetails?.addressId?.address1 ||
        ""
      )}`;
    const orderTime = orderDetails?.order_time || "N/A";
    const orderCity = orderDetails?.order_locality || "N/A";
    const peopleCount = orderDetails?.no_of_people ?? "N/A";
    const phoneNumber = orderDetails?.phone_no || "N/A";
    const orderType = getOrderType(orderDetails?.type) || "NA";

    // Amount details
    const totalAmount = Number(orderDetails?.total_amount) || 0;
    const advanceAmount = Number(orderDetails?.advance_amount) || 0;

    const balanceAmount =
      orderDetails?.balance_amount !== undefined &&
        orderDetails?.balance_amount !== ""
        ? Number(orderDetails.balance_amount)
        : totalAmount - advanceAmount;

    // Check disposal inclusion safely
    const dishesObject = orderDetails?.userOrderDishImageArray?.[0] || {};

    const disposalInclusion = Object.prototype.hasOwnProperty.call(
      dishesObject,
      "water/disposal"
    );

    // Inclusions
    let inclusions = [];

    if (orderDetails?.add_on?.length) {
      inclusions = orderDetails.add_on
        .flatMap((item) => item.split("\n"))
        .map((item) =>
          item
            .replace(/^\s*[-•]\s*/, "")
            .replace(/\*/g, "")
            .trim()
        )
        .filter(
          (item) =>
            item && !item.toLowerCase().includes("inclusions:")
        );
    } else if (orderType === "Food Delivery") {
      inclusions = [...foodDeliveryInclusions];

      if (disposalInclusion) {
        inclusions.push(
          "Disposable plates, Fork, Spoon, Tissue papers, Bisleri Water bottles"
        );
      }
    } else if (orderType === "Live Catering") {
      inclusions = [...liveCateringInclusions];
    } else {
      inclusions = ["No specific inclusions for this order type"];
    }

    // Dishes
    let dishes = [];

    if (orderDetails?.order_taken_by === "Booked Online") {
      if (orderDetails?.userOrderDishImageArray?.length) {
        dishes = Object.entries(dishesObject)
          .filter(([dishName, details]) =>
            dishName !== "water/disposal" && details
          )
          .map(([dishName, details]) => {
            if (details.quantity && details.unit) {
              return `•⁠  ⁠${dishName}: ${details.quantity} ${details.unit}`;
            } else if (details.quantity) {
              return `•⁠  ⁠${dishName}: ${details.quantity}`;
            }

            return null;
          })
          .filter(Boolean);
      }
    } else {
      dishes = (orderDetails?.items || []).map((item) => {
        if (item.quantity && item.unit) {
          return `•⁠  ⁠${item.name}: ${item.quantity} ${item.unit}`;
        } else if (item.quantity) {
          return `•⁠  ⁠${item.name}: ${item.quantity}`;
        }

        return `•⁠  ⁠${item.name}`;
      });
    }

    const dishesMessage = dishes.length
      ? dishes.join("\n")
      : "No dishes selected";

    // Inclusions formatting
    const inclusionsMessage = inclusions.length
      ? inclusions.map((item) => `•⁠  ⁠${item}`).join("\n")
      : "None";

    // Comments and order taken by
    const comments = orderDetails?.comments || "N/A";
    const orderTakenBy = orderDetails?.order_taken_by || "N/A";

    // Final message
    const message = `*${orderType} Order Summary:*

Order ID: ${orderId}
City: ${orderCity}
Date: ${orderDate}
Time of Delivery: ${orderTime}
Customer Number: ${phoneNumber}
Address: ${address}
Google Map Location: ${googleMapUrl}
Guest Count: ${peopleCount}

Amount: ₹${balanceAmount}

Event: ${orderDetails?.eventData?.[0]?.hostName || orderDetails?.eventName || "N/A"}

Dishes:
${dishesMessage}

Inclusions:
${inclusionsMessage}

Comments: ${comments}
Order Taken By: ${orderTakenBy}`;

    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Order details have been copied to the clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy order details to clipboard: ", err);
      });
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
            <button onClick={onClose} className="close-btn-popup">
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
                            orderDetails.order_date,
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
                          <strong>Order Pincode:</strong>{" "}
                          {orderDetails?.order_pincode || "N/A"}
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
                              {orderDetails.add_on.map((item, index) => {
                                let rawTitle =
                                  item?.name || item?.title || "Addon";

                                const quantityMatch =
                                  rawTitle.match(/Quantity\s*(\d+)/i);

                                const extractedQuantity = quantityMatch
                                  ? Number(quantityMatch[1])
                                  : null;

                                const cleanedTitle = rawTitle
                                  .replace(/\s*-\s*Quantity\s*\d+/i, "")
                                  .trim();

                                const quantity =
                                  extractedQuantity ||
                                  Number(item?.quantity) ||
                                  1;

                                const price = Number(item?.price || 0);

                                const total = item?.totalPrice
                                  ? Number(item.totalPrice)
                                  : price * quantity;

                                return (
                                  <li key={index}>
                                    <strong>{cleanedTitle}</strong>: ₹{price} x{" "}
                                    {quantity} = ₹{total}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </p>

                        <p>
                          <strong>Order decoration_comments:</strong>{" "}
                          {orderDetails.decoration_comments ? (
                            <ol
                              style={{ paddingLeft: "20px", marginTop: "5px" }}
                            >
                              {orderDetails.decoration_comments
                                .split("\n")
                                .filter((comment) => comment.trim() !== "")
                                .map((comment, index) => (
                                  <li key={index}>{comment}</li>
                                ))}
                            </ol>
                          ) : (
                            <span>N/A</span>
                          )}
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
                                  {order?.customProductImage ? (
                                    <Image
                                      src={`${BASE_URL}/api/uploads/compressed_webp/${order?.customProductImage}`}
                                      width={200}
                                      height={200}
                                      alt="Custom Product"
                                    />
                                  ) : (
                                    <Image
                                      src={`${BASE_URL}/api/uploads/compressed_webp/${dec.featured_images?.[0]?.fileName?.split(".")[0]
                                        }.webp`}
                                      width={200}
                                      height={200}
                                      alt={`${dec.featured_images?.[0]?.fileName?.split(".")[0]}-name`}
                                    />
                                  )}
                                </p>
                                <div>{getItemInclusion(dec.inclusion)}</div>

                                {orderDetails.customInclusion?.length > 0 && (
                                  <div>
                                    <strong>Custom Inclusions:</strong>

                                    <ul>
                                      {orderDetails.customInclusion.map((item, index) => (
                                        <li key={index}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
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
                                const imageName =
                                  typeof image === "string"
                                    ? image
                                    : image?.image;
                                const imageUrl = imageName
                                  ? `${BASE_URL}/api/uploads/${imageName}`
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
                              },
                            )}
                          </div>
                        </p>

                        {/* <p>{userOrderDishImageArray[0]}</p> */}
                      </div>
                    </div>

                    <div className="order-summary-box">
                      <div className="text-center">
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
                                ? `₹ ${orderDetails.total_amount -
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
                        <div
                          style={{
                            marginTop: "10px",
                            backgroundColor: "#e46363",
                            padding: "10px",
                            borderRadius: "5px",
                          }}
                        >
                          <div style={{ marginBottom: "10px" }}>
                            Wonderland Event Name
                          </div>
                          {order?.eventData?.length > 0 ||
                            eventResponse?._id ? (
                            <div>
                              {order?.eventData[0]?.hostName ||
                                eventResponse?.hostName}
                            </div>
                          ) : (
                            <div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Enter Event Name"
                                  className="event-name-field"
                                  onChange={(e) => {
                                    setWonderlandEvent(e.target.value);
                                  }}
                                />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  className="event-submit-btn"
                                  onClick={() => {
                                    createWonderlandEvent();
                                  }}
                                >
                                  Add Event Name
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {order?.type === 1 && (
                          <div style={{ marginTop: "10px" }}>
                            {order?.call_checklist_exists === true ? (
                              <button
                                className="view-btn call-btn"
                                onClick={() => handleCallClick()}
                              >
                                View Call Checklist
                              </button>
                            ) : (
                              <button
                                className="call-btn add-btn"
                                onClick={() => handleCallClick()}
                              >
                                Call Checklist
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {showChecklist && (
                        <div className="callChecklist-container">
                          <CallChecklistContent
                            open={showChecklist}
                            onClose={() => setShowChecklist(false)}
                            data={order}
                            cancleBtnColor="#fff"
                          />
                        </div>
                      )}
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
                            orderDetails.order_date,
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
                          <strong>Order Pincode:</strong>{" "}
                          {orderDetails?.order_pincode || "N/A"}
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
                          <strong>Order Images Uplaoded By App:</strong>{" "}
                          {(orderDetails?.imageUploadByApp == true) ? "Yes" : "No"}
                        </p>

                        <p>
                          <strong>Order Comments:</strong>{" "}
                          {orderDetails.decoration_comments ? (
                            <ol
                              style={{ paddingLeft: "20px", marginTop: "5px" }}
                            >
                              {orderDetails.decoration_comments
                                .split("\n")
                                .filter((comment) => comment.trim() !== "")
                                .map((comment, index) => (
                                  <li key={index}>{comment}</li>
                                ))}
                            </ol>
                          ) : (
                            <span>N/A</span>
                          )}
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
                                Array.isArray(orderDetails?.add_on) &&
                                orderDetails.add_on.filter(
                                  (item) => item?.title || item?.name,
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
                                          src={
                                            item?.image
                                              ? `https://horaservices.com/api/uploads/compressed_webp/${item.image}`
                                              : "/placeholder.png"
                                          }
                                          alt={item?.title}
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
                                          {item?.price} x {item?.quantity || 1}{" "}
                                          = ₹{item?.totalPrice || item?.price}
                                        </p>
                                        <h3
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            color: "#1f2937",
                                            marginTop: "2px",
                                          }}
                                        >
                                          Name : {item?.title}
                                        </h3>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            marginTop: "4px",
                                          }}
                                        >
                                          Discription :{" "}
                                          {item?.description || "N/A"}
                                        </p>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            marginTop: "4px",
                                          }}
                                        >
                                          quantity - {item?.quantity || 1}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
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
                              <strong>Photography Theme:</strong>
                            </p>

                            {(() => {
                              const themes =
                                Array.isArray(orderDetails?.themes) &&
                                orderDetails.themes.filter(
                                  (item) => item?.title || item?.name,
                                );

                              if (!themes || themes.length === 0) {
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
                                  {themes.map((item, index) => (
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
                                          src={
                                            item?.image
                                              ? `https://horaservices.com/api/uploads/compressed_webp/${item.image}`
                                              : "/placeholder.png"
                                          }
                                          alt={item?.title}
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
                                        <h3
                                          style={{
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            color: "#1f2937",
                                            marginTop: "2px",
                                          }}
                                        >
                                          Name : {item?.title}
                                        </h3>
                                        <p
                                          style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            marginTop: "4px",
                                          }}
                                        >
                                          Discription :{" "}
                                          {item?.description || "N/A"}
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
                      <div
                        style={{
                          marginTop: "10px",
                          backgroundColor: "#e46363",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        <div style={{ marginBottom: "10px" }}>
                          Wonderland Event Name
                        </div>
                        {order?.eventData?.length > 0 || eventResponse?._id ? (
                          <div>
                            {order?.eventData[0]?.hostName ||
                              eventResponse?.hostName}
                          </div>
                        ) : (
                          <div>
                            <div>
                              <input
                                type="text"
                                placeholder="Enter Event Name"
                                className="event-name-field"
                                onChange={(e) => {
                                  setWonderlandEvent(e.target.value);
                                }}
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                className="event-submit-btn"
                                onClick={() => {
                                  createWonderlandEvent();
                                }}
                              >
                                Add Event Name
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
