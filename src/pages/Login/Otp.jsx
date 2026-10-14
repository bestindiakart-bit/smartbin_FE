import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Button from "../../component/button/Buttons";
import ErrorMessage_Popup from "../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../component/Popup_Models/Success_Popup";
import PreLoader from "../../component/Pre_Loader/PreLoader";
import { user_verify } from "../../service/Login/Login";
import AuthLayout from "./AuthLayout";
import { fetchPermissions } from "../../store/Permission_Store/Permission_Slice";

const EMPTY_OTP = ["", "", "", "", "", ""];

const Otp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRefs = useRef([]);
  const submittingRef = useRef(false);
  const redirectTimerRef = useRef(null);

  const [otp, setOtp] = useState(() => {
    const stored = sessionStorage.getItem("temp_login_otp");
    return stored && /^\d{6}$/.test(stored) ? stored.split("") : [...EMPTY_OTP];
  });
  const [email, setEmail] = useState(
    () => localStorage.getItem("temp_login_email") || "",
  );
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("temp_login_email");
    if (!savedEmail) {
      navigate("/login", { replace: true });
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e, explicitOtp = null) => {
    e?.preventDefault?.();
    if (submittingRef.current) return;

    const otpValue = explicitOtp ?? otp.join("");
    if (!/^\d{6}$/.test(otpValue)) {
      setPopupMessage("Please enter the full 6-digit code.");
      setShowError(true);
      return;
    }
    if (!email) {
      navigate("/login", { replace: true });
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setShowError(false);

    try {
      const response = await user_verify({ loginEmail: email, otp: otpValue });
      const responseBody = response?.data ?? response;
      if (responseBody?.success === false) {
        throw new Error(responseBody?.message || "OTP verification failed");
      }
      const apiData = responseBody?.data ?? responseBody;

      if (apiData?.accessToken) {
        localStorage.setItem("accessToken", apiData.accessToken);
        localStorage.setItem("email", email);
      }
      if (apiData?.user)
        localStorage.setItem("user", JSON.stringify(apiData.user));
      if (apiData?.userId)
        localStorage.setItem("userId", String(apiData.userId));
      if (apiData?.role) localStorage.setItem("role", String(apiData.role));

      const firstTime = apiData?.isFirstLogin === true;
      setPopupMessage(
        apiData?.message || responseBody?.message || "Verification successful!",
      );
      setShowSuccess(true);
      localStorage.removeItem("temp_login_email");
      sessionStorage.removeItem("temp_login_otp");

      redirectTimerRef.current = setTimeout(async () => {
        setShowSuccess(false);
        setShowLoader(true);
        try {
          await dispatch(fetchPermissions()).unwrap();
        } catch (error) {
          console.error("Permissions failed:", error);
        } finally {
          setShowLoader(false);
          navigate(firstTime ? "/login/first-time-login" : "/dashboard", {
            replace: true,
          });
        }
      }, 1500);
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Invalid OTP. Please try again.";
      setPopupMessage(message);
      setShowError(true);
      setOtp([...EMPTY_OTP]);
      // Prevent a rejected or expired OTP from reappearing after refresh.
      sessionStorage.removeItem("temp_login_otp");
      inputRefs.current[0]?.focus();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleChange = (value, index) => {
    if (loading || showLoader || showSuccess || !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    // Manual click on Verify & Proceed is required; no auto-submit.
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (loading || showLoader || showSuccess) return;
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = [...EMPTY_OTP];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`We've sent a 6-digit code to ${email}`}
    >
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="otp-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-white"
          >
            <PreLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-between gap-2 sm:gap-4 mt-10 mb-12">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className="w-full min-w-0 h-12 sm:h-16 text-center text-2xl font-bold bg-blue-50/50 border-2 border-slate-200 rounded-2xl focus:border-[#0062a0] focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              disabled={loading || showSuccess || showLoader}
              autoFocus={i === 0 && !otp[0]}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full py-4 rounded-xl font-bold"
          disabled={loading || showSuccess || showLoader}
        >
          {loading ? "Verifying..." : "Verify & Proceed"}
        </Button>
      </form>

      <Success_Popup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={popupMessage}
      />
      <ErrorMessage_Popup
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Verification Failed"
        message={popupMessage}
        btnText="Try Again"
      />
    </AuthLayout>
  );
};

export default Otp;
