import CallChecklistContent from "./CallChecklistContent";
import PhotographyCallChecklistContent from "./PhotographyCallChecklistContent";
import "./CallChecklist.css";
import { useEffect, useState } from "react";
import { BASE_URL, CREATE_WONDERLAND_EVENT } from "@/utils/apiconstant";
import axios from "axios";

const CallChecklist = ({ open, onClose, data = null, setRefetchData }) => {
  const [wonderlandevent, setWonderlandEvent] = useState(
    data?.eventData?.[0]?.hostName || "",
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
      userId: data?.fromId || "",
      eventType: data?.eventName || "",
      hostName: wonderlandevent || "",
      // eventDate: (data?.order_date && convertToISO(data?.order_date)) || "",
      eventDate: data?.order_date || "",
      location: data?.addressId[0]?.address1 || "",
      googleMapLink: data?.addressId[0]?.address2 || "",
    }));
  }, [data, wonderlandevent]);

  const createWonderlandEvent = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}${CREATE_WONDERLAND_EVENT}`,
        {
          ...eventFormData,
          orderId: data?.order_id || "",
        },
      );
      if (response.status === 200 || response.status === 201) {
        setEventResponse(response?.data?.data);
        setRefetchData(true);
      }
    } catch (error) {
      console.error("Error creating wonderland event:", error);
      alert("There was an error creating wonderland event.");
    }
  };

  if (!open) return null;

  return (
    <div className="checklist-overlay">
      <div className="checklist-modal">
        <div className="checklist-header">
          <h3>Order Call Checklist</h3>
        </div>
        <div
          style={{
            marginTop: "10px",
            backgroundColor: "#e46363",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>Wonderland Event Name</div>
          {data?.eventData?.length > 0 || eventResponse?._id ? (
            <div>{data?.eventData[0]?.hostName || eventResponse?.hostName}</div>
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
        {data?.type === 1 ? (
          <CallChecklistContent open={open} onClose={onClose} data={data} />
        ) : data?.type === 8 ? (
          <PhotographyCallChecklistContent
            open={open}
            onClose={onClose}
            data={data}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CallChecklist;
