import React, { useState, useEffect } from "react";
import API from "../Services/api";
import "./PaymentForm.css";

const PaymentForm = ({ orderId, amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");

  useEffect(() => {
    // Fetch Razorpay key from backend
    const fetchKey = async () => {
      try {
        const response = await API.get("/payments/key");
        setRazorpayKey(response.data.key);
      } catch (error) {
        console.error("Failed to fetch Razorpay key:", error);
        onFailure?.("Failed to load payment configuration");
      }
    };

    fetchKey();

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded ✅");
      script.onerror = () => console.log("Failed to load Razorpay script ❌");
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!window.Razorpay) {
        onFailure?.("Razorpay SDK failed to load. Please refresh.");
        return;
      }

      // ✅ baseURL already has /api so use /payments/...
      const orderResponse = await API.post("/payments/create-order", {
        orderId: orderId,
        amount: Math.round(amount * 100), // paisa
        currency: "INR",
      });

      const { id: razorpayOrderId, amount: orderAmount } = orderResponse.data;

      const options = {
        key: razorpayKey,
        amount: orderAmount,
        currency: "INR",
        name: "AgriTrade",
        description: "Order Payment",
        order_id: razorpayOrderId,

        handler: async function (response) {
          try {
            const verifyResponse = await API.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            });

            if (verifyResponse.data?.success) {
              onSuccess?.(response.razorpay_payment_id);
            } else {
              onFailure?.("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            onFailure?.("Payment verification error");
          }
        },

        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },

        theme: { color: "#3399cc" },

        modal: {
          ondismiss: function () {
            onFailure?.("Payment cancelled by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        let errorMsg = "Payment failed";
        if (response?.error?.description) {
          errorMsg = response.error.description;
        } else if (response?.error?.code) {
          errorMsg = `Payment failed (${response.error.code})`;
        } else if (typeof response?.error === 'string') {
          errorMsg = response.error;
        }
        onFailure?.(errorMsg);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);

      // Improved error message extraction
      let errorMessage = "Failed to initiate payment";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if (error.response?.status) {
        errorMessage = `Payment failed (Status: ${error.response.status})`;
      }

      onFailure?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="payment-button"
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </div>
  );
};

export default PaymentForm;
