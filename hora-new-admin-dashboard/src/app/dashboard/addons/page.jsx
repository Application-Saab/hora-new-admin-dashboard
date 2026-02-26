"use client";
import React, { useState } from "react";
import Addaddons from './Addaddon';
import AddonList from './AddonList'
import "./addon.css";

const AddonPage = () => {
  const [activeTab, setActiveTab] = useState("add"); // default Add Addon

  const tabs = [
    {
      id: "add",
      label: "Add Addon",
      component: <Addaddons />,
    },
    {
      id: "list",
      label: "Addon List",
      component: <AddonList />,
    },
  ];


  return (
    <div className="addon-container">

      <h2 className="pageHeading">Addons</h2>

      {/* TOP BUTTONS */}
      <div className="addon-tabs">
        {tabs.map((item) => {
          return (
            <button
              key={item?.id}
              className={activeTab === item?.id ? "active-tab" : "tab"}
              onClick={() => setActiveTab(item?.id)}
            >
              {item?.label}
            </button>
          )
        })}
      </div>

      {/* CONTENT */}
      <div className="addon-content">
        {activeTab === "add" ? <Addaddons /> : <AddonList />}
      </div>

    </div>
  );
};

export default AddonPage;
