"use client";
import React, { useState } from "react";
import Addtheme from './Addtheme';
import ThemeList from './ThemeList'
import "./theme.css";

const ThemePage = () => {
    const [activeTab, setActiveTab] = useState("add"); // default Add Theme

    const tabs = [
        {
            id: "add",
            label: "Add Theme",
            component: <Addtheme />,
        },
        {
            id: "list",
            label: "Theme List",
            component: <ThemeList />,
        },
    ];


    return (
        <div className="addon-container">

            <h2 className="pageHeading">Photography Theme</h2>

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
                {activeTab === "add" ? <Addtheme /> : <ThemeList />}
            </div>

        </div>
    );
};

export default ThemePage;
