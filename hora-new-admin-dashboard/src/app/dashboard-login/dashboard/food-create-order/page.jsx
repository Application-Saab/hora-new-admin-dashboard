
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import "../decoration-createorder/createorder.css";
import axios from "axios";
import {
	BASE_URL,
	API_SUCCESS_CODE,
	GET_MEAL_DISH_ENDPOINT,
} from "../../../utils/apiconstant"
import checkImage from '../../../assets/check.png';
import CreateFoodOrderForm from "../../component/CreateFoodOrderForm"

function AddFoodOrder() {
	const [loading, setLoading] = useState(false);
	const [selectedDeliveryOption, setSelectedDeliveryOption] = useState("");
	const [peopleCount, setPeopleCount] = useState(10);
	const [mealList, setMealList] = useState([]);
	const [filteredDishes, setFilteredDishes] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [foodListDownDropOpen, setFoodListDownDropOpen] = useState(false); //name changed from popupOpen
	const [selectedDishes, setSelectedDishes] = useState([]);

	const [includeDisposable, setIncludeDisposable] = useState(false);
	const [includeTables, setIncludeTables] = useState(false);
	const [itemDataId, setItemDataId] = useState({ items: [] });
	const deliveryCharges = 350;
	const packingCost = 200;
	
	const handleChange = (event) => {
		setSelectedDeliveryOption(event.target.value);
	};
	// Dynamically update `peopleCount` based on `selectedOption`
	useEffect(() => {
		if (  selectedDeliveryOption   === "live-catering") {
			setPeopleCount(20);
		} else {
			setPeopleCount(10);
		}
	}, [selectedDeliveryOption]);
	const handlePeopleChange = (e) => {
		const minNum = selectedDeliveryOption === "live-catering" ? 20 : 10;

		const value = Math.max(minNum, Number(e.target.value)); // Use minNum dynamically
		setPeopleCount(value);
	};

	const fetchMealBasedOnCuisine = async () => {
		try {
			setLoading(true);
			const url = BASE_URL + GET_MEAL_DISH_ENDPOINT;

			const requestData = {
				cuisineId: ["65f1b256aaba27208a89865f"],
				is_dish: 2,
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
			console.error("Error Fetching Data:", error.message);
		} finally {
			setLoading(false);
		}
	};
	const handleClickOutside = (e) => {
		if (
			!e.target.closest("#searchPopup") &&
			!e.target.closest("#searchInput")
		) {
			setFoodListDownDropOpen(false);
		}
	};
	useEffect(() => {
		fetchMealBasedOnCuisine();
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const handleSearchChange = (e) => {
		const query = e.target.value.toLowerCase();
		setSearchQuery(query);

		const filtered = mealList.filter(
			(dish) => dish.name && dish.name.toLowerCase().includes(query)
		);

		setFilteredDishes(filtered);
		console.log(mealList)
	};

	const handleDishSelect = (dish) => {
		setSelectedDishes((prevSelected) => {
		  const exists = prevSelected.some((item) => item.name === dish.name);
		  return exists
			? prevSelected.filter((item) => item.name !== dish.name)
			: [...prevSelected, dish];
		});
	  };




	  
	  useEffect(() => {
		const updatedQuantities = selectedDishes.map((dish) => {
			let categoryId = "63edc4757e1b370928b149b3"; // Default ID
			if (dish.category === "main_course") {
				categoryId = "63f1b6b7ed240f7a09f7e2de";
			} else if (dish.category === "appetizer") {
				categoryId = "63f1b39a4082ee76673a0a9f";
			}

			return {
				name: dish.name,
				image: dish.image || "default-image.png",
				price: dish.cuisineArray[0],
				quantity: dish.cuisineArray[1],
				unit: dish.cuisineArray[2],
				id: categoryId, // Store the id directly
				_id: dish._id
			};
		});

		// Prepare the requestData object
		const newRequestData = updatedQuantities.map((item) => item.id);

		console.log(newRequestData, "newrequestdata");
		// setSelectedDishQuantities(updatedQuantities);
		setItemDataId(newRequestData); // Store requestData in state

		console.log(newRequestData, "requestData");
	}, [selectedDishes]);
	
	const selectedMealList = selectedDishes
        ? Object.values(selectedDishes).map(dish => {
            return {
                name: dish.name,
                image: dish.image,
                price: Number(dish.cuisineArray[0]),
                id: dish._id,
                mealId: dish.mealId,
				quantity: Number(dish.cuisineArray[1]),
				unit: dish.cuisineArray[2],
				_id: dish._id
            };
        }): [];

		console.log('selected' , selectedMealList);

		const dishObject = selectedMealList.filter(x =>
			x.name !== "Tawa Rotis" &&
			x.name !== "Rumali Rotis"
		)
			  
			  
		const dishCount = dishObject.filter(x => x.mealId == "63f1b6b7ed240f7a09f7e2de" || x.mealId == "63f1b39a4082ee76673a0a9f" || x.mealId == "63edc4757e1b370928b149b3").length;
	
		console.log(dishCount)

		function calculateDiscountPercentage(peopleCount) {
			console.log(peopleCount)
			if (peopleCount <= 39){
			  return 1
			}
			else if (peopleCount >= 40 && peopleCount <= 59){
			  return 0.93
			}
			else if (peopleCount >= 60){
			  return 0.9
			}
		  }

		  function calculateDiscountPercentageQuantity(dishCount){
			if (dishCount == 4)
			  return 1.15
			else if (dishCount == 5)
			  return 1
			else if (dishCount == 6 || dishCount == 7)
			  return 0.85
			else if (dishCount == 8)
			  return 0.75
			else if (dishCount == 9 || dishCount == 10)
			  return 0.65
			else if (dishCount == 11)
			  return 0.6
			else if (dishCount == 12 || dishCount == 13)
			  return 0.5
			else if (dishCount == 14)
			  return 0.47
			else if (dishCount == 15)
			  return 0.45
			else 
			  return 1
		  }


		  const validMealIds = [
			"63f1b6b7ed240f7a09f7e2de",
			"63f1b39a4082ee76673a0a9f",
			"63edc4757e1b370928b149b3"
		  ];
	  
	  
	  
	  
		  console.log(selectedMealList)
		  
		  
		  const discountPercentagePrice = calculateDiscountPercentage(peopleCount);
		  
		  const discountPercentageQuantity = calculateDiscountPercentageQuantity(dishCount)
		  
	  

		  var newTotalPrice = 0
		  var totalPrice = 0
		  selectedMealList.forEach((dish) => {
			console.log(dish)
			if (
			  dish.name !== "Tawa Rotis" &&
			  dish.name !== "Rumali Rotis" &&
			  dish.mealId.some((id) => validMealIds.includes(id))
			) {
			  
			   newTotalPrice += dish.price * peopleCount * discountPercentageQuantity
			}
			else {
			  newTotalPrice += dish.price * peopleCount
			}
			totalPrice = totalPrice + dish.price * peopleCount
		  });
	  
		  console.log(newTotalPrice)
		  console.log(totalPrice)
		  newTotalPrice = newTotalPrice * discountPercentagePrice
	  
		  console.log(newTotalPrice)
		  console.log(totalPrice)
		  var discountedPrice = selectedDeliveryOption === 'live-catering' ?  ((newTotalPrice) * 1.1 + 6500).toFixed(0) : newTotalPrice.toFixed(0);
		  totalPrice = selectedDeliveryOption === 'live-catering' ?  ((totalPrice) * 1.1 + 6500).toFixed(0) : totalPrice.toFixed(0);
		  console.log(discountedPrice)
		  console.log(totalPrice)
		  const calculateFinalTotal = () => {
			  let finalTotal = 0; // Initialize finalTotal with 0
		  
			  // Check for the selected delivery option
			  if (selectedDeliveryOption === 'food-delivery') {
				  {
				  finalTotal = parseFloat(discountedPrice) > 4000
				  ? parseFloat(discountedPrice) + deliveryCharges
				  : parseFloat(discountedPrice) + deliveryCharges;
	  
				  }
	  
				  //finalTotal = totalPrice - parseFloat(discountedPrice) + deliveryCharges;
				  console.log("Initial total after applying discount and delivery charges: " + finalTotal);
				  
				  finalTotal += parseFloat(packingCost);
				  console.log("Total after adding packing cost: " + finalTotal);
		  
				  if (includeDisposable) {
					  finalTotal += parseFloat((20 * peopleCount).toFixed(0)); // Convert to float to add
					  console.log("Total after adding disposable cost: " + finalTotal);
				  }
			  } else if (selectedDeliveryOption === 'live-catering') {
				  finalTotal = parseFloat(discountedPrice) > 4000
				  ? parseFloat(discountedPrice)
				  : parseFloat(discountedPrice) + deliveryCharges;
			  
				  console.log("Initial total after applying discount: " + finalTotal);
		  
				  if (includeTables) {
					  finalTotal += 1200;
					  console.log("Total after adding table cost: " + finalTotal);
				  }
			  }
		  
			  // Ensure finalTotal is a number and rounded to the nearest whole number
			  finalTotal = parseFloat(finalTotal.toFixed(0));
			  console.log("Final total after adjustments: " + finalTotal);
		  
			  return finalTotal;
		  };
		  
	  
		  // Function to calculate the advance payment
		  const calculateAdvancePayment = () => {
			  return Math.round(calculateFinalTotal() * 0.65);
		  };
	  
		  // useEffect(() => {
		  //     Object.values(selectedDishData).map((item) => cat.push(item.cuisineId[0]));
		  // }, []);
	  
		  const RenderDishQuantity = ({ item }) => {
	  
	  
			console.log(item)
			  var dishObject = selectedMealList.filter(x =>
				  x.name !== "Tawa Rotis" &&
				  x.name !== "Rumali Rotis"
			  )
	  
			  
			  const itemCount = dishObject.filter(meal => meal.mealId[0] === "63f1b6b7ed240f7a09f7e2de" || meal.mealId[0] === "63f1b39a4082ee76673a0a9f" || meal.mealId[0] === "63edc4757e1b370928b149b3").length
			//   const mainCourseItemCount = dishObject.filter(meal => meal.id[0] === "63f1b6b7ed240f7a09f7e2de").length
			//   const appetizerItemCount = dishObject.filter(meal => meal.id[0] === "63f1b39a4082ee76673a0a9f").length
			//   const breadItemCount = dishObject.filter(meal => meal.id[0] === "63edc4757e1b370928b149b3").length
			  
			  
			  let quantity = item.quantity * peopleCount;
	  
			  
			  if (item.name !== "Tawa Rotis" && item.name !== "Rumali Rotis" && (item.mealId[0] == "63f1b6b7ed240f7a09f7e2de"  || item.mealId[0] == "63f1b39a4082ee76673a0a9f" || item.mealId[0] == "63edc4757e1b370928b149b3")) {
				
				
				if (itemCount == 4) {
					  quantity = quantity * (1 + 0.15)
				  }
				  else if (itemCount == 6) {
					  quantity = quantity * (1 - 0.15)
				  }
				  else if (itemCount == 7) {
					  quantity = quantity * (1 - 0.15)
				  }
				  else if (itemCount == 8) {
					  quantity = quantity * (1 - 0.25)
				  }
				  else if (itemCount == 9) {
					  quantity = quantity * (1 - 0.35)
				  }
				  else if (itemCount == 10) {
					  quantity = quantity * (1 - 0.35)
				  }
				  else if (itemCount == 11) {
					  quantity = quantity * (1 - 0.40)
				  }
				  else if (itemCount == 12 || itemCount == 13) {
					  quantity = quantity * (1 - 0.50)
				  } else if (itemCount == 14) {
					  quantity = quantity * (1 - 0.53)
				  } else if (itemCount == 15) {
					  quantity = quantity * (1 - 0.55)
				  }
			  }
			  quantity = Math.round(quantity)

			  if (selectedDeliveryOption === "live-catering"){
				quantity = quantity * 1.1
			  }
			  let unit = item.unit;
			  if (quantity >= 1000) {
				  quantity = quantity / 1000;
				  if (unit === 'Gram') {
					unit = 'KG';
				  } else if (unit === 'ml') {
					unit = 'L';
				  }
				  else if (unit === 'Peices') {
					unit = 'PCS';
				  }
				}
			
			  return (
				  <div className='ordersummaryproduct'>
					  <div className='ordersummary-sec1'>
						  <Image
							  src={`https://horaservices.com/api/uploads/${item.image}`}
							  alt={item.name}
							  className='checkoutRightImg chef'
							  width={100} height={100}
						  />
					  </div>
					  <div style={{ color: "rgb(146, 82, 170)", fontWeight: "600" }} className='ordersummary-sec2'>
						  <p className='ordersummeryname'>{item.name}</p>
						  {
				  
				  <div style={{ fontSize: "90%", fontWeight: '700', color: '#9252AA' , textTransform:"uppercase"}} className='ingredientrightsecsibheading'>{parseFloat(quantity).toFixed(2) + ' ' + unit}</div>
				  
				}
					  </div>
				  </div>
			  );
		  };
	  

	

	return (<>
		<div className="container">
		<h1 className="createOrder pageHeading">Create Food Order</h1>
			<div className="selectServiceType" style={style.selectServiceType}>
				<div style={style.selectDiv}>
					<label htmlFor="peopleInput" className="people-label" style={style.label}>
						Select Category:
					</label>
					<select
						value={selectedDeliveryOption }
						onChange={handleChange}
						style={style.selectDropDown}
					>
						<option value="" disabled>
							Select
						</option>
						<option value="food-delivery">Food Delivery</option>
						<option value="live-catering">Live Catering</option>
					</select>
				</div>
				<div className="people-input-container" style={style.noOfPeople}>
					<label htmlFor="peopleInput" className="people-label" style={style.label}>
						Number of People:
					</label>
					<div className="input-wrapper" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						{/* <button
							type="button"
							className="btn decrement-btn"
							onClick={() =>
								handlePeopleChange({ target: { value: peopleCount - 1 } })
							}
							disabled={peopleCount <= 10}
							style={style.PlusMinusBtn}
						>
							-
						</button> */}
						<input
							id="peopleInput"
							type="number"
							value={peopleCount}
							onChange={handlePeopleChange}
							min={selectedDeliveryOption === "live-catering" ? 20 : 10}
							className="people-input"
							style={style.noOfPeopleValue}
						/>
						{/* <button
							type="button"
							className="btn increment-btn"
							onClick={() =>
								handlePeopleChange({ target: { value: peopleCount + 1 } })
							}
							style={style.PlusMinusBtn}
						>
							+
						</button> */}
						
					</div>
					{/* Range Slider by aarti   */}
					<input
							type="range"
							min={selectedDeliveryOption === "live-catering" ? 20 : 10}
							max="100" // Adjust max limit as needed
							value={peopleCount}
							onChange={(e) => handlePeopleChange(e, 'range')}
							step={1} // Smoother increments
							className="people-range"
							style={{ width: "100%", marginTop: "10px", accentColor: "#007bff", cursor: "pointer" }}
						/>
				</div>
			</div>
			<div style={style.selectionMsg}>
				{selectedDeliveryOption === "" ? (
					<p>Please select a service to continue.</p>
				) : selectedDeliveryOption === "food-delivery" ? (
					<p>
						You have selected <strong>Food Delivery</strong>.
					</p>
				) : (
					<p>
						You have selected <strong>Live Catering</strong>.
					</p>
				)}
			</div>

			<div className="search-bar-container" style={style.searchBarDiv}>
				<input
					id="searchInput"
					type="text"
					value={searchQuery}
					onChange={handleSearchChange}
					placeholder="Search by dish name"
					onClick={() => setFoodListDownDropOpen(true)}
					className="search-input"
				/>
				{foodListDownDropOpen && (
					<>
						{loading ? (
							<p className="loading-text">Loading...</p>
						) : (
							<div
								id="searchPopup"
								className="popup-container"
								onClick={(e) => e.stopPropagation()} // Prevent click from closing popup
								style={style.mealListPopup}
							>
								<ul className="popup-dishes-list" style={style.popupDishesList}>
									{filteredDishes.length > 0 ? (
										filteredDishes.map((dish) => {
											const price = dish.cuisineArray[0];
											const quantity = dish.per_plate_qty.qty;
											const unit = dish.per_plate_qty.unit;

											return (
												// by aarti onClick={() => handleDishSelect(dish)} // Clicking anywhere on the <li> selects the dish
												<li
													key={dish._id}
													className="popup-dish-item"
													style={style.foodListinPopup}
													onClick={() => handleDishSelect(dish)} // Clicking anywhere on the <li> selects the dish
												>
													<div className="dishImgname" style={style.dishImgname}>
														<Image
															src={`https://horaservices.com/api/uploads/${dish.image}`}
															alt={dish.name}
															className="bottom-sheet-image"
															width={30}
															height={30}
														/>
														<span>{dish.name}</span>
													</div>
													<span>₹ {price}</span>
													<span>
														{quantity} {unit} per plate
													</span>
													<input
														type="checkbox"
														checked={selectedDishes.some((item) => item.name === dish.name)}
														onChange={() => handleDishSelect(dish)}
														className="dish-checkbox"
														onClick={(e) => e.stopPropagation()} // Prevents <li> click event from firing twice
													/>
												</li>

											);
										})
									) : (
										<div className="no-dishes">No dishes found</div>
									)}
								</ul>
							</div>
						)}
					</>
				)}
			</div>
			{selectedMealList.length > 0 &&
				<div style={style.dishSelectedContainer}>
					<div style={style.header}>
						<p style={style.headerText}>Dishes selected</p>
					</div>

					<div style={style.selectedItemsContainer}>
						{selectedMealList.map((item, index) => (
							<RenderDishQuantity key={index} item={item} />
						))}
					</div>
				</div>
			}

			<div className="details">
			<div style={{ display: "flex", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ marginHorizontal: 16, flexDirection: 'column', width: 120, borderRadius: 6, border: "1px solid #E6E6E6", padding: 5 }}>
                                        <p style={{ color: '#A3A3A3', fontSize: 9, fontWeight: '400', margin: 0 }}>Total Dishes</p>
                                        <p style={{ color: '#9252AA', fontSize: 13, fontWeight: '600', margin: 0 }}>{selectedDishes.length}</p>
                                    </div>
                                    <div style={{ marginHorizontal: 16, flexDirection: 'column', width: 120, borderRadius: 6, border: "1px solid #E6E6E6", padding: 5 }}>
                                        <p style={{ color: '#A3A3A3', fontSize: 9, fontWeight: '400', margin: 0 }}>No. of People</p>
                                        <p style={{ color: '#9252AA', fontSize: 13, fontWeight: '600', margin: 0 }}>{peopleCount}</p>
                                    </div>
                                </div>
								<div style={{ paddingTop: "5px" }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3  }}>
                                        <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>Item Total</p>
                                        <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>₹ {(totalPrice - discountedPrice) < 0 ? discountedPrice : totalPrice}</p>
                                    </div>
                                    {/* <img style={{ width: 290, height: 1, marginTop: 5, marginBottom: 5 }} src="../../assets/Rectangleline.png" alt="line" /> */}
                                    {totalPrice - discountedPrice> 0 && (
                                        <div>
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, alignItems: "center"  , borderBottom:"1px solid rgb(215, 215, 215)" }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: "center", flexDirection: 'row' }}>
                                                    <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>Item Discount:</p>
                                                </div>
                                                <p style={{ color: "#008631", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>
                                                    {'-'} ₹ {totalPrice - discountedPrice}
                                                </p>
                                            </div>
                                            {/* <img style={{ width: 290, height: 1, marginTop: 5, marginBottom: 5 }} src="../../assets/Rectangleline.png" alt="line" /> */}
                                        </div>
                                    )}
                                    {selectedDeliveryOption === 'food-delivery' && (
                                        <div>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: includeDisposable ? '#efefef' : '#fff', padding: "4px", margin: "0px 0 17px 0"  , borderBottom:"1px solid rgb(215, 215, 215)"  , borderTop:"1px solid rgb(215, 215, 215)"}}>
                                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <button onClick={() => setIncludeDisposable(!includeDisposable)} style={{ background: 'none', border: 'none', padding: 0 }}>
                                                        <div style={{ width: 19, height: 19, borderWidth: 1, border: includeDisposable ? '1px solid #008631' : '1px solid #008631', borderRadius: 3, alignItems: 'center', justifyContent: 'center', marginRight: 4, display: 'flex' }}>
                                                            {includeDisposable && <Image src={checkImage} alt="Info" width={13} height={13} />}
                                                        </div>
                                                    </button>
                                                    <div>
                                                        <p style={{ color: '#9252AA', fontWeight: '600', fontSize: 13, lineHeight: '20px', marginBottom: 0 }}>Disposable plates + water bottle:₹ 20/Person</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p style={{ color: '#9252AA', fontWeight: '600', fontSize: 14, marginBottom: 0 }}>₹ {includeDisposable ? 20 * peopleCount : 0}</p>
                                                </div>
                                            </div>
                                            {/* <img style={{ width: 290, height: 1, marginTop: 10, marginBottom: 5 }} src="../../assets/Rectangleline.png" alt="line" /> */}
                                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                                                <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>Packing Cost</p>
                                                <div style={{ display: 'flex', color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>
                                                    <p style={{ color: "#9252AA", fontWeight: '600' }}> ₹ {packingCost}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3  , borderBottom:"1px solid rgb(215, 215, 215)" }}>
                                                    <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>Delivery Charges</p>
                                                    <div style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px', display: 'flex', flexDirection: "row" }}>
                                                        {/* {discountedPrice > 4000 ? (
                                                            <>
                                                                <p style={{ color: "#008631", fontWeight: '600', marginRight: 5 }}>FREE</p>
                                                                <p style={{ textDecoration: "line-through", color: "#9252AA", fontWeight: '600' }}>₹ {deliveryCharges}</p>
                                                            </>
                                                        ) :
                                                         ( */}
                                                            <p style={{ color: "#9252AA", fontWeight: '600' }}>₹ {deliveryCharges}</p>
                                                        {/* )} */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedDeliveryOption === 'live-catering' && (
                                        <div>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: includeTables ? '#efefef' : '#fff', paddingHorizontal: 5, paddingVertical: 4, marginTop: 4   , borderBottom:"1px solid rgb(215, 215, 215)"}}>
                                                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <button onClick={() => setIncludeTables(!includeTables)} style={{ background: 'none', border: 'none', padding: 0 }}>
                                                        <div style={{ width: 19, height: 19, borderWidth: 1,borderStyle:'solid' ,borderColor: includeTables ? '#008631' : '#008631', borderRadius: 3, alignItems: 'center', justifyContent: 'center', marginRight: 4, display: 'flex' }}>
                                                            {includeDisposable && <Image src={checkImage} alt="Info" height={13} width={13} />}
                                                        </div>
                                                    </button>
                                                    <div>
                                                        <p style={{ color: '#9252AA', fontWeight: '600', fontSize: 13, lineHeight: '20px' }}>3-4 Serving Tables with Cloth:</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p style={{ color: '#9252AA', fontWeight: '600', fontSize: 14 }}>₹ {includeTables ? 1200 : 0}</p>
                                                </div>
                                            </div>
                                            {/* <img style={{ width: 290, height: 1, marginTop: 10, marginBottom: 5 }} src="../../assets/Rectangleline.png" alt="line" /> */}
                                        </div>
                                    )}
                                    {/* Calculation for final total amount */}
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3  }}>
                                        <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>Final Amount</p>
                                        <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>₹ {calculateFinalTotal()}</p>
                                    </div>

                                    {/* Calculation for advance payment */}
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                                        <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>Advance Payment</p>
                                        <p style={{ color: "#9252AA", fontWeight: '600', fontSize: 14, lineHeight: '20px' }}>₹ {calculateAdvancePayment()}</p>
                                    </div>
                                </div>
			</div>
			
			<CreateFoodOrderForm itemDataId={itemDataId} selectedMealList={selectedMealList} deliveryCharges={deliveryCharges} totalPrice={totalPrice} discountedPrice={discountedPrice} calculateFinalTotal={calculateFinalTotal} calculateAdvancePayment={calculateAdvancePayment} peopleCount={peopleCount} selectedOption={selectedDeliveryOption}  includeTables={includeTables} includeDisposable={includeDisposable}/>

		</div>
	</>);
}

const style = {
	selectDiv: {
		display: "inline-flex", flexDirection: "column", alignItems: "center",
		marginTop: "22px",  width: "50%",
	},
	selectServiceType: {
		display: "flex",
		 alignItems: "center",
		 flexDirection: "row", // Conditional direction
	},
	selectDropDown: {

		padding: "12px 20px",
		fontSize: "16px",
		borderRadius: "8px",
		border: "1px solid #ccc",
		boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
		width: "200px",
		marginBottom: "15px",

	},
	label: {
		fontSize: "16px",
	},
	noOfPeople: {
		display: "inline-flex", flexDirection: "column", alignItems: "center", width:"50%",
	},
	PlusMinusBtn: {
		padding: "8px 12px",
		fontSize: "16px",
		borderRadius: "50%",
		backgroundColor: "#f0f0f0",
		border: "1px solid #ccc",
		cursor: "pointer",
		transition: "background-color 0.3s ease",
	},
	noOfPeopleValue: {
		padding: "10px 20px",
		fontSize: "16px",
		width: "80px",
		textAlign: "center",
		borderRadius: "8px",
		border: "1px solid #ccc",
		boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
	},
	selectionMsg: {
		marginTop: "20px", fontSize: "18px", color: "#555"
	},
	foodListinPopup: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "10px",
	},
	dishImgname: {
		width: "56%",
		alignItems: " center",
		display: "flex",
		gap: "6px",
	},
	popupDishesList: {
		height: "300px",
		overflowY: "scroll",
		listStyle: "none",
		paddingLeft: 0,
	},
	searchBarDiv: {
		position: "relative",
		marginBottom: "12px"
	},
	mealListPopup: {
		position: "absolute",
		background: "white",
		width: "100%",
		left: "0",
		top: "100%",
	},
	priceBreakdown: {
		border: "1px solid black",
		padding: "4px"
	},
	header: {
		marginHorizontal: 16,
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 5,
	},
	headerText: {
		padding: 4,
		color: "#000",
		fontSize: 13,
		fontWeight: "700",
		marginBottom: 0,
	},
	selectedItemsContainer: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		width: "100%",
		gap: "10px",
	},

	dishSelectedContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		margin: "20px 0",
		border: "1px solid black",
	},
	ordereditemCard: {
		boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
	},
	priceBreakdown: {
		border: "1px solid black",
		padding: "10px"
	}



}


export default AddFoodOrder;