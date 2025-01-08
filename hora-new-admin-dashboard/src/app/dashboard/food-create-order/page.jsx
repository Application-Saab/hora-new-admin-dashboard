
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

import CreateOrderForm from "../../component/CreateOrderForm"

function AddFoodOrder() {
	const [loading, setLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState("");
	const [numberOfPeople, setNumberOfPeople] = useState(10);
	const [mealList, setMealList] = useState([]);
	const [filteredDishes, setFilteredDishes] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [foodListDownDropOpen, setFoodListDownDropOpen] = useState(false); //name changed from popupOpen
	const [selectedDishes, setSelectedDishes] = useState([]);
	const [selectedDishQuantities, setSelectedDishQuantities] = useState([]);
	const [includeDisposable, setIncludeDisposable] = useState(false);
	const [includeTables, setIncludeTables] = useState(false);
	const deliveryCharges = 300;
	const packingCost = 200;
	const validMealIds = [
		"63f1b6b7ed240f7a09f7e2de",
		"63f1b39a4082ee76673a0a9f",
		"63edc4757e1b370928b149b3",
	];
	const handleChange = (event) => {
		setSelectedOption(event.target.value);
	};
	// Dynamically update `numberOfPeople` based on `selectedOption`
	useEffect(() => {
		if (selectedOption === "live-catering") {
			setNumberOfPeople(35);
		} else {
			setNumberOfPeople(10);
		}
	}, [selectedOption]);
	const handlePeopleChange = (e) => {
		const minNum = selectedOption === "live-catering" ? 35 : 10;

		const value = Math.max(minNum, Number(e.target.value)); // Use minNum dynamically
		setNumberOfPeople(value);
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
		setSelectedDishQuantities(updatedQuantities);
		// setItemDataId(newRequestData); // Store requestData in state

		console.log(newRequestData, "requestData");
	}, [selectedDishes]);

	const RenderDishQuantity = ({ item }) => {
		const itemCount = selectedDishQuantities.length;

		const mainCourseItemCount = selectedDishQuantities.filter(
			(meal) => meal.id[0] === "63f1b6b7ed240f7a09f7e2de"
		).length;

		const appetizerItemCount = selectedDishQuantities.filter(
			(meal) => meal.id[0] === "63f1b39a4082ee76673a0a9f"
		).length;

		const breadItemCount = selectedDishQuantities.filter(
			(meal) => meal.id[0] === "63edc4757e1b370928b149b3"
		).length;

		let quantity = parseFloat(item.quantity) * numberOfPeople;

		if (
			(item.id[0] === "63f1b6b7ed240f7a09f7e2de" && mainCourseItemCount > 1) ||
			(item.id[0] === "63f1b39a4082ee76673a0a9f" && appetizerItemCount > 1) ||
			(item.id[0] === "63edc4757e1b370928b149b3" && breadItemCount > 1)
		) {
			if (itemCount <= 5) {
			} else if (itemCount === 6) {
				quantity = quantity * (1 - 0.15);
			} else if (itemCount === 7) {
				quantity = quantity * (1 - 0.15);
			} else if (itemCount === 8) {
				quantity = quantity * (1 - 0.25);
			} else if (itemCount === 9) {
				quantity = quantity * (1 - 0.3);
			} else if (itemCount === 10) {
				quantity = quantity * (1 - 0.35);
			} else if (itemCount === 11) {
				quantity = quantity * (1 - 0.4);
			} else if (itemCount === 12) {
				quantity = quantity * (1 - 0.5);
			} else if (itemCount === 13) {
				quantity = quantity * (1 - 0.53);
			} else if (itemCount === 15) {
				quantity = quantity * (1 - 0.55);
			}
		}

		quantity = Math.round(quantity);
		let unit = item.unit;

		if (quantity >= 1000) {
			quantity = quantity / 1000;
			if (unit === "Gram") unit = "KG";
			else if (unit === "ml") unit = "L";
		}

		return (
			<div className="ordereditemCard" style={style.ordereditemCard}>
				<div className="ordersummaryproduct-Img">
					<Image
						src={`https://horaservices.com/api/uploads/${item.image}`}
						alt={item.name}
						className="checkoutRightImg chef"
						width={150}
						height={150}
					/>
				</div>
				<div
					style={{ color: "rgb(146, 82, 170)", fontWeight: "600" }}
					className="ordersummaryproduct-info"
				>
					<p className="ordersummeryname">{item.name}</p>
					{selectedOption === "food-delivery" && (
						<div
							style={{
								fontSize: "90%",
								fontWeight: "700",
								color: "#9252AA",
								textTransform: "uppercase",
							}}
							className="ingredientrightsecsibheading"
						>
							{`${quantity} ${unit}`}
						</div>
					)}
				</div>
			</div>
		);
	};
	
	const calculatePriceDetails = () => {
		const dishCount = selectedDishes.filter(
			(dish) =>
				dish.name !== "Tawa Rotis" &&
				dish.name !== "Rumali Rotis" &&
				validMealIds.some((id) => dish.mealId.includes(id))
		).length;

		let subtotal = selectedDishes.reduce((total, dish) => {
			return total + dish.cuisineArray[0] * numberOfPeople;
		}, 0);

		const quantityDiscountPercent = (() => {
			if (dishCount === 4) return -15;
			if (dishCount === 5) return 0;
			if (dishCount === 6 || dishCount === 7) return 15;
			if (dishCount === 8) return 25;
			if (dishCount === 9 || dishCount === 10) return 35;
			if (dishCount === 11) return 40;
			if (dishCount === 12 || dishCount === 13) return 50;
			if (dishCount === 14) return 53;
			if (dishCount === 15) return 55;
			return 0;
		})();

		const peopleDiscountPercent = (() => {
			if (numberOfPeople >= 60) return 10;
			if (numberOfPeople >= 40) return 7;
			return 0;
		})();

		let priceAfterQuantityDiscount = subtotal;
		let quantityDiscountAmount = 0;

		if (selectedOption === "food-delivery") {
			selectedDishes.forEach((dish) => {
				if (
					dish.name !== "Tawa Rotis" &&
					dish.name !== "Rumali Rotis" &&
					validMealIds.some((id) => dish.mealId.includes(id))
				) {
					const dishPrice = dish.cuisineArray[0] * numberOfPeople;
					const dishDiscount = dishPrice * (quantityDiscountPercent / 100);
					console.log(dishDiscount, "discounted");
					quantityDiscountAmount += dishDiscount;
					console.log(quantityDiscountAmount, "quantityDiscountAmount111");
					priceAfterQuantityDiscount -= dishDiscount;
					console.log(priceAfterQuantityDiscount, "priceAfterQuantityDiscount");
				}
			});
		} else if (selectedOption === "live-catering") {
			priceAfterQuantityDiscount = subtotal;
			if (quantityDiscountPercent !== 0) {
				quantityDiscountAmount = subtotal * (quantityDiscountPercent / 100);

				console.log(quantityDiscountAmount, "quantityDiscountAmount11111");
				priceAfterQuantityDiscount = subtotal - quantityDiscountAmount;

				console.log(priceAfterQuantityDiscount, "priceAfterQuantityDiscount");
			}
		}

		console.log(priceAfterQuantityDiscount, "priceafterquantitydisfdjfkldsf");
		const peopleDiscount =
			priceAfterQuantityDiscount * (peopleDiscountPercent / 100);
		let priceAfterAllDiscounts = priceAfterQuantityDiscount - peopleDiscount;

		let additionalCharges = 0;
		let finalTotal = priceAfterAllDiscounts;

		if (selectedOption === "food-delivery") {
			if (finalTotal <= 4000) additionalCharges += deliveryCharges;
			additionalCharges += packingCost;
			if (includeDisposable) {
				additionalCharges += 20 * numberOfPeople;
			}
		} else if (selectedOption === "live-catering") {
			const serviceCharge = finalTotal * 0.1;
			additionalCharges += serviceCharge + 6500;
			if (includeTables) {
				additionalCharges += 1200;
			}
		}

		finalTotal += additionalCharges;

		return {
			subtotal: Math.round(subtotal),
			quantityDiscountPercent,
			quantityDiscountAmount: Math.round(quantityDiscountAmount),
			peopleDiscountPercent,
			peopleDiscountAmount: Math.round(peopleDiscount),
			priceAfterDiscounts: Math.round(priceAfterAllDiscounts),
			additionalCharges: Math.round(additionalCharges),
			finalTotal: Math.round(finalTotal),
			advancePayment: Math.round(finalTotal * 0.65),
			dishCount,
		};
	};
	const priceDetails = calculatePriceDetails();
	return (<>
		<div className="container">
			<h1>Create Food Order</h1>
			<div className="selectServiceTyle" style={style.selectServiceTyle}>
				<div style={style.selectDiv}>
					<label htmlFor="peopleInput" className="people-label" style={style.label}>
						Select Category:
					</label>
					<select
						value={selectedOption}
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
						<button
							type="button"
							className="btn decrement-btn"
							onClick={() =>
								handlePeopleChange({ target: { value: numberOfPeople - 1 } })
							}
							disabled={numberOfPeople <= 10}
							style={style.PlusMinusBtn}
						>
							-
						</button>
						<input
							id="peopleInput"
							type="number"
							value={numberOfPeople}
							onChange={handlePeopleChange}
							min={selectedOption === "live-catering" ? 35 : 10}
							className="people-input"
							style={style.noOfPeopleValue}
						/>
						<button
							type="button"
							className="btn increment-btn"
							onClick={() =>
								handlePeopleChange({ target: { value: numberOfPeople + 1 } })
							}
							style={style.PlusMinusBtn}
						>
							+
						</button>
					</div>
				</div>
			</div>
			<div style={style.selectionMsg}>
				{selectedOption === "" ? (
					<p>Please select a service to continue.</p>
				) : selectedOption === "food-delivery" ? (
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
												<li key={dish._id} className="popup-dish-item" style={style.foodListinPopup}>
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
			{selectedDishQuantities.length > 0 &&
				<div style={style.dishSelectedContainer}>
					<div style={style.header}>
						<p style={style.headerText}>Dishes selected</p>
					</div>

					<div style={style.selectedItemsContainer}>
						{selectedDishQuantities.map((item, index) => (
							<RenderDishQuantity key={index} item={item} />
						))}
					</div>
				</div>
			}
			{(() => {
				const priceDetails = calculatePriceDetails();
				return (
					<div className="price-breakdown" style={style.priceBreakdown}>
						<h4 style={{ textAlign: "center" }}>Price Breakdown</h4>
						<ul className="PriceBreakdownList">
							<li>
								<span>Number of Dishes:</span>
								<span>{priceDetails.dishCount}</span>
							</li>
							<li>
								<span>Number of Guests:</span>
								<span>{numberOfPeople}</span>
							</li>

							{selectedOption === "live-catering" && (
								<>
									<li>
										<span>Live Catering Item Total:</span>
										<span>
											₹ {(priceDetails.subtotal * 1.1 + 6500).toFixed(0)}
										</span>
									</li>
									<li>
										<span>Live Catering Item Discount:</span>
										<span>
											₹{" "}
											{(
												priceDetails.subtotal * 1.1 +
												6500 -
												(priceDetails.priceAfterDiscounts * 1.1 + 6500)
											).toFixed(0)}
										</span>
									</li>
									{includeTables && (
										<li>
											<span>Table Charges:</span>
											<span>+₹ 1200</span>
										</li>
									)}
									<div className="options-container">
										<label>
											<input
												type="checkbox"
												checked={includeTables}
												onChange={(e) =>
													setIncludeTables(e.target.checked)
												}
											/>
											3-4 Serving Tables with Cloth
										</label>
									</div>
								</>
							)}

							{selectedOption === "food-delivery" && (
								<>
									<li>
										<span>Item Total:</span>
										<span>₹ {priceDetails.subtotal}</span>
									</li>
									{priceDetails.quantityDiscountAmount > 0 && (
										<li>
											<span>Item Discount:</span>
											<span>
												-₹ {priceDetails.quantityDiscountAmount}
											</span>
										</li>
									)}
									{priceDetails.foodDeliveryDiscount > 0 && (
										<li>
											<span>Food Delivery Discount:</span>
											<span>
												-₹ {priceDetails.foodDeliveryDiscountAmount}
											</span>
										</li>
									)}
									<li>
										<span>Packing Charges:</span>
										<span>+₹ {packingCost}</span>
									</li>
									{includeDisposable && (
										<li>
											<span>Disposable Charges:</span>
											<span>+₹ {20 * numberOfPeople}</span>
										</li>
									)}
									{priceDetails.priceAfterDiscounts <= 4000 ? (
										<li>
											<span>Delivery Charges:</span>
											<span>+₹ {deliveryCharges}</span>
										</li>
									) : (
										<li>
											<span>Delivery Charges:</span>
											<span>FREE</span>
										</li>
									)}
									<div className="options-container">
										<label>
											<input
												type="checkbox"
												checked={includeDisposable}
												onChange={(e) =>
													setIncludeDisposable(e.target.checked)
												}
											/>
											Disposable plates + water bottle: ₹ 20/Person
										</label>
									</div>
								</>
							)}

							<h4>Final Amount: ₹ {priceDetails.finalTotal}</h4>
							<li>
								<span>Advance Payment (65%):</span>
								<span>₹ {priceDetails.advancePayment}</span>
							</li>
						</ul>
					</div>
				);
			})()}

			<CreateOrderForm calculatePriceDetails={calculatePriceDetails} priceDetails={priceDetails} numberOfPeople={numberOfPeople} selectedOption={selectedOption} selectedDishQuantities={selectedDishQuantities} includeTables={includeTables} />



		</div>
	</>);
}
const style = {
	selectDiv: {
		display: "inline-flex", flexDirection: "column", alignItems: "center",
		marginTop: "22px", marginLeft: "40px", width: "50%",
	},
	selectServiceTyle: {
		display: "flex", alignItems: "center"
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
		display: "inline-flex", flexDirection: "column", alignItems: "center", width: "50%",
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

