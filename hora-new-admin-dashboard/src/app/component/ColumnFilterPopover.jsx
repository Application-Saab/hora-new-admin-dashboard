import React, { useState, useEffect, useRef } from "react";
import { CiFilter } from "react-icons/ci";
import { FaFilter } from "react-icons/fa";

const ColumnFilterPopover = ({
  title,
  options = [],
  selectedValues = [],
  onApply,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelected, setTempSelected] = useState(selectedValues);
  const popoverRef = useRef(null);

  useEffect(() => {
    setTempSelected(selectedValues);
  }, [selectedValues, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleOption = (val) => {
    if (tempSelected.includes(val)) {
      setTempSelected(tempSelected.filter((item) => item !== val));
    } else {
      setTempSelected([...tempSelected, val]);
    }
  };

  const handleApply = () => {
    onApply(tempSelected);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempSelected([]);
    onClear();
    setIsOpen(false);
  };

  const filteredOptions = options.filter((item) =>
    String(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isActive = selectedValues.length > 0;

  return (
    <div
      className="column-filter-container"
      ref={popoverRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`filter-icon-btn ${isActive ? "active" : ""}`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginLeft: "6px",
        }}
      >
        {isActive ? <FaFilter color="#007bff" /> :  <CiFilter size={15} color="#888" />}
      </button>

      {isOpen && (
        <div
          className="filter-popover"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "0",
            zIndex: 9999,
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            padding: "12px",
            width: "220px",
            textAlign: "left",
            fontWeight: "normal",
            color: "#333",
          }}
        >
          <input
            type="text"
            placeholder={`Search ${title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              marginBottom: "8px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          />

          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              marginBottom: "10px",
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <label
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 0",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tempSelected.includes(opt)}
                    onChange={() => toggleOption(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))
            ) : (
              <div style={{ fontSize: "11px", color: "#888" }}>
                No options found
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "6px",
            }}
          >
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                border: "1px solid #ccc",
                background: "#f8f9fa",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                border: "none",
                background: "#007bff",
                color: "#fff",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnFilterPopover;
