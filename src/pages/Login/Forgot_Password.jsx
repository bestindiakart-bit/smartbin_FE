import { motion } from "framer-motion";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ReUsableInput_Fields from "../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../component/button/Buttons";
import { Forgot_password } from "../../service/Login/Login";
import AuthLayout from "./AuthLayout";

// Popups
import ErrorMessage_Popup from "../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../component/Popup_Models/Success_Popup";

const Forgot_Password = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Popup states
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Navigate to OTP/password page after success popup
  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      navigate("../forgot-change-password");
    }, 2000);

    return () => clearTimeout(timer);
  }, [showSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent empty email
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      // Backend expects loginEmail
      const payload = {
        loginEmail: email.trim(),
      };

      const response = await Forgot_password(payload);

      // Extract success message
      const successMessage =
        response?.data?.data?.message ||
        response?.data?.message ||
        response?.message ||
        "Reset link sent successfully!";

      /**
       * IMPORTANT FIX
       *
       * Store email before navigating to
       * /forgot-change-password.
       *
       * Forgot_PasswordSet reads this value
       * from localStorage.
       */
      localStorage.setItem("email", email.trim());

      setSuccessMsg(successMessage);
      setShowSuccess(true);
    } catch (error) {
      console.error("Forgot Password Error:", error);

      // Extract nested error message
      const errorMessage =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Email not found or server error";

      setErrorMsg(errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="No worries! Enter your email and we'll send you a link to reset your password."
    >
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-50 rounded-2xl text-[#0062a0]">
            <KeyRound
              size={40}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Email */}
        <ReUsableInput_Fields
          label="Email Address"
          type="email"
          placeholder="e.g. admin@smartbin.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Submit */}
        <Button
          variant="primary"
          className="w-full py-4 mt-8 rounded-xl text-lg font-bold shadow-lg shadow-blue-900/20"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0062a0] transition-colors group cursor-pointer"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />

          Back to Login
        </button>
      </motion.form>

      {/* Success Popup */}
      <Success_Popup
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
        }}
        message={successMsg}
      />

      {/* Error Popup */}
      <ErrorMessage_Popup
        isOpen={showError}
        onClose={() => {
          setShowError(false);
        }}
        title="Reset Failed"
        message={errorMsg}
        btnText="Close"
      />
    </AuthLayout>
  );
};

export default Forgot_Password;