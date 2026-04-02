"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import "./package-items-popup.css";
import {
  ADD_DISH_TO_PACKAGE,
  BASE_URL,
  GET_DISHES_FOR_PACKAGE,
  REMOVE_DISH_FROM_PACKAGE,
} from "@/utils/apiconstant";

const AddDishToPackagePopup = ({ isOpen, onClose, packageData }) => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [dishType, setDishType] = useState("");
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && packageData) {
      const existingDishIds = packageData.packageItems?.map((d) => d._id) || [];

      setSelectedDishes(existingDishIds);
    }
  }, [isOpen, packageData]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}${GET_DISHES_FOR_PACKAGE}`);

      setDishes(response.data.data);
      setFilteredDishes(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let temp = [...dishes];

    if (searchName) {
      temp = temp.filter((d) =>
        d.name.toLowerCase().includes(searchName.toLowerCase()),
      );
    }

    if (dishType) {
      temp = temp.filter((d) => String(d.is_dish) === dishType);
    }

    setFilteredDishes(temp);
  }, [searchName, dishType, dishes]);

  const sortedDishes = [...filteredDishes].sort((a, b) => {
    const aSelected = selectedDishes.includes(a._id);
    const bSelected = selectedDishes.includes(b._id);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;

    return 0;
  });

  const isDishSelected = (dishId) => {
    return selectedDishes.includes(dishId);
  };

  const addDishToPackage = async (dishId) => {
    try {
      let resp = await axios.post(`${BASE_URL}${ADD_DISH_TO_PACKAGE}`, {
        packageId: packageData._id,
        dishIds: [dishId],
      });

      if (resp.status !== 200) {
        alert("Error adding dish to package");
        return;
      }
      if (resp.status === 200) {
        setSelectedDishes((prev) => [...prev, dishId]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeDishFromPackage = async (dishId) => {
    try {
      let resp = await axios.post(`${BASE_URL}${REMOVE_DISH_FROM_PACKAGE}`, {
        packageId: packageData._id,
        dishId: dishId,
      });

      if (resp.status !== 200) {
        alert("Error removing dish from package");
        return;
      }
      if (resp.status === 200) {
        setSelectedDishes((prev) => prev.filter((id) => id !== dishId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleDish = (dishId) => {
    if (isDishSelected(dishId)) {
      removeDishFromPackage(dishId);
    } else {
      addDishToPackage(dishId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2>Add Dish TO : {packageData?.name}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Filters */}

        <div className="filters">
          <input
            type="text"
            placeholder="Search Dish..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{
              padding: "10px 10px",
              minWidth: "200px",
            }}
          />

          <select
            value={dishType}
            onChange={(e) => setDishType(e.target.value)}
          >
            <option value="">All</option>
            <option value="1">Veg</option>
            <option value="2">Non Veg</option>
          </select>
        </div>

        {/* Table */}

        <div className="table-scroll">
          <table className="dish-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Veg/Non</th>
                <th>Cuisine</th>
                <th>Meal</th>
                <th>Cooking</th>
                <th>Prep</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && <tr>Loading...</tr>}

              {sortedDishes.length > 0
                ? sortedDishes.map((dish) => (
                    <tr key={dish._id}>
                      <td>
                        <Image
                          src={`https://horaservices.com/api/uploads/${dish.image}`}
                          width={40}
                          height={40}
                          alt={dish.name}
                        />
                      </td>

                      <td>{dish.name}</td>

                      <td>{dish.is_dish === 1 ? "Veg" : "Non-Veg"}</td>

                      <td>
                        {dish.cuisineId?.map((c) => c.name).join(", ") || "N/A"}
                      </td>

                      <td>
                        {dish.mealId?.map((m) => m.name).join(", ") || "N/A"}
                      </td>

                      <td>{dish.cooking_min}</td>

                      <td>{dish.preparation_min}</td>
                      <td>
                        <button
                          onClick={() => handleToggleDish(dish._id)}
                          className={
                            selectedDishes.includes(dish._id)
                              ? "remove-to-pkg-btn"
                              : "add-to-pkg-btn"
                          }
                        >
                          {selectedDishes.includes(dish._id) ? "Remove" : "Add"}
                        </button>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="7">No dishes found</td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddDishToPackagePopup;
