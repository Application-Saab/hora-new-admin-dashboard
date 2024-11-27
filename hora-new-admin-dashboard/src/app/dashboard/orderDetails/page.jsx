"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaPhone } from "react-icons/fa";
import Popup from "../../../pages/popup/Popup";
import ActionPopup from "../../../pages/popup/ActionPop";
import "./orderdetails.css";
import {
  BASE_URL,
  ADMIN_USER_DETAILS,
  ADMIN_ORDER_LIST,
} from "../../../utils/apiconstant";
import axios from "axios";
import * as XLSX from "xlsx";

import Fuse from "fuse.js";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [setTotalItems] = useState(0);
  const itemsPerPage = 1000;
  const [searchTerm, setSearchTerm] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [popupType, setPopupType] = useState("");
  
  const [fuse, setFuse] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  const [paginationInfo, setPaginationInfo] = useState({
    total_item: 0,
    showing: 0,
    first_page: 1,
    previous_page: 1,
    current_page: 1,
    next_page: 1,
    last_page: 1
  });

  const [paginate, setPaginate] = useState({
    total_item: 0,
    showing: 0,
    first_page: 1,
    previous_page: 1,
    current_page: 1,
    next_page: 2,
    last_page: 1,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrderType, setSelectedOrderType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");

  const [selectedCity, setSelectedCity] = useState("");

  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // const getOnlineCustomerNumber = async (onlineCustomerId) => {
  //   const cachedPhone = localStorage.getItem(
  //     `customer_phone_${onlineCustomerId}`
  //   );
  //   if (cachedPhone) {
  //     return cachedPhone;
  //   }

  //   const url = `${BASE_URL}${ADMIN_USER_DETAILS}${onlineCustomerId}`;
  //   try {
  //     const response = await axios.get(url);
  //     const phone = response.data.data.phone;

  //     localStorage.setItem(`customer_phone_${onlineCustomerId}`, phone);
  //     return phone;
  //   } catch (error) {
  //     console.error("Error fetching customer data:", error);
  //     return null;
  //   }
  // };

  // const fetchOrders = async () => {
  //   setLoading(true);
  //   setProgress(0);

  //   const url = `${BASE_URL}${ADMIN_ORDER_LIST}`;

  //   const progressInterval = setInterval(() => {
  //     setProgress((prevProgress) => {
  //       if (prevProgress >= 90) return prevProgress;
  //       return prevProgress + 1;
  //     });
  //   }, 30);

  //   try {
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         page: 1,
  //         per_page: 10,
  //       }),
  //     });
      
  //     console.log(response, "respkjdflk");

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log(data, "datalkk");
      
  //     if (data && data.data && data.data.order) {
  //       const ordersWithPhoneNumbers = await Promise.all(
  //         data.data.order.map(async (order) => {
  //           const phoneNumber = await getOnlineCustomerNumber(order.fromId);
  //           return {
  //             ...order,
  //             phone_number: phoneNumber,
  //           };
  //         })
  //       );

  //       setOrders(ordersWithPhoneNumbers);
  //       setFilteredOrders(ordersWithPhoneNumbers);
  //     } else {
  //       console.warn("No orders found in response data");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //   } finally {
  //     clearInterval(progressInterval);
  //     setProgress(100);
  //     setTimeout(() => setLoading(false), 500);
  //   }
  // };

  // useEffect(() => {
  //   fetchOrders();
  // }, []);


  
  // API Calls
  
  // const fetchOrders = async (page = 1) => {
  //   setLoading(true);
  //   setProgress(0);

  //   const progressInterval = setInterval(() => {
  //     setProgress((prev) => Math.min(90, prev + 1));
  //   }, 30);

  //   try {
  //     const response = await fetch(`${BASE_URL}${ADMIN_ORDER_LIST}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({
  //         page,
  //         per_page: 10,
  //         // created_at_start: "2024-07-17T16:10:38.695Z",
  //         // created_at_end: "2024-07-17T16:10:38.695Z",
  //         order_id: orderId,
         
  //       })
  //     });

  //     const data = await response.json();

  //     if (data?.data?.order) {
  //       const enrichedOrders = await Promise.all(
  //         data.data.order.map(async (order) => ({
  //           ...order,
  //           phone_number: await getOnlineCustomerNumber(order.fromId)
  //         }))
  //       );

  //       setOrders(enrichedOrders);
  //       setFilteredOrders(enrichedOrders);
  //       setPaginationInfo(data.data.paginate);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //   } finally {
  //     clearInterval(progressInterval);
  //     setProgress(100);
  //     setTimeout(() => setLoading(false), 500);
  //   }
  // };

  // const fetchOrders = async (page = 1) => {
  //   setLoading(true);
  //   setProgress(0);
  
  //   const progressInterval = setInterval(() => {
  //     setProgress((prev) => Math.min(90, prev + 1));
  //   }, 30);
  

  //   const orderId = parseInt(searchTerm, 10);

  //   try {
  //     // Construct body based on whether searchTerm is used
  //     const requestBody = {
  //       order_id : orderId,
  //       page,
  //       per_page: 10,
  //     };

  //   console.log(typeof(searchTerm), "sohan");
  //   console.log(searchTerm.trim(), "sohan");
  
  //     console.log(requestBody, "requestbody");
  //     // If a search term is entered, include it as order_id
  //     // if (search) {
  //     //   requestBody.order_id = search; // Dynamically set order_id as searchTerm
  //     // }
  
  //     const response = await fetch(`${BASE_URL}${ADMIN_ORDER_LIST}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(requestBody),
  //     });
  
  //     const data = await response.json();
  //     console.log(data, "data");
  
  //     if (data?.data?.order) {
  //       const enrichedOrders = await Promise.all(
  //         data.data.order.map(async (order) => ({
  //           ...order,
  //           phone_number: await getOnlineCustomerNumber(order.fromId),
  //         }))
  //       );
  
  //       setOrders(enrichedOrders);
  //       setFilteredOrders(enrichedOrders); // Display directly fetched orders
  //       setPaginationInfo(data.data.paginate); // Update pagination info
  //     } else {
  //       setOrders([]); // Clear orders if no data is returned
  //       setFilteredOrders([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //   } finally {
  //     clearInterval(progressInterval);
  //     setProgress(100);
  //     setTimeout(() => setLoading(false), 500);
  //   }
  // };

  
  
  // const handleSearchChange = (e) => {
  //   const term = e.target.value.trim(); // Trim spaces to avoid unnecessary API calls
  //   setSearchTerm(term);
  
  //   if (!term) {
  //     // Reset filtered data and fetch default orders if search is cleared
  //     fetchOrders(1);
  //   } else {
  //     fetchOrders(1, term);
  //   }
  // };


  // Fetch Orders from API
  // const fetchOrders = async (page = 1, searchParams = {}) => {
  //   setLoading(true);
  //   setProgress(0);

  //   const progressInterval = setInterval(() => {
  //     setProgress((prev) => Math.min(90, prev + 1));
  //   }, 30);

  //   try {
  //     const response = await axios.post(`${BASE_URL}${ADMIN_ORDER_LIST}`, {
  //       page,
  //       per_page: 10,
  //       ...searchParams, // Include order_id or any search parameter dynamically
  //     });

  //     const data = response.data;

  //     if (data?.data?.order) {
  //       // Update orders and filteredOrders
  //       setOrders(data.data.order);
  //       setFilteredOrders(data.data.order);

  //       // Initialize Fuse.js for fuzzy search
  //       const options = {
  //         keys: [
  //           "order_id",        // Order ID
  //           "phone_number",    // Phone number
  //           "order_locality",  // City
  //           "type",            // Order type
  //         ],
  //         threshold: 0.3,       // Sensitivity for fuzzy search
  //       };

  //       setFuse(new Fuse(data.data.order, options));
  //     } else {
  //       setOrders([]);
  //       setFilteredOrders([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //   } finally {
  //     clearInterval(progressInterval);
  //     setProgress(100);
  //     setTimeout(() => setLoading(false), 500);
  //   }
  // };

  // // Fetch initial data
  // useEffect(() => {
  //   fetchOrders(1);
  // }, []);

  let abortController;

  const fetchOrders = async (page = 1, searchParams = {}) => {
    setLoading(true);
    setProgress(0);

 if (abortController) {
  abortController.abort();
}
abortController = new AbortController(); 

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(90, prev + 1));
    }, 30);

    try {
      const response = await axios.post(`${BASE_URL}${ADMIN_ORDER_LIST}`, 
        {
        page,
        per_page: ordersPerPage,
        ...searchParams,
      },
      { signal: abortController.signal }
    );

      const data = response.data;

      if (data?.data?.order) {
        const enrichedOrders = await Promise.all(
          data.data.order.map(async (order) => ({
            ...order,
            phone_number: await getOnlineCustomerNumber(order.fromId),
          }))
        );

        // Update Orders and FilteredOrders
        setOrders(enrichedOrders);
        setFilteredOrders(enrichedOrders);

        setPaginate({
          total_item: data.data.paginate.total_item,
          showing: data.data.paginate.showing,
          first_page: data.data.paginate.first_page,
          previous_page: data.data.paginate.previous_page,
          current_page: data.data.paginate.current_page,
          next_page: data.data.paginate.next_page,
          last_page: data.data.paginate.last_page,
        });

        // Initialize Fuse.js for Fuzzy Search
        const options = {
          keys: ["order_id", "phone_number"],
          threshold: 1,
        };
        setFuse(new Fuse(enrichedOrders, options));
      } else {
        setOrders([]);
        setFilteredOrders([]);
        setPaginationInfo((prev) => ({
          ...prev,
          total_item: 0,
          showing: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  // Fetch Customer Phone Number
  const getOnlineCustomerNumber = async (customerId) => {
    const cached = localStorage.getItem(`customer_phone_${customerId}`);
    if (cached) return cached;

    try {
      const response = await axios.get(`${BASE_URL}${ADMIN_USER_DETAILS}${customerId}`);
      const phone = response.data.data.phone;
      localStorage.setItem(`customer_phone_${customerId}`, phone);
      return phone;
    } catch (error) {
      console.error("Error fetching customer phone:", error);
      return "N/A";
    }
  };

  
  // useEffect(() => {
  //   fetchOrders(paginate.current_page);
  // }, [paginate.current_page]);

  useEffect(() => {
    // Fetch orders when the component mounts or paginate.current_page changes
    fetchOrders(paginate.current_page);
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [paginate.current_page]);

  const handlePageChange = (page) => {
    fetchOrders(page);
  };

  // Handle Search Change
  const handleSearchChange = (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);

    // If term is numeric (order_id), send it to the server as an integer
    if (term && !isNaN(term)) {
      const orderId = parseInt(term, 10); // Convert to integer
      fetchOrders(1, { order_id: orderId });
    }
    // If search term is cleared, fetch all orders again
    else if (!term) {
      fetchOrders(1); // Fetch without search parameters (clear the filter)
    }
    // If search term is not numeric, apply fuzzy search on loaded data
    else if (term && fuse) {
      const results = fuse.search(term).map((result) => result.item);
      setFilteredOrders(results);
    }
  };

  // Event Handlers
  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  //   fetchOrders(page);
  // };

  // useEffect(() => {
  //   fetchOrders(paginationInfo.current_page);
  // }, [paginationInfo.current_page]);

  // const handlePageChange = (page) => {
  //   setPaginationInfo((prev) => ({
  //     ...prev,
  //     current_page: page,
  //   }));
  // };

  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");
  // Handle Phone Search
  const handlePhoneSearchChange = (e) => {
    const term = e.target.value.trim();
    setPhoneSearchTerm(term);

    if (!term) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.phone_number.includes(term)
      );
      setFilteredOrders(filtered);
    }
  };
  
// useEffect(() => {
//   fetchOrders(1); // Fetch only once when a dependency changes
// }, [
//   selectedOrderType,
//   selectedStatus,
//   selectedOrderStatus,
//   selectedCity,
//   startDate,
//   endDate,
//   createdAtStart,
//   createdAtEnd
// ]);

// Filter orders when orders or filtering inputs change
// useEffect(() => {
//   const filtered = orders.filter((order) => {
//     const transformedOrderId = getOrderId(order.order_id);
//     const sanitizedSearchTerm = searchTerm.startsWith("#")
//       ? searchTerm
//       : `#${searchTerm}`;
//     const matchesSearch =
//       sanitizedSearchTerm === "" ||
//       transformedOrderId.includes(sanitizedSearchTerm);

//     const matchesPhoneNumber =
//       (order.phone_number && order.phone_number.includes(phoneSearchTerm)) ||
//       (order.phone_no && order.phone_no.includes(phoneSearchTerm));

//     const orderCreatedAt = new Date(order.createdAt);
//     const orderDate = new Date(order.order_date.split("T")[0]);
//     const matchesDateRange =
//       (!startDate || orderDate >= new Date(startDate)) &&
//       (!endDate || orderDate <= new Date(endDate));

//     const matchesCreatedAtRange =
//       (!createdAtStart || orderCreatedAt >= new Date(createdAtStart)) &&
//       (!createdAtEnd || orderCreatedAt <= new Date(createdAtEnd));

//     const matchesOrderType =
//       !selectedOrderType || getOrderType(order.type) === selectedOrderType;

//     const matchesStatus =
//       !selectedStatus ||
//       (selectedStatus === "Active" && order.status === 1) ||
//       (selectedStatus === "Inactive" && order.status === 0);

//     const matchesOrderStatus =
//       !selectedOrderStatus ||
//       (selectedOrderStatus === "Booking" && order.order_status === 0) ||
//       (selectedOrderStatus === "Accepted" && order.order_status === 1) ||
//       (selectedOrderStatus === "In-progress" && order.order_status === 2) ||
//       (selectedOrderStatus === "Completed" && order.order_status === 3) ||
//       (selectedOrderStatus === "Cancelled" && order.order_status === 4) ||
//       (selectedOrderStatus === "Expired" && order.order_status === 6);

//     const matchesCity =
//       !selectedCity || order.order_locality === selectedCity;

//     return (
//       matchesSearch &&
//       matchesPhoneNumber &&
//       matchesDateRange &&
//       matchesCreatedAtRange &&
//       matchesOrderType &&
//       matchesStatus &&
//       matchesOrderStatus &&
//       matchesCity
//     );
//   });

//   setFilteredOrders(filtered);
//   setCurrentPage(1); // Reset pagination after filtering
// }, [
//   orders,
//   searchTerm,
//   phoneSearchTerm,
//   startDate,
//   endDate,
//   createdAtStart,
//   createdAtEnd,
//   selectedOrderType,
//   selectedStatus,
//   selectedOrderStatus,
//   selectedCity
// ]);


  // useEffect(() => {
  //   const filtered = orders.filter((order) => {
  //     // const matchesSearch = order.order_id.toString().includes(searchTerm);
  //     const transformedOrderId = getOrderId(order.order_id);
  //     const sanitizedSearchTerm = searchTerm.startsWith("#")
  //       ? searchTerm
  //       : `#${searchTerm}`;
  //     const matchesSearch =
  //       sanitizedSearchTerm === "" ||
  //       transformedOrderId.includes(sanitizedSearchTerm);

  //     const matchesPhoneNumber =
  //       (order.phone_number && order.phone_number.includes(phoneSearchTerm)) ||
  //       (order.phone_no && order.phone_no.includes(phoneSearchTerm));

  //     const orderCreatedAt = new Date(order.createdAt);
  //     const orderDate = new Date(order.order_date.split("T")[0]);
  //     const matchesDateRange =
  //       (!startDate || orderDate >= new Date(startDate)) &&
  //       (!endDate || orderDate <= new Date(endDate));

  //     const matchesCreatedAtRange =
  //       (!createdAtStart || orderCreatedAt >= new Date(createdAtStart)) &&
  //       (!createdAtEnd || orderCreatedAt <= new Date(createdAtEnd));

  //     const matchesOrderType =
  //       !selectedOrderType || getOrderType(order.type) === selectedOrderType;

  //     const matchesStatus =
  //       !selectedStatus ||
  //       (selectedStatus === "Active" && order.status === 1) ||
  //       (selectedStatus === "Inactive" && order.status === 0);

  //     const matchesOrderStatus =
  //       !selectedOrderStatus ||
  //       (selectedOrderStatus === "Booking" && order.order_status === 0) ||
  //       (selectedOrderStatus === "Accepted" && order.order_status === 1) ||
  //       (selectedOrderStatus === "In-progress" && order.order_status === 2) ||
  //       (selectedOrderStatus === "Completed" && order.order_status === 3) ||
  //       (selectedOrderStatus === "Cancelled" && order.order_status === 4) ||
  //       (selectedOrderStatus === "Expired" && order.order_status === 6);

  //     const matchesCity =
  //       !selectedCity || order.order_locality === selectedCity;

  //     return (
  //       matchesSearch &&
  //       matchesPhoneNumber &&
  //       matchesDateRange &&
  //       matchesCreatedAtRange &&
  //       matchesOrderType &&
  //       matchesStatus &&
  //       matchesOrderStatus &&
  //       matchesCity
  //     );
  //   });
  //   setFilteredOrders(filtered);
  //   setCurrentPage(1);
  // }, [
  //   searchTerm,
  //   phoneSearchTerm,
  //   startDate,
  //   endDate,
  //   createdAtStart,
  //   createdAtEnd,
  //   selectedOrderType,
  //   selectedStatus,
  //   selectedOrderStatus,
  //   selectedCity,
  //   orders,
  // ]);
  
  // // Side Effects
  // useEffect(() => {
  //   fetchOrders(1);
  // }, [
  //   selectedOrderType,
  //   selectedStatus,
  //   selectedOrderStatus,
  //   selectedCity,
  //   startDate,
  //   endDate,
  //   createdAtStart,
  //   createdAtEnd
  // ]);

  // Fetch orders when filtering options change

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

  // const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  // const displayedOrders = filteredOrders.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  const getOrderType = (orderTypeValue) => {
    const orderTypes = {
      1: "Decoration",
      2: "Chef",
      6: "Food Delivery",
      7: "Live Catering",
    };
    return orderTypes[orderTypeValue] || "Unknown Order Type";
  };

  const [supplierDetails, setSupplierDetails] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openSupplierPopup = async (orderId) => {
    try {
      const response = await fetch(
        `https://horaservices.com:3000/api/admin/getUserDetails/${orderId}`
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

  const openActionPopup = (orderId, orderType, order_Id) => {
    let apiUrl;
    let popupTypeValue;
    if (orderType === 1) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_decoration/${orderId}`;
      popupTypeValue = "decoration";
    } else if (orderType === 2) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details/v1/${order_Id}`;
      popupTypeValue = "chef";
    } else if (orderType === 6 || orderType === 7) {
      apiUrl = `https://horaservices.com:3000/api/order/order_details_food_delivery/${orderId}`;
      popupTypeValue = "foodDelivery";
    } else {
      alert("Currently Data is Not Available");
      return;
    }
    setPopupType(popupTypeValue);
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (!data.error && data.status === 200) {
          setOrderDetails(data.data);
          setPopupOpen(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
      });
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedAddress("");
    setIsPopupOpen(false);
    setSupplierDetails(null);
  };

  const handleCallingStatus = (event, phone_no) => {
    const selectedValue = event.target.value;

    if (selectedValue === "one") {
      alert(`You selected One! Phone number: ${phone_no}`);
    } else if (selectedValue === "two") {
      alert(`You selected Two! Phone number: ${phone_no}`);
    } else if (selectedValue === "three") {
      alert(`You selected Three! Phone number: ${phone_no}`);
    }
  };

  const sendWelcomeMessage = async (mobileNumber) => {
    let formattedMobileNumber = mobileNumber;

    if (!formattedMobileNumber.startsWith("+91")) {
      formattedMobileNumber = "+91" + formattedMobileNumber;
    }

    formattedMobileNumber = formattedMobileNumber.replace(/\s+/g, "");

    const options = {
      method: "POST",
      url: "https://public.doubletick.io/whatsapp/message/template",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: "key_wZpn79uTfV",
      },
      data: {
        messages: [
          {
            content: {
              language: "en",
              templateData: {
                header: {
                  type: "IMAGE",
                  mediaUrl:
                    "https://quickscale-template-media.s3.ap-south-1.amazonaws.com/org_FGdNfMoTi9/2a2f1b0c-63e0-4c3e-a0fb-7ba269f23014.jpeg",
                },
                body: { placeholders: ["Hora Services"] },
              },
              templateName: "order_confirmation_message__v3",
            },
            from: "+917338584828",
            to: formattedMobileNumber,
          },
        ],
      },
    };

    try {
      const response = await axios.request(options);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  };

  const showAlert = (status) => {
    alert(`Selected status: ${status}`);
  };

  const handleCallClick = (phoneNo) => {
    window.location.href = `tel:${phoneNo}`;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      "Order Id",
      "Order Type",
      "City",
      "Fulfillment Date",
      "Otp",
      "Offline Customer No",
      "Online Customer No",
      "Supplier",
      "Order Start & End Time",
      "Total Amount",
      "Order Status",
      "Created",
      "Calling Status",
      "Status",
      "Action",
    ];

    const formattedData = filteredOrders.map((order) => ({
      "Order Id": order.order_id,
      "Order Type": getOrderType(order.type),
      City: order.order_locality || "N/A",
      "Fulfillment Date": `${order.order_date.split("T")[0]} ${
        order.order_time
      }`,
      Otp: order.otp,
      "Offline Customer No": order.phone_no || "N/A",
      "Online Customer No": order.phone_number || "N/A",
      Supplier: order.supplier ? order.supplier : "NA",
      "Order Start & End Time": `${order.start_time} - ${order.end_time}`,
      "Total Amount": order.total_amount,
      "Order Status": getOrderStatus(order.order_status).status,
      Created: new Date(order.createdAt).toLocaleString(),
      "Calling Status": order.calling_status || "N/A",
      Status: order.status === 1 ? "Active" : "Inactive",
      Action: "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Orders");
    XLSX.writeFile(wb, "file.xlsx");
  };

  //    const handlePageChange = (page) => {
  //   if (page > 0 && page <= totalPages) {
  //     setCurrentPage(page);
  //   } else {
  //     console.warn(`Page ${page} is out of bounds. Must be between 1 and ${totalPages}`);
  //   }
  // };

  // const handlePageChange = (page) => {
  //   if (page >= 1 && page <= totalPages) {
  //     setCurrentPage(page);
  //   }
  // };


   // Loading Screen Component
   const LoadingScreen = () => (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="loading-text">Loading... {progress}%</div>
      </div>
    </div>
  );

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        "https://horaservices.com:3000/api/order/update_order_status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: orderId, status: status }),
        }
      );

      const data = await response.json();

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

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const renderPageNumbers = () => {
    const { first_page, current_page, last_page } = paginate;
    const pageNumbers = [];
    const delta = 2; // Number of pages to show before/after the current page

    for (let i = 1; i <= last_page; i++) {
      if (
        i === first_page || // First page
        i === last_page || // Last page
        (i >= current_page - delta && i <= current_page + delta) // Current window
      ) {
        pageNumbers.push(i);
      } else if (
        i === current_page - delta - 1 || // Add ellipsis before
        i === current_page + delta + 1 // Add ellipsis after
      ) {
        pageNumbers.push("...");
      }
    }

    return [...new Set(pageNumbers)]; // Ensure no duplicate ellipses
  };

  return (
    <div>
      {loading && <LoadingScreen />}
      
      
        <div className="order-list-container">
          <div className="order-header">
            <h2>Order Details</h2>
          </div>

          <div className="search-download-container">
            <div className="search-box">
              <input
                type="text"
                className="small-search"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={handleSearchChange}
              />

              {/* Phone Number Search */}
              <input
                type="text"
                className="small-search"
                placeholder="Search by Phone Number"
                value={phoneSearchTerm}
                onChange={handlePhoneSearchChange}
              />

              {/* Start Date and End Date Box */}
              <div className="date-filter-box">
                {/* <h3 className="date-filter-title">Start & End Date</h3> */}
                <div className="date-filter-container">
                  <div className="date-input-container">
                    <label className="date-label">Start (Fulfillment)</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start Date"
                      className="date-input"
                    />
                  </div>

                  <div className="date-input-container">
                    <label className="date-label">End (Fulfillment)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End Date"
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              {/* Created At Date Box */}
              <div className="date-filter-box">
                {/* <h3 className="date-filter-title">Created At Date</h3> */}
                <div className="date-filter-container">
                  <div className="date-input-container">
                    <label className="date-label">Start (Created)</label>
                    <input
                      type="date"
                      value={createdAtStart}
                      onChange={(e) => setCreatedAtStart(e.target.value)}
                      placeholder="Created At Start"
                      className="date-input"
                    />
                  </div>

                  <div className="date-input-container">
                    <label className="date-label">End (Created)</label>
                    <input
                      type="date"
                      value={createdAtEnd}
                      onChange={(e) => setCreatedAtEnd(e.target.value)}
                      placeholder="Created At End"
                      className="date-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="orders-box">
            <button className="red-button" onClick={exportToExcel}>
              Download Excel
            </button>

            <table className="order-table">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th className="order-type-header">
                    <span> Order Type</span>
                    <span>
                      {" "}
                      <select
                        value={selectedOrderType}
                        onChange={(e) => setSelectedOrderType(e.target.value)}
                        className="order-type-dropdown"
                      >
                        <option value="">All</option>
                        <option value="Decoration">Decoration</option>
                        <option value="Chef">Chef</option>
                        <option value="Food Delivery">Food Delivery</option>
                        <option value="Live Catering">Live Catering</option>
                      </select>
                    </span>
                  </th>

                  <th className="order-type-header">
                    <span> City</span>
                    <span>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
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
                  <th>Otp</th>
                  <th>Order Taken By</th>
                  <th>Offline Customer No</th>
                  <th>Online Customer No</th>
                  <th>Supplier</th>
                  <th>Order Start & End Time</th>
                  <th>Total Amount</th>
                  <th className="order-type-header">
                    <span>Order Status</span>
                    <span>
                      <select
                        value={selectedOrderStatus}
                        onChange={(e) => setSelectedOrderStatus(e.target.value)}
                        className="order-type-dropdown"
                      >
                        <option value="">All</option>
                        <option value="Booking">Booking</option>
                        <option value="Expired">Expired</option>
                        <option value="Completed">Completed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In-progress">In-progress</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </span>
                  </th>
                  <th>Created</th>
                  <th>Calling Status</th>
                  <th className="order-type-header">
                    Status
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="order-type-dropdown"
                    >
                      <option value="">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </th>
                  <th>Action</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {/* {displayedOrders.length > 0 ? (
                  displayedOrders.map((order, index) => ( */}
                              {filteredOrders.map((order) => (
                    // <tr key={index}>
                    <tr key={order._id}>
                      <td>{order.order_id}</td>
                      {/* <td>{getOrderId(order.order_id)}</td> */}
                      <td>{getOrderType(order.type)}</td>
                      <td>{order.order_locality || "N/A"}</td>
                      <td>
                        {order.order_date.split("T")[0]} {order.order_time}
                      </td>
                      <td>{order.otp}</td>
                      <td>"N/A"</td>
                      <td>{order.phone_no || "N/A"}</td>
                      {/* <td>
                    <FaEye
                      onClick={() => getOnlineCustomerNumber(order.fromId)}
                    />
                  </td> */}
                      <td>{order.phone_number || "N/A"}</td>
                      {/* <td>{order.supplierUserIds.join(", ") || "N/A"}</td> */}
                      <td>
                        {order.toId ? (
                          <FaEye
                            onClick={() => openSupplierPopup(order.toId)}
                          />
                        ) : (
                          <p>NA</p>
                        )}

                        {isPopupOpen && supplierDetails && (
                          <div className="popup-overlay" onClick={closePopup}>
                            <div
                              className="popup"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="close-button"
                                onClick={closePopup}
                              >
                                ×
                              </button>
                              <h3>Supplier Details</h3>
                              <p>Name: {supplierDetails.name}</p>
                              <p>Phone: {supplierDetails.data.phone}</p>
                              <p>City: {supplierDetails.data.city}</p>
                              <p>Role: {supplierDetails.data.role}</p>
                            </div>
                          </div>
                        )}

                        <style jsx>{`
                          .popup-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.2);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1000;
                          }
                          .popup {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            max-width: 400px;
                            width: 100%;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                            position: relative;
                          }
                          .close-button {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: transparent;
                            border: none;
                            font-size: 18px;
                            cursor: pointer;
                          }
                        `}</style>
                      </td>

                      <td>{"N/A"}</td>
                      <td>₹{order.total_amount}</td>
                     
                      <td>
                        <span
                          className={`status ${
                            getOrderStatus(order.order_status).className
                          }`}
                        >
                          {getOrderStatus(order.order_status).status}
                        </span>
                      </td>

                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={styles.container}>
                          {/* Call Icon */}
                          <div
                            // style={styles.callIcon}
                            onClick={() => handleCallClick(order.phone_no)}
                          >
                            N/A
                            {/* <FaPhone /> */}
                          </div>

                          {/* Buttons for Call Status */}
                          <div style={styles.btnGroup}>
                            {/* <button
                              style={{ ...styles.btn, ...styles.btnCalled }}
                              onClick={() => showAlert("Called")}
                            >
                              Called
                            </button>
                            <button
                              style={{ ...styles.btn, ...styles.btnNotCalled }}
                              onClick={() => showAlert("Not Called")}
                            >
                              Not Called
                            </button>
                            <button
                              style={{
                                ...styles.btn,
                                ...styles.btnNotReceived,
                              }}
                              onClick={() => showAlert("Not Received")}
                            >
                              Not Received
                            </button> */}
                          </div>
                        </div>
                      </td>
                      {/* <td>
                    <button
                      className={`status-button ${
                        order.status === 0 ? "active" : "inactive"
                      }`}
                    >
                      {order.status === 1 ? "Active" : "Inactive"}
                    </button>
                  </td> */}
                      <td>
                        <button
                          className={`status-button ${
                            order.status === 0 ? "active" : "inactive"
                          }`}
                          onClick={() =>
                            updateOrderStatus(
                              order._id,
                              order.status === 1 ? 0 : 1
                            )
                          } // Toggle between 1 and 0
                        >
                          {order.status === 1 ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <FaEye
                          onClick={() =>
                            openActionPopup(
                              order.order_id,
                              order.type,
                              order._id
                            )
                          }
                        />
                      </td>
                      <td>N/A</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* <div className="horizontal-scroll">
            <FaChevronLeft
              className="scroll-arrow"
              onClick={() => handlePageChange(currentPage - 1)}
            />
            <div className="pagination-slider">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(currentPage - 1, currentPage + 14)
                .map((page) => (
                  <button
                    key={page}
                    className={`page-number ${
                      page === currentPage ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
            </div>
            <FaChevronRight
              className="scroll-arrow"
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </div>
          
          */}

          {/* <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page}
                className={currentPage === page + 1 ? "active" : ""}
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div> */}
 
    {/* Pagination */}
    <div className="pagination">
        <button
          disabled={paginate.current_page === paginate.first_page}
          onClick={() => handlePageChange(paginate.previous_page)}
        >
          Previous
        </button>

        {renderPageNumbers().map((page, index) => (
          <button
            key={index}
            disabled={page === "..."}
            onClick={() => page !== "..." && handlePageChange(page)}
            className={paginate.current_page === page ? "active" : ""}
          >
            {page}
          </button>
        ))}

        <button
          disabled={paginate.current_page === paginate.last_page}
          onClick={() => handlePageChange(paginate.next_page)}
        >
          Next
        </button>
      </div>
{/* <div className="pagination-container">
        <div className="pagination-info">
          Showing {paginationInfo.showing} of {paginationInfo.total_item} orders
        </div>
        <div className="pagination-controls">
          <button
            disabled={currentPage === paginationInfo.first_page}
            onClick={() => handlePageChange(paginationInfo.previous_page)}
          >
            Previous
          </button>
          {Array.from({ length: paginationInfo.last_page }, (_, i) => i + 1)
            .map((page) => (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          <button
            disabled={currentPage === paginationInfo.last_page}
            onClick={() => handlePageChange(paginationInfo.next_page)}
          >
            Next
          </button>
        </div>
      </div> */}

          <Popup
            isOpen={popupOpen}
            address={selectedAddress}
            onClose={closePopup}
          />
          <ActionPopup
            isOpen={popupOpen}
            orderDetails={orderDetails}
            popupType={popupType}
            onClose={closePopup}
          />
        </div>
      
    </div>
  );
};

export default OrderList;

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
};

