
"use client";
import React, { useState, useEffect } from "react";

import "../decoration-createorder/createorder.css";

function App() {
	const [isContinueClicked, setIsContinueClicked] = useState(false);
	const handleSubmit = () => {
		console.log("sohan");
	}

	return (
		<div className="container">
		<h1>Create Food Order</h1>
		<form onSubmit={handleSubmit}>
		  <label htmlFor="dishName">Food Name *</label>
		  <input
			type="text"
			id="dishName"
			
			placeholder="Food Name"
			required
		  />
  
		  {!isContinueClicked && (
			<button
			  type="button"
			  className="button1"
			  style={{ marginTop: "10px", marginLeft: "10px" }}
			>
			  Continue
			</button>
		  )}
    </form>
		</div>
	);
}

export default App;
