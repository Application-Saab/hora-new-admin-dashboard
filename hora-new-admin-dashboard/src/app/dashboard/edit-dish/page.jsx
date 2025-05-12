'use client';

import { useEffect, useState } from 'react';
import DishManagementForm from './DishManagementForm'; // Adjust the import path as needed

export default function EditDishPage() {
  const [dishId, setDishId] = useState(null);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('editDish');
    if (storedId) {
      console.log('Dish ID from localStorage:', storedId);
      setDishId(storedId);

      // Fetch dish details from API
      fetch(`https://horaservices.com:3000/api/dish/details/${storedId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Dish data from API:', data);
          setApiData(data.data); // Assuming the data is nested under 'data'
        })
        .catch((err) => console.error('API error:', err));
    }
  }, []);

  if (!dishId) return <p>Loading dish ID...</p>;
  if (!apiData) return <p>Loading dish data from API...</p>;

  return (
    <div>
      <h1>Edit Dish</h1>
      <p>ID: {dishId}</p>
      <DishManagementForm initialData={apiData} dishId={dishId}/>
    </div>
  );
}
