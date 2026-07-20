import React from "react";
import "./error-logs-tracking.css";

const ErrorLogModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN");
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text || "");
  };

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">

        <div className="modal-header">
          <h2>Error Details</h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Basic */}

        <div className="section">

          <h3>Basic Information</h3>

          <div className="grid">

            <div>
              <label>Type</label>
              <span>{data.type || "N/A"}</span>
            </div>

            <div>
              <label>Status Code</label>
              <span>{data.statusCode || "N/A"}</span>
            </div>

            <div>
              <label>Time</label>
              <span>{formatDate(data.timestamp)}</span>
            </div>

          </div>

        </div>

        {/* Message */}

        <div className="section">

          <div className="section-title">

            <h3>Message</h3>

            <button onClick={() => copyText(data.message)}>
              Copy
            </button>

          </div>

          <pre>{data.message || "N/A"}</pre>

        </div>

        {/* Request */}

        <div className="section">

          <h3>Request</h3>

          <div className="grid">

            <div>
              <label>Endpoint</label>
              <span>{data.endpoint || "N/A"}</span>
            </div>

            <div>
              <label>Page</label>
              <span>{data.page || "N/A"}</span>
            </div>

            <div>
              <label>URL</label>
              <span>{data.url || "N/A"}</span>
            </div>

          </div>

        </div>

        {/* User */}

        <div className="section">

          <h3>User Information</h3>

          <div className="grid">

            <div>
              <label>User Id</label>
              <span>{data.userId || "N/A"}</span>
            </div>

            <div>
              <label>Visitor Id</label>
              <span>{data.visitorId || "N/A"}</span>
            </div>

            <div>
              <label>Browser</label>
              <span>{data.browser || "N/A"}</span>
            </div>

            <div>
              <label>Device</label>
              <span>{data.device || "N/A"}</span>
            </div>

          </div>

        </div>

        {/* Component */}

        <div className="section">

          <h3>Component</h3>

          <div className="grid">

            <div>
              <label>Component</label>
              <span>{data.component || "N/A"}</span>
            </div>

          </div>

        </div>

        {/* Stack */}

        <div className="section">

          <div className="section-title">

            <h3>Stack Trace</h3>

            <button onClick={() => copyText(data.stack)}>
              Copy
            </button>

          </div>

          <pre className="code">
            {data.stack || "No Stack Trace"}
          </pre>

        </div>

        {/* Payload */}

        <div className="section">

          <div className="section-title">

            <h3>Payload</h3>

            <button
              onClick={() =>
                copyText(JSON.stringify(data.payload, null, 2))
              }
            >
              Copy
            </button>

          </div>

          <pre className="code">
            {JSON.stringify(data.payload || {}, null, 2)}
          </pre>

        </div>

      </div>
    </div>
  );
};

export default ErrorLogModal;