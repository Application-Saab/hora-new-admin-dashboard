"use client";
import React, { useEffect, useState } from "react";
import "./App.css";

export default function App({ startDate, endDate, selectedCity, selectedKey }) {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
  const city = "Hyderabad";
  const startDate = "2025-04-27";
  const endDate = "2025-04-30";

  const url = `https://script.google.com/macros/s/AKfycbw-cjT3C4o3qIBA5zA8u4Nb3gWb_sZtU08f6lfVwYeLzqk7WA80Idd79RM9CUytgVsS/exec?city=${city}&startDate=${startDate}&endDate=${endDate}`;

  const response = await fetch(url);
  
  console.log(response, "response");
  const result = await response.json();
  console.log(result, "result");
};


// https://script.google.com/macros/s/AKfycbwLg9Qvs6Y5oDRrs1b1yJYNkmaKmMRBmQnrZyzK_kUhJzs7rIfzBDmuaQEgpL_-R-0x/exec


  // Custom mapping for selectedKey to categories
  const categoryMapping = {
    1: ["Decoration"],
    2: ["Chef for Party"],
    6: ["Live Catering/Bulk Food Delivery"],
    7: ["Live Catering/Bulk Food Delivery"], 
    8: ["Photography"]
  };

  const SHEET_URL =
    "https://script.google.com/macros/s/AKfycbzULNMYcaIH6l819x3ERAQRNDHuHfwfNtdhfOxteSXOJty3GzsFz27Yma6C6754gLG8/exec";

  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        console.log("Unique categories in data:", [...new Set(data.map((item) => item.category))]);
        setData(data);
        
        // Auto-filter based on props
        applyFilters(data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // Auto-filter when props change
  useEffect(() => {
    applyFilters(data);
  }, [selectedKey, selectedCity, startDate, endDate, data]);

  const applyFilters = (dataToFilter = data) => {
    const filteredData = dataToFilter.filter((item) => {
      const matchCity = selectedCity ? item.city === selectedCity : true;
      
      // Handle category filtering based on selectedKey
      let matchCategory = true;
      if (selectedKey && categoryMapping[selectedKey]) {
        const targetCategories = categoryMapping[selectedKey];
        console.log("selectedKey:", selectedKey, "targetCategories:", targetCategories, "item.category:", item.category);
        matchCategory = targetCategories.includes(item.category);
      }

      const itemDate = new Date(item.day);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;

      const matchDate = (!from || itemDate >= from) && (!to || itemDate <= to);

      return matchCity && matchCategory && matchDate;
    });

    console.log("Filtered results:", filteredData.length, "items");
    setFiltered(filteredData);
    setCurrentPage(1); // Reset to first page on filter
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIdx, startIdx + itemsPerPage);


  return (
    <div className="container">
      <button onClick={fetchData}>sohan</button>
      <div className="box">
        {/* <h1 className="title">📊 Campaign Report</h1> */}

        {paginatedData.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {/* <th>City</th> */}
                    {/* <th>Category</th> */}
                    <th>Campaign</th>
                    <th>Cost</th>
                    {/* <th>Date</th> */}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, i) => (
                    <tr key={i}>
                      {/* <td>{row.city}</td> */}
                      {/* <td>{row.category}</td> */}
                      <td>{row.campaign}</td>
                      <td>₹{parseFloat(row.cost).toFixed(2)}</td>
                      {/* <td>{row.day}</td> */}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    {/* <td>
                      {[...new Set(filtered.map((row) => row.city))].length}{" "}
                      Cities
                    </td> */}
                    {/* <td>
                      {[...new Set(filtered.map((row) => row.category))].length}{" "}
                      Categories
                    </td> */}
                    <td>{filtered.length} Campaigns</td>
                    <td>
                      ₹
                      {filtered
                        .reduce(
                          (sum, row) => sum + parseFloat(row.cost || 0),
                          0
                        )
                        .toFixed(2)}
                    </td>
                    {/* <td>Total</td> */}
                  </tr>
                  <tr>
                    <td colSpan="5" className="pagination-row">
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                        ⬅ Previous
                      </button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                        Next ➡
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <p className="no-data">No results found.</p>
        )}
      </div>
    </div>
  );
}