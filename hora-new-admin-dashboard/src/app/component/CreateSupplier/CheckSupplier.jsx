import React, { useState } from "react";
import axios from "axios";
import { BASE_URL, ACCEPT_ORDER, ORDER_EDIT } from "../../../utils/apiconstant";
import CreateSupplierPopup from "./CreateSupplierPopup";

const CheckSupplier = ({
  SelectedOrder,
  setShowModal,
  setIsSupplierAssigned,
}) => {
  console.log("SelectedOrder in CheckSupplier:", SelectedOrder);
  console.log("SelectedOrder in CheckSuppliertoid:", SelectedOrder.toId);
  const [supplierData, setSupplierData] = useState(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [customerNumber, setCustomerNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const handleClosePopup = () => {
    setShowModal(false); // Directly call setShowModal to close the modal
  };

  const handleCreateSupplier = () => {
    setShowCreatePopup(true);
  };

  const handleAssignPopup = async () => {
    if (!supplierData || !SelectedOrder) {
      alert("Missing supplier or order details.");
      return;
    }

    try {
      const response = await fetch(BASE_URL + ACCEPT_ORDER, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Authorisation: supplierData.device_token,
          otp: SelectedOrder.otp,
          _id: SelectedOrder._id,
          userId: supplierData._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Successfully assigned!");
        setShowModal(false); // Close modal after assignment
        setIsSupplierAssigned(true);
      } else {
        alert(data.message || "Failed to assign. Try again.");
      }
    } catch (error) {
      console.error("Error during API request:", error);
      alert("An error occurred. Please try again.");
    }
  };


  
  const handleReAssignPopup = async () => {
    if (!supplierData || !SelectedOrder) {
      alert("Missing supplier or order details.");
      return;
    }

    try {
      const response = await fetch(BASE_URL + ORDER_EDIT, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Authorisation: supplierData.device_token,
          // otp: SelectedOrder.otp,
          _id: SelectedOrder._id,
          toId: supplierData._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Successfully re-assigned!");
        setShowModal(false); // Close modal after assignment
        setIsSupplierAssigned(true);
      } else {
        alert(data.message || "Failed to re-assign. Try again.");
      }
    } catch (error) {
      console.error("Error during API request:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleCheckCustomer = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      console.log("Checking supplier number:", customerNumber);

      const response = await axios.post(
        "https://horaservices.com:3000/api/admin/admin_user_list",
        {
          email: "",
          page: "",
          per_page: 2000,
          phone: "",
          role: "supplier",
        }
      );

      const users = response?.data?.data?.users || response?.data?.users || [];

      if (!Array.isArray(users) || users.length === 0) {
        setMessage("No suppliers found in the response.");
        setMessageColor("orange");
        setSupplierData(null);
        return;
      }

      console.log("Total suppliers found:", users.length);

      const formattedCustomerNumber = customerNumber.trim();
      const supplier = users.find(
        (user) => user.phone?.trim() === formattedCustomerNumber
      );

      if (supplier) {
        setSupplierData(supplier);
        setMessage("Supplier exists.");
        setMessageColor("green");
        setShowPopup(false);
      } else {
        setSupplierData(null);
        setMessage("Supplier does not exist.");
        setMessageColor("red");
        setShowPopup(true);
      }
    } catch (err) {
      setMessage("An error occurred while checking the supplier.");
      setMessageColor("red");
      console.error("Error:", err, showPopup);
      setSupplierData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Check Vendor is available or not:</h3>
        <input
          type="text"
          id="customerNumber"
          value={customerNumber}
          onChange={(e) => {
            // Update customerNumber and reset supplierData separately
            setCustomerNumber(e.target.value.replace(/\D/g, "")); // Update customer number
            setSupplierData(null); // Reset supplier data
            setMessage(""); // Reset message
          }}
          placeholder="Enter Number"
          required
          maxLength={10}
          pattern="\d{10}"
          inputMode="numeric"
          className="input-field"
        />
        <button
          className="vendor-check-btn buttonPrimary"
          onClick={handleCheckCustomer}
          disabled={loading || customerNumber.length !== 10}
        >
          {loading ? "Checking..." : "Check Vendor"}
        </button>

        {message && (
          <p
            className="message-text"
            style={{ color: messageColor, fontWeight: "bold" }}
          >
            {message}
          </p>
        )}

        {/* Show supplier details if found */}
        {supplierData && SelectedOrder && (
          <div className="supplier-info">
            <p>
              <strong>Supplier ID:</strong> {supplierData._id}
            </p>
            <p>
              <strong>Token:</strong> {supplierData.device_token}
            </p>
            <p>
              <strong>Order ID:</strong> {SelectedOrder._id}
            </p>

            {/* <button className="assign-btn" onClick={handleReAssignPopup}>
              Assign12
            </button> */}
            {SelectedOrder.order_status === 6 ? (
              <button className="assign-btn" onClick={handleReAssignPopup}>
                Re-Assign
              </button>
            ) : null // or nothing, to hide the Assign button
            }

            {/* // Show Reassign only if order_status is NOT 6 */}
            {SelectedOrder.order_status !== 6 && (
              <button className="assign-btn" onClick={handleAssignPopup}>
                Assign
              </button>
            )}

          </div>
        )}

        {/* Show "Create Supplier" button if supplier does not exist */}
        {!supplierData && message && (
          <button
            className="create-supplier-btn"
            onClick={handleCreateSupplier}
          >
            Create Supplier
          </button>
        )}

        <CreateSupplierPopup
          isOpen={showCreatePopup}
          onClose={() => setShowCreatePopup(false)}
          CustomerNumber={customerNumber}
        />

        <button className="close-btn" onClick={handleClosePopup}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CheckSupplier;
