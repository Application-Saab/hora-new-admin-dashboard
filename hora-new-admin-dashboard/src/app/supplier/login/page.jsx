"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./login.css";
import { BASE_URL } from "@/utils/apiconstant";

const SEND_OTP_API = "/api/user/otp_generate";
const VERIFY_OTP_API = "/api/user/otp_verify";

export default function SupplierLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const orderId = searchParams.get("orderId");

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const sendOtp = async () => {
        setError("");
        setSuccess("");

        if (!mobile || mobile.length !== 10) {
            setError("Please enter a valid 10 digit mobile number");
            return;
        }

        try {
            const body = {
                phone: mobile, role: "supplier"
            }
            const response = await axios.post(
                `${BASE_URL}${SEND_OTP_API}`,
                body,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.status === API_SUCCESS_CODE) {
                setIsOtpSent(true);
                setError("");
                resetTimer();
            } else {
                setError("Failed to send OTP. Please try again.");
            }
        } catch {
            setError("Error sending OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setError("");
        setSuccess("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6 digit OTP");
            return;
        }


        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}${VERIFY_OTP_API}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone: mobile,
                    role: "supplier",
                    otp,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Invalid OTP");
                return;
            }

            /*
             * Agar backend token return karta hai,
             * toh yahan save kar sakte ho.
             */
            if (data.token) {
                sessionStorage.setItem("supplierToken", data.token);
            }

            sessionStorage.setItem("supplierMobile", mobile);

            if (orderId) {
                router.push(`/supplier/upload/${orderId}`);
            } else {
                router.push("/supplier/upload");
            }
        } catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const changeNumber = () => {
        setOtpSent(false);
        setOtp("");
        setError("");
        setSuccess("");
    };

    return (
        <main className="supplier-login-page">
            <div className="supplier-login-card">
                <div className="supplier-login-header">
                    <h1>Supplier Login</h1>
                    <p>
                        {otpSent
                            ? "Enter the OTP sent to your mobile number"
                            : "Enter your mobile number to continue"}
                    </p>
                </div>

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
                                    const value = e.target.value.replace(/\D/g, "");
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
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </div>
                ) : (
                    <div className="supplier-form">
                        <label>Enter OTP</label>

                        <input
                            type="tel"
                            className="otp-input"
                            value={otp}
                            maxLength={6}
                            placeholder="Enter 6 digit OTP"
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setOtp(value);
                            }}
                        />

                        <div className="otp-mobile">
                            OTP sent to <strong>+91 {mobile}</strong>
                        </div>

                        <button
                            type="button"
                            className="supplier-login-button"
                            onClick={verifyOtp}
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
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

                {error && <div className="supplier-error">{error}</div>}

                {success && <div className="supplier-success">{success}</div>}
            </div>
        </main>
    );
}