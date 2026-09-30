import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage_Popup from "../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../component/button/Buttons";
import { FirstTime_PasswordChange } from "../../service/Login/Login";
import AuthLayout from "./AuthLayout";

const FirstTime_Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    success: false,
    error: false,
    message: "",
  });

  useEffect(() => {
    const storedEmail =
      localStorage.getItem("email") || localStorage.getItem("temp_login_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (popup.success) {
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, success: false }));
        localStorage.clear();
        navigate("/login");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [popup.success, navigate]);

  const handleUpdatePassword = async (e) => {
    if (e) e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPopup({
        success: false,
        error: true,
        message: "New passwords do not match!",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await FirstTime_PasswordChange({
        email: email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      const successMsg =
        res?.data?.data?.message ||
        res?.data?.message ||
        res?.message ||
        "Your password has been updated. Please login.";

      setPopup({
        success: true,
        error: false,
        message: successMsg,
      });
    } catch (error) {
      console.error("Password Change Error:", error);

      const errorMessage =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to update password.";

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
      title="Security Setup"
      subtitle="Set up a new secure password for your account"
    >
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <ReUsableInput_Fields
          label="Current Temporary Password"
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              currentPassword: e.target.value,
            })
          }
          required
        />

        <ReUsableInput_Fields
          label="New Secure Password"
          type="password"
          value={passwordData.newPassword}
          onChange={(e) =>
            setPasswordData({ ...passwordData, newPassword: e.target.value })
          }
          required
        />

        <ReUsableInput_Fields
          label="Confirm New Password"
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) =>
            setPasswordData({
              ...passwordData,
              confirmPassword: e.target.value,
            })
          }
          required
        />

        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <h4 className="text-[10px] font-bold text-[#0062a0] uppercase tracking-widest mb-2">
            Security Note
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Changing your temporary password is required for first-time login to
            ensure your account's security.
          </p>
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full py-4 mt-4 rounded-xl font-bold"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Updating...</span>
            </div>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </form>

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

export default FirstTime_Login;
