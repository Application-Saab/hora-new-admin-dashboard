"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaEye } from "react-icons/fa";
import ActionPopup from "../../component/ActionPop";
import "./orderdetails.css";
import {
  BASE_URL,
  ADMIN_ORDER_LIST,
  ORDER_EDIT,
} from "../../../utils/apiconstant";
// import * as XLSX from "xlsx";
import CheckSupplier from "../../component/createsupplier/CheckSupplier";
import axios from "axios";
import DownloadCSVFile from "../downloadCsv/page";
import { IoMdOpen } from "react-icons/io";
import SearchWithDropDown from "../../component/SearchWithDropDown";
import { eventList } from '../../../constants/eventList'
import CallChecklist from '../../component/CallChecklist'
import CommonPopup from "../../component/CommonPopup"
import {saveOrderDriveLinks, inclusionToApiKeyMap, apiKeyToInclusionMap} from './drivelinkService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  // const [setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedActiveStatus, setSelectedActiveStatus] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
  const [actionPopupOrderId, setActionPopupOrderId] = useState("");
  const [actionPopupChefOrderId, setActionPopupChefOrderId] = useState("");
  const [actionPopupOrderType, setActionPopupOrderType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [linkPopupOpen, setLinkPopupOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
const [driveLinksInput, setDriveLinksInput] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
const [reviewValue, setReviewValue] = useState("");
  const [decorationFields, setDecorationFields] = useState([]);
const [order, setOrder] = useState(null);
  const [actionPopupChefOrder_Id, setActionPopupChefOrder_Id] = useState("");
  const [loading, setLoading] = useState(false);

  // supplier
  const [isSupplierAssigned, setIsSupplierAssigned] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierOrder, setSelectedSupplierOrder] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // vendor amount
  const [showPopup, setShowPopup] = useState(false);
  const [vendorAmount, setVendorAmountInput] = useState("");
  const [orderId1, setOrderId] = useState("");

  const [createdAtDate, setCreatedAtDate] = useState("");

  const [orderTypeShow, setOrderTypeShow] = useState(null);
  const [callChecklistData,setCallChecklistData ] = useState(null);

  console.log(isSupplierAssigned);

   const [showChecklist, setShowChecklist] = useState(false);

  const handleCallClick = (order) => {
    setCallChecklistData(order);
    setShowChecklist(true); 
  };


  const fetchOrders = async (
    page,
    orderId = "",
    orderstatus = "",
    activeStatus = "",
    orderType = "",
    orderCity = "",
    selectedDate = "",
    selectedOfflineNum = "",
    createdAtDate = ""
  ) => {
    // Handle orderType mapping
    let typeId;
    switch (orderType) {
      case "Decoration":
        typeId = 1;
        break;
      case "Chef":
        typeId = 2;
        break;
      case "Food Delivery":
        typeId = 6;
        break;
      case "Live Catering":
        typeId = 7;
        break;
      case "Photography":
        typeId = 8;
        break;
      case "Boosters":
        typeId = 9;
        break;
      default:
        typeId = null; // or another default value if needed
    }

    const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;

    // `newId` calculation - update this based on actual use case, or use `orderId` directly if needed
    let filteredId = Math.abs(orderId - 10800); // Confirm if this is needed or if `orderId` should be used as is
    // Prepare requestData
    console.log(Number(orderstatus));
    let requestData = {
      page: page,
      per_page: itemsPerPage,
      order_id: orderId.length > 0 ? filteredId : "", // `match orderId`
      order_status:
        Number(orderstatus) === 0 || Number(orderstatus)
          ? Number(orderstatus)
          : "", // 'match OrderStatus'
      status:
        Number(activeStatus) === 0 || Number(activeStatus) === 1
          ? Number(activeStatus)
          : "",
      type: typeId || "", // match order type
      order_locality: orderCity || "",
      order_date: selectedDate || "",
      phone_no: selectedOfflineNum || "",
      // online_phone_no :selectedOfflineNum || "",
      createdAt: createdAtDate || "",
    };

    console.log(requestData);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.status === 200) {
        // Success - handle valid response
        const data = await response.json();

        if (data && data.data && data.data.order) {
          setOrders(data.data.order);
          // setTotalPage(data.data.paginate.last_page);
          let totalPages = Math.ceil(
            data.data.paginate.total_item / itemsPerPage
          );
          setTotalPage(totalPages);
        } else {
          // No orders found, show an alert with a message
          setOrders("");
          setTotalPage("");
          console.warn("No orders found");
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Show an alert with the error message
      alert(`Error fetching orders: ${error.message}`);
    } finally {
      console.log("filan");
    }
  };

  useEffect(() => {
    fetchOrders(
      currentPage,
      searchTerm,
      selectedOrderStatus,
      selectedActiveStatus,
      selectedOrderType,
      selectedCity,
      selectedDate,
      selectedPhoneNumber,
      createdAtDate
    );
  }, [
    currentPage,
    searchTerm,
    selectedOrderStatus,
    selectedActiveStatus,
    selectedOrderType,
    selectedCity,
    selectedDate,
    selectedPhoneNumber,
    createdAtDate,
  ]);

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

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      6: "Food Delivery",
      7: "Live Catering",
      8: "Photography",
      9: "Boosters",
    };
    return orderTypes[orderTypeValue] || "Unknown Order Type";
  };

  const [showPopup2, setShowPopup2] = useState(false);
  const [popupData, setPopupData] = useState({
    orderId: null,
    newStatus: null,
  });

  const handleStatusUpdate = (orderId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    setPopupData({ orderId, newStatus });
    setShowPopup2(true);
  };

  const confirmUpdate = () => {
    updateOrderStatus(popupData.orderId, popupData.newStatus);
    setShowPopup2(false);
  };

  const cancelUpdate = () => {
    setShowPopup2(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/order/update_order_status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: orderId, status: status }),
        }
      );

      // const data = await response.json();

      if (response.ok) {
        fetchOrders();
      } else {
        console.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getOrderId = (e) => {
    const orderId1 = 10800 + e;
    const updateOrderId = "#" + orderId1;
    return updateOrderId;
  };

  const openActionPopup = (orderId, order_id, orderType, order) => {
    console.log(orderId, "orderId");
    console.log(order_id, "order_id1");
    console.log(orderType, "orderType");
    setActionPopupOrderId(orderId);
    setActionPopupChefOrderId(orderId);
    setActionPopupOrderType(orderType);
    setActionPopupChefOrder_Id(order_id);
    setPopupOpen(true); // Open the popup
    setOrder(order)
  };

  const openSupplierDeatilsPopup = async (orderId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/getUserDetails/${orderId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await response.json();
      setSupplierDetails(data);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const closePopup = () => {
    setPopupOpen(false);
    setIsPopupOpen(false);
    setSupplierDetails(null);
  };

  const openSupplierAssignPopup = (order) => {
    console.log(order, "orderrr");
    setSelectedSupplierOrder(order);
    setIsModalOpen(true);
  };

  // const CloseSupplierAssignPopup = () => {
  //   setIsModalOpen(false);
  // };

  const handleOpenVendorAmountPopup = (orderId) => {
    console.log(orderId, "orderId");
    setOrderId(orderId);
    setShowPopup(true);
  };

  const handleCloseVendorAmountPopup = () => setShowPopup(false);
useEffect(() => {
  if (selectedOrder) {
    const inclusions = selectedOrder?.call_checklist?.inclusions || {};
    const existingLinks = selectedOrder?.allDriveLinks || [];

    const trueInclusionsList = Object.keys(inclusions).filter(
      (key) => inclusions[key] === true
    );

    const dynamicApiKeys = trueInclusionsList.map(
      (key) => inclusionToApiKeyMap[key]
    );

 
    const finalApiKeysToShow = [
      ...new Set([
        ...dynamicApiKeys,
        "rawPhotos",
      ]),
    ];

    let initialInputState = finalApiKeysToShow.map((backendApiKey) => {
      const matchedSavedLink = existingLinks.find(
        (item) => item.linkType === backendApiKey
      );

      const rawPhotosLink =
  backendApiKey === "rawPhotos"
    ? selectedOrder?.orderDriveLink
    : "";

return {
  linkType: backendApiKey,
  link: matchedSavedLink?.link || rawPhotosLink || "",
  isExisting: !!matchedSavedLink?.link || !!rawPhotosLink,
};

    });

    const hasRawPhotos = initialInputState.some(
      (item) => item.linkType === "rawPhotos"
    );

    if (!hasRawPhotos) {
      initialInputState.push({
        linkType: "rawPhotos",
        link:
          existingLinks.find(
            (item) => item.linkType === "rawPhotos"
          )?.link ||
          selectedOrder?.orderDriveLink ||
          "",
      });
    }

    setDriveLinksInput(initialInputState);
  }
}, [selectedOrder]);


const handleSaveAllLinks = async (currentOrder) => {
  try {
    setLoading(true);

    const data = await saveOrderDriveLinks(currentOrder, driveLinksInput);

    alert(data.message || "All drive links processed successfully!");
    setShowDriveLinkModal(false);
    
    fetchOrders(); 

  } catch (error) {
    console.error("Error in component while saving links:", error);
    
    alert(error.response?.data?.message || error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

const handleDynamicLinkChange = (index, value) => {
  const updatedLinks = [...driveLinksInput];
  updatedLinks[index].link = value;
  setDriveLinksInput(updatedLinks);
};

  const handleSaveVendorAmount = async () => {
    try {
      console.log("Order ID:", orderId1);
      console.log("Vendor Amount:", vendorAmount);

      const requestBody = {
        _id: orderId1,
        vendor_amount: vendorAmount,
      };

      console.log("Request Body:", requestBody);

      const response = await axios.post(
        `${BASE_URL}/api/order/edit`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);

      if (response.status === 200) {
        alert("Vendor amount updated successfully");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId1
              ? { ...order, vendor_amount: vendorAmount }
              : order
          )
        );
        handleCloseVendorAmountPopup();
        setVendorAmountInput("");
      } else {
        alert("Failed to update vendor amount");
      }
    } catch (error) {
      console.error(
        "Error updating vendor amount:",
        error.response ? error.response.data : error.message
      );
      alert("Error updating vendor amount");
    }
  };

  const StatusDropdown = ({
    selectedActiveStatus,
    setSelectedActiveStatus,
  }) => {
    return (
      <select
        value={selectedActiveStatus}
        onChange={(e) => setSelectedActiveStatus(e.target.value)}
        className="order-type-dropdown"
      >
        <option value="All">All</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    );
  };

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [decorationComment, setDecorationComment] = useState("");
  const [addOnList, setAddOnList] = useState([{ name: "", price: "" }]);

  const [totalAmountEdit, setTotalAmountEdit] = useState("");
  const [balanceAmountEdit, setBalanceAmountEdit] = useState("");
  const [advanceAmountEdit, setAdvanceAmountEdit] = useState("");

const handleDecorationComment = (index, value) => {
  const updated = [...decorationFields];
  updated[index] = value;
  setDecorationFields(updated);
};

const addDecorationField = () => {
  setDecorationFields([...decorationFields, ""]);
};
useEffect(() => {
  const comments = popupData?.decoration_comments;

  if (comments) {
    const lines = comments
      .split("\n")
      .filter(line => line.trim() !== ""); 

    setDecorationComment(lines.join("\n"));
    setDecorationFields(Array.from({ length: lines.length }, (_, i) => i));
  } else {
    setDecorationComment("");
    setDecorationFields([0]);
  }
}, [popupData]);

useEffect(() => {
  if (decorationComment) {
    const splitComments = decorationComment.split("\n");
    setDecorationFields(splitComments);
  }
}, [decorationComment]);


  const handleOpenEditOrderPopup = (
    orderId,
    decoration_comments,
    add_ons = [],
    totalAmount,
    balanceAmount,
    advanceAmount,
    type
  ) => {
    setSelectedOrderId(orderId);
    setDecorationComment(decoration_comments || "");
    setAddOnList(add_ons.length ? add_ons : [{ name: "", price: "" }]);
    setTotalAmountEdit(totalAmount || "");
    setBalanceAmountEdit(balanceAmount || "");
    setAdvanceAmountEdit(advanceAmount || "");
    setOrderTypeShow(type);
    setIsPopupOpen(true);
  };

  const handleAddOnChange = (index, field, value) => {
    const updatedAddOns = [...addOnList];
    updatedAddOns[index][field] = value;
    setAddOnList(updatedAddOns);
  };

  const handleAddAddOn = () => {
    setAddOnList([...addOnList, { name: "", price: "" }]);
  };

  const handleRemoveAddOn = (index) => {
    const updatedAddOns = [...addOnList];
    updatedAddOns.splice(index, 1);
    setAddOnList(
      updatedAddOns.length ? updatedAddOns : [{ name: "", price: "" }]
    );
  };

  const handleSave = async () => {
    const requestData = {
      _id: selectedOrderId,
      decoration_comments: decorationFields.join("\n"),
      add_on: addOnList, //add on list into array format
      total_amount: totalAmountEdit, //totalAmountEdit is when user click edit order popup
      balance_amount: balanceAmountEdit, //balanceAmountEdit is when user click edit order popup
      advance_amount: advanceAmountEdit, //advanceAmountEdit is when user click edit order popup
    };

    console.log(requestData, "requestdata");

    try {
      const response = await fetch(
        `${BASE_URL}/api/order/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result);
        alert("Order updated successfully!");
        window.location.reload();
      } else {
        console.error("Error:", result);
        alert("Failed to update order.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Network error, please try again.");
    }

    setIsPopupOpen(false); // Close the popup after saving
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId2, setSelectedOrderId2] = useState(null);

  const handleOpenModal = (id) => {
    console.log(id, "orderId");
    setSelectedOrderId2(id);
    setShowModal(true);
  };

  const handleCancelOrder = async () => {
    if (selectedOrderId2) {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/order/cancelOrder`,
          { _id: selectedOrderId2 }, // Body
          {
            headers: {
              Authorisation: "jflkdsjfsdfjdsklfj", // Pass token in headers
            },
          }
        );

        setShowModal(false);
        console.log("Cancel response:", response.data);
        fetchOrders(); // Refresh the list
      } catch (error) {
        console.error("Cancel order error:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedOrderEventId, setSelectedOrderEventId] = useState(null);

  const handleOpen = (orderId) => {
    setSelectedOrderEventId(orderId);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedEvent("");
    setSelectedOrderEventId(null);
    setIsOpen(false);
  };

  const handleAdd = async () => {
    console.log(selectedOrderEventId, "selectedOrderEventId");
    if (!selectedEvent || !selectedOrderEventId) {
      alert("Please select an event and ensure order ID is available");
      return;
    }

    console.log(selectedOrderEventId, "selectedOrderEventId");

    try {
      const response = await fetch(BASE_URL + ORDER_EDIT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedOrderEventId,
          eventName: selectedEvent,
        }),
      });
      console.log(response, "response");

      if (response.ok) {
        alert("Event saved successfully!");
        handleClose();
      } else {
        alert("Failed to save event");
      }
    } catch (error) {
      console.error(error);
      alert("API error");
    }
  };

  const [showBox, setShowBox] = useState(false);
  const [showDriveLinkModal, setShowDriveLinkModal] = useState(false);
  const [bigId, setBigId] = useState(null);
  const [pictureList, setPictureList] = useState([]);
  const [uploadedNames, setUploadedNames] = useState([]); // <-- store filenames from "data"
  const filePicker = useRef(null);

  const openBox = (id) => {
    console.log("id", "bro", id);
    setBigId(id);
    setShowBox(true);
  };

  const closeBox = () => {
    setShowBox(false);
    setPictureList([]);
    setUploadedNames([]);
  };

  const clickPickButton = () => {
    if (filePicker.current) {
      filePicker.current.click();
    }
  };

  const whenPicturePicked = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formThing = new FormData();

    for (let i = 0; i < files.length; i++) {
      formThing.append("files", files[i]);
    }

    try {
      const answer = await fetch(
        `${BASE_URL}/api/multiple_image_upload`,
        {
          method: "POST",
          body: formThing,
        }
      );

      if (!answer.ok) {
        console.error("Upload failed");
        return;
      }

      const data = await answer.json();
      setPictureList(data.data); // Full filenames
      setUploadedNames(data.data); // Save to send later
      console.log("Uploaded:", data.data);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const sendImagesToBackend = async (order) => {
    console.log("🟢 Add button clicked");

    console.log(order._id, "order id");

    if (!order?._id) {
      console.error("❌ order._id is missing");
      return;
    }

    if (uploadedNames.length === 0) {
      console.warn("⚠️ No images uploaded");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/order/edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: bigId,
            userOrderDishImageArray: uploadedNames,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        console.error("❌ Backend error:", result.message);
      } else {
        console.log("✅ Images attached:", result);
        alert("Image Updated Sucessfully");
        window.location.reload();
        setShowBox(false); // Close modal if success
      }
    } catch (err) {
      console.error("❌ Failed to send request:", err);
    }
  };

  return (
    <div className="orderDetailsList">
      <div className="order-list-container">
        {/* <div className="order-header">
          <h1 >Order Details</h1>
        </div> */}
        <div class="centered-container">
          <h1>Order Details</h1>
        </div>

        <div className="filter-wrapper_new">
          <div className="filter-grid_new">
            <div className="filter-item_new">
              <label htmlFor="orderId" className="label_new">
                Order ID
              </label>
              <input
                id="orderId"
                type="text"
                className="input_new"
                placeholder="e.g., ORD123456"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-item_new">
              <label htmlFor="customerNumber" className="label_new">
                Customer Number
              </label>
              <input
                id="customerNumber"
                type="text"
                className="input_new"
                placeholder="e.g., +1234567890"
                value={selectedPhoneNumber}
                onChange={(e) => setSelectedPhoneNumber(e.target.value)}
              />
            </div>

            <div className="filter-item_new">
              <label htmlFor="fulfillmentDate" className="label_new">
                Fulfillment Date
              </label>
              <input
                id="fulfillmentDate"
                type="date"
                className="input_new"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="filter-item_new">
              <label htmlFor="createdAtDate" className="label_new">
                Created At
              </label>
              <input
                id="createdAtDate"
                type="date"
                className="input_new"
                value={createdAtDate}
                onChange={(e) => setCreatedAtDate(e.target.value)}
              />
            </div>

            <div className="filter-item_new">
              <label htmlFor="statusDropdown" className="label_new">
                Status
              </label>
              <StatusDropdown
                id="statusDropdown"
                selectedActiveStatus={selectedActiveStatus}
                setSelectedActiveStatus={setSelectedActiveStatus}
              />
            </div>

            <div className="filter-actions_new">
              <button
                className="reset-button_new"
                onClick={() => window.location.reload()}
              >
                🔄 Reset
              </button>
            </div>
          </div>
          <DownloadCSVFile />
        </div>

        <div className="orders-box">
          <table className="order-table">
            <thead>
              <tr style={styles.tableHeading}>
                <th>Order Id</th>
                <th className="order-type-header">
                  <span> Order Type</span>
                  <span>
                    {" "}
                    <select
                      value={selectedOrderType}
                      onChange={(e) => {
                        const newOrderType = e.target.value;
                        setSelectedOrderType(newOrderType);
                        // FilterByType(newOrderType); // Trigger the filter
                      }}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Decoration">Decoration</option>
                      <option value="Chef">Chef</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Live Catering">Live Catering</option>
                      <option value="Photography">Photography</option>
                      <option value="Boosters">Boosters</option>
                    </select>
                  </span>
                </th>

                <th className="order-type-header">
                  <span> City</span>
                  <span>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const newOrderCity = e.target.value; // Get the updated value directly
                        setSelectedCity(newOrderCity); // Update state
                        // FilterByCity(newOrderCity);          // Pass the updated value immediately
                      }}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </span>
                </th>
                <th>Fulfillment Date</th>
                <th>Fulfillment Time</th>
                <th>Otp</th>
                <th>Order Taken By</th>
                <th>Customer No</th>
                {/* <th>Online Customer No</th> */}
                <th>Supplier</th>
                <th>Order Start & End Time</th>
                <th>Total Amount</th>
                <th className="order-type-header">
                  <span>Order Status</span>
                  <span>
                    <select
                      value={selectedOrderStatus}
                      onChange={(e) => {
                        const filterdStatus = e.target.value; // Get the updated value directly
                        setSelectedOrderStatus(filterdStatus); // Update state
                        // FilterByStatus(newStatus);          // Pass the updated value immediately
                      }}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="0">Booked</option>
                      <option value="1">Accepted</option>
                      <option value="2">In-progress</option>
                      <option value="3">Completed</option>
                      <option value="6">Expired</option>
                      <option value="4">Cancelled</option>
                    </select>
                  </span>
                </th>
                <th>Created</th>
               
                <th className="order-type-header">
                  Status
                  {/* <select
                    value={selectedActiveStatus}
                    onChange={(e) => setSelectedActiveStatus(e.target.value)}
                    className="order-type-dropdown"
                  >
                    <option value="All">All</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select> */}
                </th>
                <th>Action</th>
                 <th>Calling Status</th>
                <th>Rating</th>
                <th>Extra Pay</th>
                <th>Edit Order</th>
                <th>Add EventName</th>
                <th>Add Order Image</th>
                <th>Add Multiple Drive links</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={index}>
                    <td>{getOrderId(order.order_id)}</td>
                    <td>{getOrderType(order.type)}</td>
                    <td>{order.order_locality || "N/A"}</td>
                    <td>
                      {order?.order_date
                        ? new Date(order.order_date).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>

                    <td>
                      {order?.order_time
                        ? `${order.order_time}` // If `order_time` is available, show it
                        : order?.order_date
                          ? `${order.order_date.split("T")[1].slice(0, 8)}`
                          : "N/A"}
                    </td>
                    <td>{order.otp}</td>
                    <td>{order.order_taken_by || "N/A"}</td>
                    <td>{order.phone_no || "N/A"}</td>
                    {/* <td>{order.online_phone_no || "N/A"}</td> */}
                    <td>
                      {order.toId ? (
                        <>
                          <button
                            onClick={() => openSupplierDeatilsPopup(order.toId)}
                            className="assigningBtn assigned"
                          >
                            <FaEye />
                            <span>Assigned</span>
                          </button>
                          <span
                            style={{ cursor: "pointer", marginLeft: "8px" }}
                            onClick={() => openSupplierAssignPopup(order)}
                            title="Edit"
                          >
                            ✏️
                          </span>
                        </>
                      ) : (
                        <>
                          <button
                            className="assigningBtn not-assigned"
                            onClick={() => openSupplierAssignPopup(order)}
                          >
                            Not Assigned
                          </button>
                        </>
                      )}

                      {/* Always render the modal if needed */}
                      {isModalOpen && selectedSupplierOrder && (
                        <CheckSupplier
                          SelectedOrder={selectedSupplierOrder}
                          setShowModal={setIsModalOpen}
                          setIsSupplierAssigned={setIsSupplierAssigned}
                        />
                      )}
                    </td>

                    <td>
                      {`${order.job_start_time.replace(
                        /(\d{4})(\d{1,2}:\d{2}:\d{2} (AM|PM))/,
                        "$1 $2"
                      )} - 
                               ${order.job_end_time}`}
                    </td>

                    <td>₹{order.total_amount}</td>

                    <td>
                      <span
                        className={`status ${getOrderStatus(order.order_status).className
                          }`}
                      >
                        {getOrderStatus(order.order_status).status}
                      </span>
                      <span
                        style={{ cursor: "pointer", marginLeft: "8px" }}
                        onClick={() => handleOpenModal(order._id)}
                        title="Edit"
                      >
                        ✏️
                      </span>
                    </td>
                    {/* <td>{new Date(order.createdAt).toLocaleString()}</td> */}
                    {/* <td>{new Date(order.createdAt).toLocaleTimeString()}</td> */}

                    <td>
                      {/* {order.createdAt.split("T")[0]}{" "} */}
                      {(() => {
                        const [year, month, day] = order.createdAt
                          .split("T")[0]
                          .split("-");
                        return `${day}/${month}/${year}`;
                      })()}
                      <div>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>{" "}
                    </td>
                   
                    <td>
                      <button
                        className={`status-button ${order.status === 0 ? "active" : "inactive"
                          }`}
                        onClick={() =>
                          handleStatusUpdate(order._id, order.status)
                        }
                      >
                        {order.status === 1 ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <button
                        style={styles.amountViewDetailsBtn}
                        onClick={() => {
                          openActionPopup(
                            order.order_id,
                            order._id,
                            order.type,
                            order                        
                          );
                        }}
                      >
                        View Details
                      </button>
                    </td>
                     <td>
                      <div style={styles.container}>
                        {/* Call Icon */}
                        {(order?.type === 1 || order?.type === 8) ? 
                        <>
                        {order?.call_checklist_exists === true ? 
                        <button className="view-btn call-btn" onClick={() => handleCallClick(order)}>
                          View Call Checklist
                        </button>
                        :
                        <button className="call-btn add-btn" onClick={() => handleCallClick(order)}>
                          Call Checklist
                        </button>
                        }
                        </>
                        :
                        <div style={{display : 'flex', justifyContent: 'center', width : 'full', flex: '1' }}>_</div>
                        }
                        
                        <div style={styles.btnGroup}></div>
                      </div>
                    </td>
                    <td style={{ width: "100px", paddingLeft: "16px" }}>
                      <ul style={{ paddingLeft: "0" }}>
                        {order.userReviewRatingArray.map((i, index) => (
                          <li key={index}>{i}</li>
                        ))}
                      </ul>
                    {order.reviewStatus === "positive" || order.reviewStatus === "negative" ? (
                    <div
                      style={{
                      marginTop: "8px",
                      fontWeight: "500",
                      color: order.reviewStatus === "positive" ? "#16a34a" : "#dc2626",
                      }}>
                     {order.reviewStatus === "positive"
                     ? "Reviewed → Positive"
                     : "Reviewed → Negative"}
                    </div>
                   ) : (
                   <button
                    className="link-btns"
                    onClick={() => {
                    setSelectedOrder(order);
                    setShowReviewModal(true);
                  }}>
                  Review
                  </button>
                )}
                    </td>

                    {/* <td style={{ width: "100px", paddingLeft: "16px" }}>
                      {order.type === 2 ? (
                        <ul style={{ paddingLeft: "0" }}>
                          {order.userReviewRatingArray.map((i, index) => (
                            <li key={index}>
                              {i.name}-{i.rating}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        order.userReviewRatingArray[0]
                      )}
                    </td> */}
                    <td>
                      {order.vendor_amount ? (
                        <span>₹{order.vendor_amount}</span>
                      ) : (
                        <button
                          onClick={() => handleOpenVendorAmountPopup(order._id)}
                          style={styles.amountPopupBtn}
                        >
                          Set Vendor Amount
                        </button>
                      )}
                    </td>
                    <td>
                      {(() => {
                        const now = new Date();
                        const orderDate = new Date(order.order_date);

                        // Strip the time to compare only the date
                        now.setHours(0, 0, 0, 0);
                        orderDate.setHours(0, 0, 0, 0);

                        // Show button only if order date is in the future
                        return orderDate > now;
                      })() && (
                          <button
                            style={styles.editOrderPopupBtn}
                            onClick={() =>
                              handleOpenEditOrderPopup(
                                order._id,
                                order.decoration_comments,
                                order.add_on,
                                order.total_amount,
                                order.balance_amount,
                                order.advance_amount,
                                order.type
                              )
                            }
                          >
                            Edit Order
                          </button>
                        )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {/* <button
                        onClick={() => handleOpen(order._id)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "#fff",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Add Event
                      </button> */}

                      {order.eventName ? (
                        <span
                          style={{
                            display: "inline-block",
                            background:
                              "linear-gradient(135deg, #fdfcfb, #e2d1c3)", // warm, elegant gradient
                            color: "#3e3e3e", // neutral dark gray for text
                            fontWeight: "600",
                            padding: "8px 16px",
                            borderRadius: "30px",
                            fontSize: "14px",
                            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)", // softer shadow
                            fontFamily: "'Inter', 'Segoe UI', sans-serif",
                            transition: "all 0.3s ease",
                            border: "1px solid rgba(0, 0, 0, 0.05)", // subtle border for definition
                          }}
                        >
                          {order.eventName}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpen(order._id)}
                          style={styles.editOrderPopupBtn2}
                        >
                          Add Event
                        </button>
                      )}

                      {isOpen && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 999,
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#fff",
                              padding: "20px",
                              borderRadius: "8px",
                              width: "300px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                            }}
                          >
                            <h3>Selected Event</h3>
                            <div style={{ marginBottom: "16px" }}>
                              <SearchWithDropDown
                                options={eventList}
                                selectedValue={selectedEvent}
                                onChange={(val) => setSelectedEvent(val)}
                                placeholder="Search event..."
                              />

                            </div>


                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                              }}
                            >
                              <button
                                onClick={handleAdd}
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "#fff",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Add
                              </button>
                              <button
                                onClick={handleClose}
                                style={{
                                  backgroundColor: "#ccc",
                                  color: "#333",
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    {/* <td>s</td> */}
                    <>
                    <td>
                        {order.type === 1 ? (
                          order.userOrderDishImageArray &&
                            order.userOrderDishImageArray.length > 0 ? (
                            <div
                              style={{
                                display: "inline-block",
                                background:
                                  "linear-gradient(135deg, #fdfcfb, #e2d1c3)",
                                color: "#3e3e3e",
                                fontWeight: "600",
                                padding: "8px 16px",
                                borderRadius: "30px",
                                fontSize: "14px",
                                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                transition: "all 0.3s ease",
                                border: "1px solid rgba(0, 0, 0, 0.05)",
                              }}
                            >
                              Present
                            </div>
                          ) : (
                            <button
                              onClick={() => openBox(order._id)}
                              style={styles.editOrderPopupBtn3}
                            >
                              Add Image
                            </button>
                          )
                        ) : order.type === 8 ? (
                          !order.orderDriveLink ? (
                            <div>
                              -
                            </div>
                          )
                            // : 
                            // (
                            //   <span
                            //     style={{ textAlign: "center", cursor: "pointer" }}
                            //     onClick={() =>  window.open(order.orderDriveLink, '_blank')}
                            //   >
                            //     <IoMdOpen size={30} />
                            //   </span>
                            // )
                            : (
                              <div className="order-link-container">
                              <div className="order-links">

                                {/* Drive Link */}
                                <div
                                  className="link-item"
                                  onClick={() => window.open(order.orderDriveLink, "_blank")}
                                >
                                  <IoMdOpen size={30} />
                                  <span>drivelink</span>
                                  {order?.imageUploadCounts?.totalFromDrive}
                                </div>

                                {/* Web Link */}
                                {order?.orderWebLink ? (
                                  <div
                                    className="link-item"
                                    onClick={() => {
                                    const finalLink = `${order?.orderWebLink}${order?.orderWebLink?.includes('?') ? '&' : '?'}fromPanel=true`;
                                    window.open(finalLink, "_blank");
                                  }}
                                  >
                                    <IoMdOpen size={30} />
                                    <span>weblink</span>
                                    {order?.imageUploadCounts?.totalWeblink}
                                  </div>
                                  
                                ) : null} 

                              </div>
                                <button onClick={() => {
                                 setSelectedOrder(order);
                                 setLinkPopupOpen(true);
                                  }}
                                className="link-btns">Details</button>
                              </div>

                            )
                        ) : (
                          <span style={{ color: "gray", fontStyle: "italic" }}>
                            not able
                          </span>
                        )}
                      </td>

<td>
  {order.type === 8 ? (() => {
    const inclusions = order?.call_checklist?.inclusions || {};
    const trueDynamicApiKeys = [
  ...new Set([
    ...Object.keys(inclusions)
      .filter(key => inclusions[key] === true)
      .map(key => inclusionToApiKeyMap[key]),
    "rawPhotos"
  ])
];

    const totalExpectedForCounter = trueDynamicApiKeys.length;

    const savedLinks = order?.allDriveLinks || [];

const filledCountForCounter = trueDynamicApiKeys.filter((linkType) => {
  if (linkType === "rawPhotos") {
    return (
      savedLinks.some(
        (item) =>
          item.linkType === "rawPhotos" &&
          item.link &&
          item.link.trim() !== ""
      ) ||
      (order?.orderDriveLink &&
        order.orderDriveLink.trim() !== "")
    );
  }

  return savedLinks.some(
    (item) =>
      item.linkType === linkType &&
      item.link &&
      item.link.trim() !== ""
  );
}).length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
        
        <div style={{ 
          fontWeight: "700", fontSize: "14px", 
        }}>
          Links: {filledCountForCounter} / {totalExpectedForCounter}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setSelectedOrder(order);
            setShowDriveLinkModal(true);
          }}
          style={{
            ...styles.editOrderPopupBtn3,
            backgroundColor: filledCountForCounter === totalExpectedForCounter ? "#28a745" : "#007BFF",
            padding: "6px 12px", fontSize: "12px"
          }}
        >
          {filledCountForCounter === 0 ? "Add Drive Links" : "Edit / Add More"}
        </button>
      </div>
    );
  })() : (
    <span style={{ color: "gray", fontStyle: "italic" }}>not able</span>
  )}
</td>
                      {showBox && (
                        <div
                          style={{
                            position: "fixed",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: "9999",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "white",
                              padding: "20px",
                              borderRadius: "8px",
                              width: "400px",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <h3
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                marginBottom: "15px",
                                color: "#333",
                              }}
                            >
                              Pick Pictures for Order: {bigId}
                            </h3>

                            <button
                              onClick={clickPickButton}
                              style={{
                                padding: "10px 20px",
                                backgroundColor: "#007BFF",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "16px",
                                marginBottom: "15px",
                                transition: "background-color 0.3s ease",
                              }}
                            >
                              Pick Picture(s)
                            </button>

                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              ref={filePicker}
                              onChange={whenPicturePicked}
                            />

                            {pictureList.length > 0 && (
                              <div style={{ marginTop: "20px" }}>
                                <p style={{ marginBottom: "10px" }}>
                                  Uploaded Pictures:
                                </p>
                                <ul
                                  style={{
                                    listStyleType: "none",
                                    padding: "0",
                                  }}
                                >
                                  {pictureList.map((pic, index) => (
                                    <li
                                      key={index}
                                      style={{
                                        marginBottom: "5px",
                                        color: "#555",
                                      }}
                                    >
                                      {pic}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "20px",
                              }}
                            >
                              <button
                                onClick={closeBox}
                                style={{
                                  padding: "10px 20px",
                                  backgroundColor: "#f44336",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                  transition: "background-color 0.3s ease",
                                }}
                              >
                                Cancel
                              </button>

                              <button
                                onClick={() => {
                                  console.log("Add button clicked");
                                  sendImagesToBackend(order);
                                }}
                                style={{
                                  padding: "10px 20px",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                  transition: "background-color 0.3s ease",
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* status active and inactive popup */}
          {showPopup2 && (
            <div className="popup-overlay">
              <div className="popup">
                <h3>Changing the Status</h3>
                <p>
                  {popupData.newStatus === 1
                    ? "Are you sure you want to active this order?"
                    : "Are you sure you want to Inactive this order?"}
                </p>
                <div className="popup-buttons">
                  <button className="submit-btn" onClick={confirmUpdate}>
                    Yes
                  </button>
                  <button className="cancel-btn" onClick={cancelUpdate}>
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPopupOpen && (
            <div className="popup-overlay">
              <div className="popup">
                <h2>Edit Order</h2>
                <label
  htmlFor="totalAmountEdit"
  style={{ display: "block", fontWeight: "bold" }}
>
  Decoration Comments
</label>

<div className="editOrder-addon-form">
  {decorationFields.map((field, index) => (
    <div key={index} className="editOrder-comment-container">
      <input
        className="editOrder-comment-input"
        value={field}
        onChange={(e) =>
          handleDecorationComment(index, e.target.value)
        }
        placeholder="Enter decoration comment"
      />

      {index === decorationFields.length - 1 && (
        <button
          type="button"
          className="editOrder-add-new-btn"
          onClick={addDecorationField}
        >
          Add
        </button>
      )}
    </div>
  ))}
</div>
                <div>
                  {/* Total Amount */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="totalAmountEdit"
                      style={{
                        minWidth: "120px",
                        fontWeight: "500",
                        color: "#333",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      New Total Amount
                    </label>
                    <input
                      id="totalAmountEdit"
                      type="text"
                      value={totalAmountEdit}
                      onChange={(e) => setTotalAmountEdit(e.target.value)}
                      placeholder="Enter total amount"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  {/* Balance Amount */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      htmlFor="balanceAmountEdit"
                      style={{
                        minWidth: "120px",
                        fontWeight: "500",
                        color: "#333",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      New Balance Amount
                    </label>
                    <input
                      id="balanceAmountEdit"
                      type="text"
                      value={balanceAmountEdit}
                      onChange={(e) => setBalanceAmountEdit(e.target.value)}
                      placeholder="Enter balance amount"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  {/* Advance Amount */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <label
                      htmlFor="advanceAmountEdit"
                      style={{
                        minWidth: "120px",
                        fontWeight: "500",
                        color: "#333",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      New Advance Amount
                    </label>
                    <input
                      id="advanceAmountEdit"
                      type="text"
                      value={advanceAmountEdit}
                      onChange={(e) => setAdvanceAmountEdit(e.target.value)}
                      placeholder="Enter advance amount"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                {orderTypeShow === 1 && (
                  <>
                    <h3>Add-ons</h3>
                    <div>
                      {addOnList.map((addOn, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Add-on Name"
                            value={addOn.name}
                            onChange={(e) =>
                              handleAddOnChange(index, "name", e.target.value)
                            }
                            style={{
                              padding: "8px",
                              fontSize: "14px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              width: "150px",
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            value={addOn.price}
                            onChange={(e) =>
                              handleAddOnChange(index, "price", e.target.value)
                            }
                            style={{
                              padding: "8px",
                              fontSize: "14px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              width: "100px",
                            }}
                          />
                          <button
                            onClick={() => handleRemoveAddOn(index)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#ff4d4f",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      <button
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#273F4F",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginLeft: "100px",
                        }}
                        onClick={handleAddAddOn}
                      >
                        Add Another Add-on
                      </button>
                    </div>
                  </>
                )}

                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={handleSave}
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "inline-block",
                      fontSize: "16px",
                      marginRight: "10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setIsPopupOpen(false)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "inline-block",
                      fontSize: "16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ActionPopup
          isOpen={popupOpen}
          actionPopupOrderId={actionPopupOrderId}
          actionPopupChefOrderId={actionPopupChefOrderId}
          actionPopupOrderType={actionPopupOrderType}
          actionPopupChefOrder_Id={actionPopupChefOrder_Id}
          order={order}
          onClose={closePopup}
        />
      </div>
      {/* vendor extra amount popup */}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Enter Vendor Amount</h3>
            <input
              type="number"
              value={vendorAmount}
              onChange={(e) => setVendorAmountInput(e.target.value)}
              placeholder="Enter Amount"
              className="input-field"
            />
            <div className="popup-buttons">
              <button
                className="submit-btn"
                onClick={() => handleSaveVendorAmount()}
              >
                Submit
              </button>

              <button
                className="cancel-btn"
                onClick={handleCloseVendorAmountPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* supplier details popup */}
      {isPopupOpen && supplierDetails && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closePopup}>
              ×
            </button>
            <h3>Supplier Details</h3>
            <p>Name: {supplierDetails.data?.name || "NA"}</p>
            <p>Phone: {supplierDetails.data?.phone || "NA"}</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>
            <button className="cancel-btn" onClick={handleCancelOrder}>
              Cancel Order
            </button>
            <button className="close-button" onClick={handleCloseModal}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* pagination */}
      <div className="orderDetails_pagination">
        <button
          onClick={() =>
            setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
          }
          disabled={currentPage === 1} // Disable Previous button on first page
        >
          {"<"}
        </button>
        <span>
          {" "}
          Page {currentPage} of {totalPage}{" "}
        </span>
        <button
          onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
          disabled={currentPage === totalPage} // Disable Next button on last page
        >
          {">"}
        </button>
      </div>

      {/* </>} */}
     <CallChecklist
        open={showChecklist}
        data={callChecklistData}
        onClose={() => setShowChecklist(false)}
      />
      {/* Details MODAL */}
{linkPopupOpen && selectedOrder && (
  <CommonPopup
    isOpen={linkPopupOpen}
    onClose={() => setLinkPopupOpen(false)}
    heading="Drivelink Details"
    mainBtnVisible={false}
    popupBody={
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        <div>
          <strong>Total Files From Drive :</strong>{" "}
          {selectedOrder?.imageUploadCounts?.totalFromDrive || 0}
        </div>

        <div>
          <strong>Drive Upload Time :</strong>{" "}
          {selectedOrder?.imageUploadCounts?.driveProvidedAt
            ? new Date(
                selectedOrder.imageUploadCounts.driveProvidedAt
              ).toLocaleString()
            : "-"}
        </div>

        <div>
          <strong>Total Files Weblink :</strong>{" "}
          {selectedOrder?.imageUploadCounts?.totalWeblink || 0}
        </div>

        <div>
          <strong>Weblink Completion Time :</strong>{" "}
          {selectedOrder?.imageUploadCounts?.AllImagesUploadedAt
            ? new Date(
                selectedOrder.imageUploadCounts.AllImagesUploadedAt
              ).toLocaleString()
            : "-"}
        </div>

      </div>
    }
  />
)}

{/* Drive Link Modal */}
{showDriveLinkModal && selectedOrder && (
  <div className="drive-modal-overlay">
    <div className="drive-modal">
      <h3 className="drive-modal-title">Manage Drive Links</h3>

      <p className="drive-modal-order-id">
        Order ID: <strong>{getOrderId(selectedOrder.order_id)}</strong>
      </p>

      <hr className="drive-modal-divider" />

      {driveLinksInput.map((item, index) => (
        <div key={index} className="drive-link-group">
          <label className="drive-link-label">
            {apiKeyToInclusionMap[item.linkType] || item.linkType}
          </label>

          <input
            type="text"
            disabled={item.isExisting}
            placeholder={`Paste Google Drive link for ${
              apiKeyToInclusionMap[item.linkType] || item.linkType
            }`}
            value={item.link}
            onChange={(e) =>
              handleDynamicLinkChange(index, e.target.value)
            }
            className="drive-link-input"
          />
        </div>
      ))}

      <div className="drive-modal-actions">
        <button
          onClick={() => setShowDriveLinkModal(false)}
          className="cancel-btn"
        >
          Cancel
        </button>

        {driveLinksInput.length > 0 &&
          (() => {
            const hasNewLink = driveLinksInput.some(
              (item) =>
                item.link &&
                item.link.trim() !== "" &&
                !item.isExisting
            );

            return (
              <button
                onClick={() => handleSaveAllLinks(selectedOrder)}
                disabled={loading || !hasNewLink}
                className={`save-btn ${
                  loading || !hasNewLink
                    ? "save-btn-disabled"
                    : ""
                }`}
              >
                {loading ? "Saving..." : "Save Links"}
              </button>
            );
          })()}
      </div>
    </div>
  </div>
)}

{/* Review Modal */}
{showReviewModal && selectedOrder && (
  <div className="review-modal-overlay">
    <div className="review-modal-box">
      <h3 className="review-title">Submit Review</h3>

      <div className="review-options">
        <label className="review-radio-label">
          <input
            type="radio"
            name="review"
            value="positive"
            checked={reviewValue === "positive"}
            onChange={(e) => setReviewValue(e.target.value)}
          />
          <span>Positive</span>
        </label>

        <label className="review-radio-label">
          <input
            type="radio"
            name="review"
            value="negative"
            checked={reviewValue === "negative"}
            onChange={(e) => setReviewValue(e.target.value)}
          />
          <span>Negative</span>
        </label>
      </div>

      <div className="review-actions">
        <button
          className="review-cancel-btn"
          onClick={() => {
            setShowReviewModal(false);
            setReviewValue("");
          }}
        >
          Cancel
        </button>

        <button
          className={`review-save-btn ${!reviewValue ? "disabled" : ""}`}
          disabled={!reviewValue}
          onClick={async () => {
            try {
              await axios.post(`${BASE_URL}${ORDER_EDIT}`, {
                _id: selectedOrder._id,
                reviewStatus: reviewValue,
              });

              setShowReviewModal(false);
              setReviewValue("");
              fetchOrders();
            } catch (err) {
              console.error(err);
              alert("Error saving review");
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default OrderList;

// const popupStyle = {
//   position: "fixed",
//   top: "30%",
//   left: "40%",
//   padding: "20px",
//   backgroundColor: "white",
//   border: "1px solid #ccc",
//   boxShadow: "0px 0px 10px rgba(0,0,0,0.25)",
//   zIndex: 1000,
// };

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  callIcon: {
    fontSize: "24px",
    color: "#007bff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  btnGroup: {
    display: "flex",
    gap: "10px",
  },
  btn: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "20px",
    fontSize: "0.9em",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  btnCalled: {
    backgroundColor: "#28a745",
    color: "white",
  },
  btnNotCalled: {
    backgroundColor: "#ffc107",
    color: "white",
  },
  btnNotReceived: {
    backgroundColor: "#dc3545",
    color: "white",
  },
  tableHeading: {
    background:
      "linear-gradient(90deg, rgba(221, 94, 137, 0.8), rgb(151, 83, 140))",
    color: "rgb(255, 255, 255)",
    // width: "100%",
  },
  amountPopupBtn: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #ff6b6b, #ffa500)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editOrderPopupBtn: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #ff6b6b,rgb(148, 140, 124))",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editOrderPopupBtn2: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #2e7d32, #9ccc65)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editOrderPopupBtn3: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #008080, #a0d6b4)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  amountViewDetailsBtn: {
    width: "85px",
    height: "40px",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(135deg, #00b4d8, #0077b6)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
