// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const BASE_URL = "https://horaservices.com:3000";
// const GET_MEAL_DISH_ENDPOINT = "/api/user/getMealDish";
// const API_SUCCESS_CODE = 200;

// const DishSearch = () => {
//   const [mealList, setMealList] = useState([]);
//   const [filteredDishes, setFilteredDishes] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [popupOpen, setPopupOpen] = useState(false);
//   const [selectedDishes, setSelectedDishes] = useState([]);

//   useEffect(() => {
//     fetchDishes();
//   }, []);

//   const fetchDishes = async () => {
//     try {
//       setLoading(true);
//       console.log("Fetching dishes...");
//       const url = BASE_URL + GET_MEAL_DISH_ENDPOINT;

//       const requestData = {
//         cuisineId: ["65f1b256aaba27208a89865f"],
//         is_dish: 0,
//       };

//       const response = await axios.post(url, requestData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       console.log(response, "response data");

//       if (response.status === API_SUCCESS_CODE) {
//         const dishes = response.data.data.flatMap((entry) => entry.dish || []);
//         const totalDishesCount = dishes.length;
//         console.log(`Total number of dishes: ${totalDishesCount}`);
//         setMealList(dishes);
//         setFilteredDishes(dishes);
//       }
      
//     } catch (error) {
//       console.log("Error Fetching Data:", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearchChange = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = mealList.filter(
//       (dish) => dish.name && dish.name.toLowerCase().includes(query)
//     );

//     setFilteredDishes(filtered);
//   };

//   const handleDishSelect = (dish) => {
//     setSelectedDishes((prevSelected) => {
//       const exists = prevSelected.some((item) => item.name === dish.name);
//       if (exists) {
//         return prevSelected.filter((item) => item.name !== dish.name);
//       } else {
//         return [...prevSelected, dish];
//       }
//     });
//   };

//   const handleClickOutside = (e) => {
//     if (e.target.id !== "searchPopup" && e.target.id !== "searchInput") {
//       setPopupOpen(false);
//     }
//   };

//   const closePopup = () => {
//     setPopupOpen(false);
//   };

//   return (
//     <div style={{ marginLeft: "100px" }} onClick={handleClickOutside}>
//       <h1>Search for Dishes</h1>

//       {/* Search Bar with Open Popup Button */}
//       <input
//         id="searchInput"
//         type="text"
//         value={searchQuery}
//         onChange={handleSearchChange}
//         placeholder="Search by dish name"
//         style={{ marginBottom: "10px", padding: "8px" }}
//         onClick={() => setPopupOpen(true)}
//       />

//       {/* Display selected items below the search input */}
//       <div>
//   {selectedDishes.length > 0 && <h3>Selected Dishes:</h3>}
//   <ul>
//     {selectedDishes.map((dish, index) => (
//       <li key={index}>
//         {dish.name} - ₹{dish.price}
//       </li>
//     ))}
//   </ul>

//   {/* Display Total Price */}
//   {selectedDishes.length > 0 && (
//     <h4>Total Price: ₹
//       {selectedDishes.reduce((total, dish) => total + Number(dish.price || 0), 0)}
//     </h4>
//   )}
// </div>

//       {/* Loading Indicator */}
//       {loading && <p>Loading...</p>}

//       {/* Popup for search */}
//       {popupOpen && (
//         <div
//           id="searchPopup"
//           style={{
//             position: "absolute",
//             top: "135px",
//             left: "350px",
//             right: "20px",
//             backgroundColor: "white",
//             border: "1px solid #ccc",
//             padding: "20px",
//             zIndex: 1000,
//             boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
//             maxWidth: "20%",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Close Button */}
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               closePopup();
//             }}
//             style={{
//               position: "absolute",
//               top: "2px",
//               right: "10px",
//               backgroundColor: "red",
//               color: "white",
//               border: "none",
//               padding: "5px 10px",
//               cursor: "pointer",
//             }}
//           >
//             Close
//           </button>

//           {/* Dropdown list with filtered dishes */}
//           <div style={{ maxHeight: "200px", overflowY: "auto" }}>
//             {filteredDishes.length > 0 ? (
//               filteredDishes.map((dish) => (
//                 <div
//                   key={dish._id}
//                   style={{
//                     padding: "10px",
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     cursor: "pointer",
//                   }}
//                 >
//                   <span>{dish.name}</span>₹{dish.price}
//                   <input
//                     type="checkbox"
//                     checked={selectedDishes.some(
//                       (item) => item.name === dish.name
//                     )}
//                     onChange={() => handleDishSelect(dish)}
//                     onClick={(e) => e.stopPropagation()}
//                   />
//                 </div>
//               ))
//             ) : (
//               <div style={{ padding: "10px" }}>No dishes found</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DishSearch;


"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "https://horaservices.com:3000";
const GET_MEAL_DISH_ENDPOINT = "/api/user/getMealDish";
const API_SUCCESS_CODE = 200;

import Image from 'next/image';

const DishSearch = () => {
  const [mealList, setMealList] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState([]);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const url = BASE_URL + GET_MEAL_DISH_ENDPOINT;

      const requestData = {
        cuisineId: ["65f1b256aaba27208a89865f"],
        is_dish: 0,
      };

      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === API_SUCCESS_CODE) {
        const dishes = response.data.data.flatMap((entry) => entry.dish || []);
        setMealList(dishes);
        setFilteredDishes(dishes);
      }
    } catch (error) {
      console.log("Error Fetching Data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = mealList.filter(
      (dish) => dish.name && dish.name.toLowerCase().includes(query)
    );

    setFilteredDishes(filtered);
  };

  const handleDishSelect = (dish) => {
    setSelectedDishes((prevSelected) => {
      const exists = prevSelected.some((item) => item.name === dish.name);
      if (exists) {
        return prevSelected.filter((item) => item.name !== dish.name);
      } else {
        return [...prevSelected, dish];
      }
    });
  };

  const handleClickOutside = (e) => {
    if (e.target.id !== "searchPopup" && e.target.id !== "searchInput") {
      setPopupOpen(false);
    }
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  return (
    <div className="dish-search-container" onClick={handleClickOutside}>
      <h1 className="search-header">Search for Dishes</h1>

      <div className="search-bar-container">
        <input
          id="searchInput"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by dish name"
          onClick={() => setPopupOpen(true)}
          className="search-input"
        />
      </div>

      <div className="selected-dishes-container">
        {selectedDishes.length > 0 && <h3>Selected Dishes:</h3>}
        <ul className="selected-dishes-list">
          {selectedDishes.map((dish, index) => (
            <li key={index} className="selected-dish-item">
              <span>{dish.name}</span> <span>- ₹{dish.cuisineArray[0]} </span>
            </li>
          ))}
        </ul>

        {selectedDishes.length > 0 && (
          <h4>Total Price: ₹
            {selectedDishes.reduce((total, dish) => total + Number(dish.cuisineArray[0] || 0), 0)}
          </h4>
        )}
      </div>

      {loading && <p className="loading-text">Loading...</p>}

      {popupOpen && (
        <div
          id="searchPopup"
          className="popup-container"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              closePopup();
            }}
          >
          </button>

          <div className="popup-dishes-list">
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <div
                  key={dish._id}
                  className="popup-dish-item"
                >
                     <Image
        src={`https://horaservices.com/api/uploads/${dish.image}`}
        alt={dish.name}
        className="bottom-sheet-image"
        width={30}
        height={30}
      />
                  <span>{dish.name}</span>
                   {/* ₹{dish.price} */}
                  ₹ {dish.cuisineArray[0]}
                  <input
                    type="checkbox"
                    checked={selectedDishes.some(
                      (item) => item.name === dish.name
                    )}
                    onChange={() => handleDishSelect(dish)}
                    onClick={(e) => e.stopPropagation()}
                    className="dish-checkbox"
                  />
                </div>
              ))
            ) : (
              <div className="no-dishes">No dishes found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DishSearch;
