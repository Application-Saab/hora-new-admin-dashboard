"use client";

import { useEffect, useState } from "react";
import "./pincodes.css";
import { BASE_URL } from "@/utils/apiconstant";

export default function Pincodes() {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPincodes();
    }, [page]);

    const fetchPincodes = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${BASE_URL}/api/pincode/serviceability?page=${page}&limit=10`
            );

            const result = await response.json();

            if (result.success) {
                setPincodes(result.data);
                setTotalPages(result.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching pincodes:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="pincode-loading">Loading...</div>;
    }

    if (!pincodes.length) {
        return (
            <div className="pincode-container">
                <h2>Pincode Serviceability</h2>
                <p>No Data Found</p>
            </div>
        );
    }

    const originalHeaders = Object.keys(pincodes[0]);

    const displayHeaders = originalHeaders.map((header, index) =>
        index === 0 ? "Pincode" : header
    );

    return (
        <div className="pincode-container">
            <div className="header-section">
                <h2>Pincode Serviceability</h2>
            </div>

            <div className="table-wrapper">
                <table className="pincode-table">
                    <thead>
                        <tr>
                            {displayHeaders.map((header, index) => (
                                <th key={index}>{header}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {pincodes.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {originalHeaders.map((header, index) => (
                                    <td key={index}>{row[header] || "N/A"}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="vendor-pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                >
                    Prev
                </button>

                <span>
                    Page {page} / {totalPages}
                </span>

                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}