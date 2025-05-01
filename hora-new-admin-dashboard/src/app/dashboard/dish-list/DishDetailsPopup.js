// components/DishPopup.jsx

import React from "react";
import Image from "next/image"; // or
import './DishDetailsPopup.css';

const DishPopup = ({ dish, onClose }) => {
  if (!dish) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content scrollable">
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>Dish Name :   {dish.name}</h2>

        <div className="popup-image">
          <Image
            src={`https://horaservices.com/api/uploads/${dish.image}`}
            alt={dish.name}
            width={150}
            height={150}
          />
        </div>

        <table className="popup-table">
          <tbody>
            <tr><th>Description</th><td>{dish.description || "N/A"}</td></tr>
            <tr><th>Veg/Non-Veg</th><td>{dish.is_dish === 1 ? "Veg" : "Non-Veg"}</td></tr>
            <tr><th>Dish Rate</th><td>{dish.dish_rate || "N/A"}</td></tr>
            <tr><th>Cooking Time</th><td>{dish.cooking_min} mins</td></tr>
            <tr><th>Preparation Time</th><td>{dish.preparation_min} mins</td></tr>
            <tr><th>Preparation Text</th><td>{dish.preperationtext || "N/A"}</td></tr>
            <tr><th>Dish Allowed</th><td>{dish.dish_allow ? "Yes" : "No"}</td></tr>
            <tr><th>Is Gas Used</th><td>{dish.is_gas ? "Yes" : "No"}</td></tr>
            <tr><th>Status</th><td>{dish.status === 1 ? "Active" : "Inactive"}</td></tr>
            <tr><th>Created At</th><td>{new Date(dish.createdAt).toLocaleString()}</td></tr>
            <tr><th>Updated At</th><td>{new Date(dish.updatedAt).toLocaleString()}</td></tr>
            <tr>
              <th>Meal Types</th>
              <td>{dish.mealId?.map((m) => m.name).join(", ") || "N/A"}</td>
            </tr>
            <tr>
              <th>Cuisines</th>
              <td>{dish.cuisineId?.map((c) => c.name).join(", ") || "N/A"}</td>
            </tr>
            <tr>
              <th>Categories</th>
              <td>{dish.catId?.join(", ") || "N/A"}</td>
            </tr>
            <tr>
              <th>Per Plate Qty</th>
              <td>{dish.per_plate_qty?.qty} {dish.per_plate_qty?.unit}</td>
            </tr>
            <tr>
              <th>People Served</th>
              <td>{dish.noofpeopleServedByDish}</td>
            </tr>
            <tr>
              <th>Ingredients</th>
              <td>
                {dish.ingredientUsed?.length > 0 ? (
                  <ul>
                    {dish.ingredientUsed.map((i) => (
                      <li key={i._id}>
                        {i.name} - {i.qty} {i.unit}
                      </li>
                    ))}
                  </ul>
                ) : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DishPopup;
