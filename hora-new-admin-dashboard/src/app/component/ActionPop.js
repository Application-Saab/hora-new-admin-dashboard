import Image from "next/image";
import "./Actionpopup.css";
import { useState, useEffect } from "react";

const ActionPopup = ({ isOpen, actionPopupOrderId,actionPopupChefOrderId,  actionPopupOrderType, onClose  }) => {
 
  const [popupType, setPopupType] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  let apiUrl = "";

  useEffect(() => {
    // setLoading(true);
    setError(null);

    // Set the popup type and corresponding API URL based on order type
    if (actionPopupOrderType === 1) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_decoration/${actionPopupOrderId}`;
      setPopupType("decoration");
    } else if (actionPopupOrderType === 2) {
      const chefOrderId = actionPopupChefOrderId.toString();
      apiUrl = `https://horaservices.com:3000/api/order/order_details/v1/${chefOrderId}`;
      setPopupType("chef");
    } else if (actionPopupOrderType === 6 || actionPopupOrderType === 7) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_food_delivery/${actionPopupOrderId}`;
      setPopupType("foodDelivery");
    } else if (actionPopupOrderType === 8 ) {
      // Need new api for photograpgy
      const photographyOrderId = actionPopupChefOrderId.toString();
      apiUrl = `https://horaservices.com:3000/api/order/order_details/v1/${photographyOrderId}`;
      setPopupType("Photography");
    } 
    else {
      setError("Currently, data is not available");
      // setLoading(false);
      return;
    }

    // Fetch data from the API
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // setLoading(false);
        if (!data.error && data.status === 200) {
          setOrderDetails(data.data);
        } else {
          setError("Failed to fetch order details");
        }
      })
      .catch((error) => {
        // setLoading(false);
        setError("Error fetching order details");
        console.error("Error fetching order details:", error);
      });
  }, [actionPopupOrderId,actionPopupChefOrderId,   actionPopupOrderType]);


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
    console.log(inclusion);
    if (!Array.isArray(inclusion) || inclusion.length === 0) {
      return null;
    }
    const htmlString = inclusion[0];
    const withoutTags = htmlString.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const withoutSpecialChars = withoutTags.replace(/&#[^;]*;/g, ' '); // Replace &# sequences with space
    const statements = withoutSpecialChars.split('<div>');
    const inclusionItems = statements.flatMap(statement => statement.split("-").filter(item => item.trim() !== ''));
    const inclusionList = inclusionItems.map((item, index) => (
      <li key={index} className="inclusionstyle">
        {item.trim()}
      </li>
    ));
    return (
      <div>
        <div style={{ fontSize: "21px", borderBottom: "1px solid #e7eff9", marginBottom: "10px" }}>Inclusions</div>
        <ul>
          {inclusionList}
        </ul>
      </div>

    );
  };
   // share on whatsapp========================
   const sendOrderDetailsToWhatsAppDoc = () => {
    console.log(JSON.stringify(orderDetails.items));

    // Extract order details
    const orderId = orderDetails._doc.order_id || "N/A";
    const orderDate = new Date(orderDetails._doc.order_date).toLocaleDateString() || "N/A";
    const orderType = getOrderType(orderDetails._doc.type) || "N/A";
    const address = orderDetails._doc.addressId?.address1 || "N/A";
    const googleMapLocation = orderDetails._doc.addressId?.address2 || "N/A";
    const orderTime = orderDetails._doc.order_time || "N/A";
    const decorationComments = orderDetails._doc.decoration_comments || "N/A";
    const addOnItems = orderDetails._doc.add_on || [];
    // Create a Google Maps link
    const googleMapUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(googleMapLocation)}`;
    // Calculate balance amount
    let balanceAmount = 0;
    if (orderDetails._doc.phone_no) {
      balanceAmount = orderDetails._doc.total_amount - orderDetails._doc.advance_amount;
    } else {
      if ([2, 3, 4, 5].includes(orderDetails._doc?.type)) {
        balanceAmount = Math.round((orderDetails._doc?.payable_amount * 4) / 5);
      } else if ([6, 7].includes(orderDetails._doc?.type)) {
        balanceAmount = Math.round(orderDetails._doc?.payable_amount * 0.35);
      } else {
        balanceAmount = Math.round(orderDetails._doc?.payable_amount * 0.65);
      }
    }

    // Construct the message
    // Order Type: ${orderType}\n
    let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\nAddress: ${address}\nGoogleMapLocation: ${googleMapUrl}\nArrival Time: ${orderTime}\n\n*Amount:₹${balanceAmount}*\n\n*Comments*:\n ${decorationComments}\n`;

    // Add Add-On Items
    message += `\n*Add-On Items:*\n`;

    if (addOnItems && addOnItems.length > 0) {
      addOnItems.forEach((item, index) => {
        message += `\n${index + 1}. ${item.name}: ₹${item.price}`;
      });
    } else {
      message += ` None`;  // Show "None" if there are no add-ons
    }

    // Add Decoration Items
    orderDetails.items.forEach((item) => {
      // \n*Product Price:* ₹${dec.price}
      item.decoration.forEach((dec, index) => {
        message += `\n\n*Product Name:* ${dec.name}\n*Image URL:* https://horaservices.com/api/uploads/${dec.featured_image}\n`;
        const inclusionText = getCleanInclusionText(dec.inclusion); // Assuming this function formats the inclusion text
        message += `\n*Inclusion:* \n${inclusionText}`;
      });
    });

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const sendOrderDetailsToWhatsAppchef = (orderDetails) => {
    console.log(orderDetails);

    // Extract details
    const orderId = orderDetails?.order_id || "N/A";
    const orderDate = new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    const address = orderDetails?.addressId?.address1 || "N/A";
    const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const decorationComments = orderDetails?.decoration_comments || "N/A";
    // Create a Google Maps link
    const googleMapUrl = `https://www.google.com/maps/search/?q=${encodeURIComponent(googleMapLocation)}`;
    // Calculate balance amount
    const balanceAmount =
      orderDetails?.total_amount && orderDetails?.advance_amount
        ? orderDetails.total_amount - orderDetails.advance_amount
        : "N/A";

    // Start building the message
    let message = `Order Details:\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\n\nAddress: ${address}\nGoogleMapLocation: ${googleMapUrl}\n\nArrival Time: ${orderTime}\n\n*Amount: ₹${balanceAmount}*\nComments: ${decorationComments}\n\n*Dishes*\n`;

    // Append each dish to the message
    if (orderDetails?.selecteditems?.length) {
      message += orderDetails.selecteditems
        .map((item) => item.name)
        .join("\n");
    } else {
      message += "No dishes selected";
    }

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };
  const sendOrderDetailsToWhatsAppFood = (orderDetails) => {
    console.log(orderDetails);

    // Extract details
    const orderId = orderDetails?.order_id || "N/A";
    const orderDate = new Date(orderDetails?.order_date).toLocaleDateString() || "N/A";
    const address = orderDetails?.addressId?.address1;
    const googleMapLocation = orderDetails?.addressId?.address2 || "N/A";
    const orderTime = orderDetails?.order_time || "N/A";
    const orderCity = orderDetails?.order_locality || "NA"
    const peopleCount = orderDetails?.no_of_people || "NA"
    // Create a Google Maps link
    const googleMapUrl = orderDetails?.addressId?.address2  ? (`https://www.google.com/maps/search/?q=${encodeURIComponent(googleMapLocation)}`) : 'NA';
    // Calculate balance amount
    const balanceAmount =
      orderDetails?.total_amount && orderDetails?.advance_amount
        ? orderDetails?.total_amount - orderDetails?.advance_amount
        : "N/A";
        const inclusions = [
          "Complementary - Green salad, Mint Chutney, Achar",
          "Doorstep Delivery",
          "Disposable plates, Fork, Spoon, Tissue papers, Bisleri Water bottles",
          "Freshly cooked food"
        ];
    // Start building the message
    let message = `*Food Delivery Order Summary:*\n\nOrder ID: ${orderId}\nOrder Date: ${orderDate}\n\nCity: ${orderCity}\nGuest Count: ${peopleCount}\nTime of Delivery: ${orderTime}\n\nAddress: ${address}\n\nGoogleMapLocation: ${googleMapUrl}\n*Amount: ₹${balanceAmount}*\n\n*Dishes*\n`;

    // Append each dish to the message
    if (orderDetails?.selecteditems?.length) {
      message += orderDetails.selecteditems
        .map((item) => {
          return `${item.name}: ${item.cuisineArray[1] ? item.cuisineArray[1]  : ''} ${item.cuisineArray[2] ? item.cuisineArray[2] : ''}`;
        })
        .join("\n");
    } else {
      message += "No dishes selected";
    }
    message += "\n\n*Inclusions:*\n" + inclusions.join("\n");

    // Open WhatsApp with the pre-filled message
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };
  // fetch orderdetails
  const FetchOrderDetails = ({ orderDetails }) => {
    // console.log(getOrderType(orderDetails?.type), JSON.stringify(orderDetails))
    console.log(orderDetails)
    return (
      <div>
        <div className="order-details-container">
          <h2 className="popup-title">Order Details</h2>
          <div className="order-grid">
            <div className="order-details-box">
              <div className="order-detail-row">
                <p>
                  <strong>Order Number:</strong> {getOrderId(orderDetails?.order_id)}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(orderDetails?.order_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>No of burners:</strong> {orderDetails?.no_of_burner || 0}
                </p>
                <p>
                  <strong>No of people:</strong> {orderDetails?.no_of_people || 0}
                </p>
                <p>
                  <strong>City:</strong> {orderDetails?.order_locality || "N/A"}
                </p>
                <p>
                  <strong>Order Type:</strong> {getOrderType(orderDetails?.type)}
                </p>
                <p>
                  <strong>Order Address:</strong> {orderDetails?.addressId?.address1 || "N/A"}
                </p>
              </div>
              <h3>Ordered Items:</h3>
              <div className="order-items-container">
                {(orderDetails?.type === 6 || orderDetails?.type === 7) ?
                  (<ul className="order-items-list">
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
                          <strong className="order-item-title">{item.name}</strong>
                          <span>{item.cuisineArray[1]}{item.cuisineArray[2]}</span>
                          <span className="order-item-price">₹{item.cuisineArray[0]}</span>
                        </div>
                      </li>
                    ))}
                  </ul>)
                  : (<ul className="order-items-list">
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
                          <strong className="order-item-title">{item.name}</strong>
                          <span className="order-item-price">₹{item.price}</span>
                        </div>
                      </li>
                    ))}
                  </ul>)
                }
              </div>
            </div>
            <div className="order-summary-box">
              <h3 style={{ color: "white" }}>Order Summary</h3>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <li
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>Total Amount:</strong>{" "}
                  <span>₹{orderDetails.total_amount}</span>
                </li>
                <li
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>Advance Amount:</strong>{" "}
                  <span>₹{orderDetails.advance_amount || 0}</span>
                </li>

                <li style={{ display: "flex", justifyContent: "space-between" }}>

                  <span>Balance Amount</span>
                  <span>
                    {orderDetails?.total_amount && orderDetails?.advance_amount
                      ? `₹ ${(orderDetails.total_amount - orderDetails.advance_amount)}`
                      : 0}
                  </span>
                </li>

                <li
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>Discount:</strong>{" "}
                  <span>₹{orderDetails.discount || 0}</span>
                </li>
                <li
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>GST:</strong>{" "}
                  <span>₹{orderDetails.gst || 0}</span>
                </li>
                <li
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>Per person cost:</strong>{" "}
                  <span>₹{orderDetails.per_person_cost || 0}</span>
                </li>

              </ul>
              <button
                className="startbutton"
                onClick={() => {
                  if (orderDetails?.type === 2) {
                    sendOrderDetailsToWhatsAppchef(orderDetails); // Call for type 2
                  } else if (orderDetails?.type === 6 || orderDetails?.type === 7) {
                    sendOrderDetailsToWhatsAppFood(orderDetails); // Call for type 6 or 7
                  }
                }}
              >
                Share on WhatsApp
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  };

  

  return (
    isOpen ? 
        (
          <div className="popup-overlay">
          <div className="popup-content">
            <button onClick={onClose} className="close-btn">
              ✖
            </button>
            {/* {loading && <div>Loading...</div>} */}
            {error && <div className="error-message">{error}</div>}
            {popupType === "decoration" && orderDetails ? (
              <div className="order-details-container">
                <h2 className="popup-title">Order Details</h2>
                <div className="order-grid">
                  <div className="order-details-box">
                    <div className="order-detail-row">
                      <p>
                        <strong> Order Id:</strong>{" "}
                        {getOrderId(orderDetails._doc.order_id)}
                      </p>
                      {/* <p><strong>Order Id:</strong> {orderDetails._doc.otp}</p> */}
                      <p>
                        <strong>Order Date:</strong>{" "}
                        {new Date(
                          orderDetails._doc.order_date
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Order Type:</strong>{" "}
                        {getOrderType(orderDetails._doc.type)}
                      </p>
                      <p>
                        <strong>Order City:</strong>{" "}
                        {orderDetails._doc.order_locality || "N/A"}
                      </p>
                      <p>
                        <strong>Order Address:</strong>{" "}
                        {orderDetails._doc.addressId?.address1 || "N/A"}
                      </p>
                      <p>
                        <strong>Order Google Map Location:</strong>{" "}
                        {orderDetails._doc.addressId?.address2 || "N/A"}
                      </p>
                      <p>
                        <strong>Order Time:</strong>{" "}
                        {orderDetails._doc.order_time || "N/A"}
                      </p>
                  
                      <p>
                        <strong>Order Add On:</strong>{" "}
    
                        { orderDetails._doc.add_on.length > 0 ? (
                          <ul>
                            {orderDetails._doc.add_on.map((item, index) => (
                              <li key={index}>
                                <strong>{item.name} {item.title}</strong>: ₹{item.price}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </p>
    
                      <p>
                        <strong>Order decoration_comments:</strong>{" "}
                        {orderDetails._doc.decoration_comments || "N/A"}
                      </p>
                        <p>
                        {
                        orderDetails.items.map((item) =>
                        item.decoration.map((dec, index) => (
                        <div key={`${index}-${dec.name}`}>  {/* Unique key for each decoration */}
                        <p><strong>Product Name:</strong>{dec.name}</p> 
                        <p><strong>Product Price: </strong>{dec.price}</p>
                        <p>
                        <Image src={`https://horaservices.com/api/uploads/${dec.featured_image}`} width={200} height={200} alt={`${dec.featured_image}-name`}/>
                        </p>
                        <p>{getItemInclusion(dec.inclusion)}</p>
                        </div>
                        ))
                        )
                        }
                        </p>
                    </div>
                
    
                  </div>
    
                  <div className="order-summary-box">
                    <h3 style={{ color: "white" }}>Order Summary</h3>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                      <li
                        style={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <strong>Total Amount:</strong>{" "}
                        <span>₹{orderDetails._doc.total_amount}</span>
                      </li>
                      <li
                        style={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <strong>Advance Amount:</strong>{" "}
                        <span>₹{orderDetails._doc.advance_amount || 0}</span>
                      </li>
                   
                      <li style={{ display: "flex", justifyContent: "space-between" }}>
        
          <span>Balance Amount</span>
          <span>
      {orderDetails._doc?.total_amount && orderDetails._doc?.advance_amount
        ? `₹ ${(orderDetails._doc.total_amount - orderDetails._doc.advance_amount)}`
        : "N/A"}
    </span>
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
                    
                    </ul>
                    <button
                              className="startbutton"
                              onClick={sendOrderDetailsToWhatsAppDoc}
                            >
                              Share On WhatsApp
                            </button>
                  </div>
                </div>
              </div>
            ) : (
              null
            )} 
    
          {popupType === "chef" && orderDetails && (
              <FetchOrderDetails orderDetails={orderDetails} />
            )}
            {popupType === "foodDelivery" && orderDetails && (
              <FetchOrderDetails orderDetails={orderDetails[0]} />
            )}
     
    
    
          </div>
        </div>
        ) 
      : 
      null

  );
};

export default ActionPopup;

