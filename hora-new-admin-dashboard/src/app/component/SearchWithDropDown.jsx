import React, { useState } from "react";
import { useMemo } from "react";

const SearchWithDropDown = ({
    options = [],
    selectedValue,
    onChange,
    placeholder = "Search..."
}) => {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    // Filtered Options using useMemo
    const filteredOptions = useMemo(() => {
        return options.filter((opt) =>
            opt.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const handleOpen = () => {
        setOpen(true);
    };


    return (
        <div style={{ width: "90%", position: "relative" }}>

            {/* Visible Box / Search Box */}
            <input
                value={open ? search : selectedValue || ""}
                placeholder={placeholder}
                onClick={handleOpen}
                onChange={(e) => {
                    setSearch(e.target.value);
                    handleOpen();
                }}
                style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    cursor: "pointer"
                }}
            />

            {/* Dropdown Options */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "45px",
                        width: "100%",
                        background: "#fff",
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        zIndex: 1000,
                    }}
                >
                    {filteredOptions.length === 0 ? (
                        <div style={{ padding: "10px", color: "#999" }}>No result found</div>
                    ) : (
                        filteredOptions.map((opt, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    onChange(opt);
                                    setSearch("");
                                    setOpen(false);
                                }}
                                style={{
                                    padding: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                {opt}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchWithDropDown;
