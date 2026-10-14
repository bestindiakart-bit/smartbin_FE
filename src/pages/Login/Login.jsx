import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReUsableInput_Fields from "../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../component/button/Buttons";
import { loginAPI } from "../../service/Login/Login";
import AuthLayout from "./AuthLayout";
import ErrorMessage_Popup from "../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../component/Popup_Models/Success_Popup";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    if (!showSuccess || !redirectPath) return;
    const timer = setTimeout(() => {
      setShowSuccess(false);
      navigate(redirectPath);
    }, 1500);
    return () => clearTimeout(timer);
  }, [showSuccess, redirectPath, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setShowError(false);
    setRedirectPath("");
    sessionStorage.removeItem("temp_login_otp");

    try {
      const response = await loginAPI(formData);
      const responseBody = response?.data ?? response;
      if (responseBody?.success === false) {
        throw new Error(responseBody?.message || "Login failed");
      }

      const apiData = responseBody?.data ?? responseBody;
      localStorage.setItem("temp_login_email", formData.loginEmail);

      // This is only useful for backends that expose OTPs in development.
      // In production, the server should deliver OTP via email/SMS instead.
      const returnedOtp = apiData?.otp;
      if (returnedOtp != null && /^\d{6}$/.test(String(returnedOtp))) {
        sessionStorage.setItem("temp_login_otp", String(returnedOtp));
      }

      const message =
        apiData?.message || responseBody?.message || "Login successful!";
      setSuccessMsg(message);
      setRedirectPath(
        apiData?.isFirstLogin === true ? "first-time-login" : "otp",
      );
      setShowSuccess(true);
    } catch (error) {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Invalid email or password";
      setErrorMsg(message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back! Please enter your details."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <ReUsableInput_Fields
            label="Email Address"
            name="loginEmail"
            type="email"
            value={formData.loginEmail}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, loginEmail: e.target.value }))
            }
            required
          />
          <ReUsableInput_Fields
            label="Password"
            name="loginPassword"
            type="password"
            value={formData.loginPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                loginPassword: e.target.value,
              }))
            }
            required
          />
        </div>

        <div className="flex items-center justify-between mt-4 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0062a0]"
            />
            <span className="text-sm text-slate-600 font-medium">
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={() => navigate("forgot-password")}
            className="text-sm font-bold text-[#0062a0] hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full py-4 rounded-xl text-lg font-bold"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <Success_Popup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
      />
      <ErrorMessage_Popup
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Login Failed"
        message={errorMsg}
        btnText="Try Again"
      />
    </AuthLayout>
  );
};

export default Login;
