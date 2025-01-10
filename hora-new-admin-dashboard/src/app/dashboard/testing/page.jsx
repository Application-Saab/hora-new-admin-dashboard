"use client";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // useNavigate instead of useHistory

function App() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [link, setLink] = useState("");
  const navigate = useNavigate(); // useNavigate instead of useHistory

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        phoneNumber,
        otp,
      });
      setToken(response.data.token);
      // Redirect after login
      navigate("/dashboard"); // Navigate to a different page (example: dashboard)
    } catch (error) {
      alert("Error logging in");
    }
  };

  const generateLink = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generate-link", {
        token,
      });
      setLink(response.data.link);
    } catch (error) {
      alert("Error generating link");
    }
  };

  return (
    <div className="App">
      {!token ? (
        <div>
          <h2>Master Login</h2>
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Generate Shareable Link</h2>
          <button onClick={generateLink}>Generate Link</button>
          {link && (
            <div>
              <p>Share this link: </p>
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

