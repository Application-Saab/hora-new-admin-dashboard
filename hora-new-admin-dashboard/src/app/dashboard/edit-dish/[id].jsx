import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Next.js routing

const EditDish = () => {
  const router = useRouter();
  const { id } = router.query; // Get _id from the URL
  const [dishData, setDishData] = useState({ name: '' }); // Store dish data

  // Fetch the dish info
  useEffect(() => {
    console.log('useEffect triggered with id:', id);
  
    if (id) {
      console.log('Fetching dish details for id:', id);
  
      fetch(`https://horaservices.com:3000/api/dish/details/${id}`)
        .then(res => {
          console.log('Fetch response received:', res);
          return res.json();
        })
        .then(data => {
          console.log('Parsed JSON data:', data);
          setDishData(data);
        })
        .catch(err => {
          console.error('Failed to fetch dish:', err);
        });
    } else {
      console.log('No ID provided, fetch skipped.');
    }
  }, [id]);
  

  const handleChange = (e) => {
    setDishData({ ...dishData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can call PUT API here to update
    console.log("Updated dish:", dishData);
  };

  return (
    <div>
      <h2>Edit Dish</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input 
          type="text"
          name="name"
          value={dishData.name}
          onChange={handleChange}
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditDish;
