import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage_Popup from "../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../component/button/Buttons";
import { Forgot_Change_Password } from "../../service/Login/Login";
import AuthLayout from "./AuthLayout";

const Forgot_PasswordSet = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({
    success: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("email") || localStorage.getItem("temp_login_email");

    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setPopup({
        success: false,
        error: true,
        message: "Session expired. Please enter your email again.",
      });
      setTimeout(() => navigate("/forgot-password"), 2000);
    }
  }, [navigate]);

  useEffect(() => {
    if (popup.success) {
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, success: false }));
        localStorage.removeItem("email");
        localStorage.removeItem("temp_login_email");
        navigate("/login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [popup.success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setPopup({ success: false, error: true, message: "Please enter OTP." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPopup({
        success: false,
        error: true,
        message: "Passwords do not match!",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        loginEmail: email,
        otp: otp,
        newPassword: newPassword,
      };

      const response = await Forgot_Change_Password(payload);

      const successMsg =
        response?.data?.data?.message ||
        response?.data?.message ||
        response?.message ||
        "Password changed successfully!";

      setPopup({
        success: true,
        error: false,
        message: successMsg,
      });
    } catch (error) {
      console.error("Reset password error:", error);

      const errorMessage =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Invalid OTP or request failed.";

      setPopup({
        success: false,
        error: true,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle={`Verify the OTP sent to ${email}`}
    >
      <motion.form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-green-50 rounded-2xl text-[#0062a0]">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
        </div>

        <ReUsableInput_Fields
          label="Email Address"
          type="email"
          value={email}
          readOnly
          className="bg-slate-50 cursor-not-allowed"
        />

        <ReUsableInput_Fields
          label="Verification Code (OTP)"
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <ReUsableInput_Fields
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <ReUsableInput_Fields
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          variant="primary"
          className="w-full py-4 mt-8 rounded-xl text-lg font-bold shadow-lg shadow-blue-900/20"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Updating...</span>
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>

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

      {/* Popups */}
      <Success_Popup
        isOpen={popup.success}
        onClose={() => {
          localStorage.clear();
          navigate("/login");
        }}
        message={popup.message}
      />

      <ErrorMessage_Popup
        isOpen={popup.error}
        onClose={() => setPopup({ ...popup, error: false })}
        message={popup.message}
      />
    </AuthLayout>
  );
};

export default Forgot_PasswordSet;
