"use client";
import React, { useState } from "react";
import Addaddons from './Addaddon';
import AddonList from './AddonList'
import "./addon.css";

const AddonPage = () => {
  const [activeTab, setActiveTab] = useState("add"); // default Add Addon

  return (
    <div className="addon-container">

      <h2 className="pageHeading">Addons</h2>
      
      {/* TOP BUTTONS */}
      <div className="addon-tabs">
        <button
          className={activeTab === "add" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("add")}
        >
          Add Addon
        </button>

        <button
          className={activeTab === "list" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("list")}
        >
          Addon List
        </button>
      </div>

      {/* CONTENT */}
      <div className="addon-content">
        {activeTab === "add" ? <Addaddons /> : <AddonList />}
      </div>

    </div>
  );
};

export default AddonPage;
