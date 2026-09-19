"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import "./login.css";
import { BASE_URL } from "@/utils/apiconstant";
import { useTimer } from "../../../utils/useTimer";

const SEND_OTP_API = "/api/user/otp_generate";
const VERIFY_OTP_API = "/api/user/otp_verify";

export default function SupplierLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetTimer } = useTimer(30);

    const orderId = searchParams.get("orderId");

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // SEND OTP
    // =========================
    const sendOtp = async () => {
        setError("");
        setSuccess("");

        if (!mobile || mobile.length !== 10) {
            setError("Please enter a valid 10 digit mobile number");
            return;
        }

        try {
            setLoading(true);

            const body = {
                phone: mobile,
                role: "supplier",
            };

            const response = await axios.post(
                `${BASE_URL}${SEND_OTP_API}`,
                body,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("OTP response:", response.data);

            if (response.data?.status === 200) {
                setOtpSent(true);
                setError("");
                resetTimer();
            } else {
                setError(
                    response.data?.message ||
                    "Failed to send OTP. Please try again."
                );
            }
        } catch (error) {
            console.log("OTP error:", error);

            setError(
                error?.response?.data?.message ||
                "Error sending OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // VERIFY OTP
    // =========================
    const verifyOtp = async () => {
        setError("");
        setSuccess("");

        if (!otp || otp.length !== 4) {
            setError("Please enter a valid 4 digit OTP");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${BASE_URL}${VERIFY_OTP_API}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        phone: mobile,
                        role: "supplier",
                        otp,
                    }),
                }
            );

            const data = await response.json();

            console.log("Verify OTP response:", data);

            // Correct status check
            if (data?.status !== 200) {
                setError(data?.message || "Invalid OTP");
                return;
            }

            // =========================
            // SAVE SUPPLIER ID
            // =========================
            if (data?.data?._id) {
                localStorage.setItem(
                    "supplierID",
                    data.data._id
                );
            }

            // =========================
            // REDIRECT
            // =========================
            if (orderId) {
                router.push(
                    `/supplier/uploads?orderId=${orderId}`
                );
            } else {
                router.push("/supplier/uploads");
            }

        } catch (error) {
            console.log("Verify OTP error:", error);

            setError(
                error?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CHANGE MOBILE NUMBER
    // =========================
    const changeNumber = () => {
        setOtpSent(false);
        setOtp("");
        setError("");
        setSuccess("");
    };

    return (
        <main className="supplier-login-page">
            <div className="supplier-login-card">

                {/* HEADER */}
                <div className="supplier-login-header">
                    <h1>Supplier Login</h1>

                    <p>
                        {otpSent
                            ? "Enter the OTP sent to your mobile number"
                            : "Enter your mobile number to continue"}
                    </p>
                </div>

                {/* =========================
                    MOBILE NUMBER
                ========================= */}
                {!otpSent ? (
                    <div className="supplier-form">

                        <label>Mobile Number</label>

                        <div className="mobile-input-wrapper">
                            <span>+91</span>

                            <input
                                type="tel"
                                value={mobile}
                                maxLength={10}
                                placeholder="Enter mobile number"
                                onChange={(e) => {
                                    const value =
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );

                                    setMobile(value);
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            className="supplier-login-button"
                            onClick={sendOtp}
                            disabled={loading}
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Send OTP"}
                        </button>
                    </div>
                ) : (

                    /* =========================
                       OTP
                    ========================= */
                    <div className="supplier-form">

                        <label>Enter OTP</label>

                        <input
                            type="tel"
                            className="otp-input"
                            value={otp}
                            maxLength={4}
                            placeholder="Enter 4 digit OTP"
                            onChange={(e) => {
                                const value =
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setOtp(value);
                            }}
                        />

                        <div className="otp-mobile">
                            OTP sent to{" "}
                            <strong>
                                +91 {mobile}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="supplier-login-button"
                            onClick={verifyOtp}
                            disabled={loading}
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify OTP"}
                        </button>

                        <button
                            type="button"
                            className="change-number-button"
                            onClick={changeNumber}
                        >
                            Change Mobile Number
                        </button>
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="supplier-error">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}
                {success && (
                    <div className="supplier-success">
                        {success}
                    </div>
                )}

            </div>
        </main>
    );
}