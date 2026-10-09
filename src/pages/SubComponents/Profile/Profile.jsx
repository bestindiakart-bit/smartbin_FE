
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, Eye, EyeOff, KeyRound, Loader2,
  Pencil, ShieldCheck, UserRound, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginMeAPI, FirstTime_PasswordChange } from "../../../service/Login/Login";
import { updateMyProfile } from "../../../service/Login/profileService";
import Confirmation_Popup from "../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../component/Popup_Models/Success_Popup";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const getError = (error) =>
  error?.response?.data?.data?.message ||
  error?.response?.data?.message ||
  error?.data?.data?.message ||
  error?.data?.message ||
  error?.message ||
  "Request failed.";

const normalizeProfile = (data = {}) => ({
  userName: data.userName || "",
  loginEmail: data.loginEmail || "",
  userId: data.userId || "",
  userTypeName: data.userTypeId?.userTypeName || "",
  companyName: data.companyName || "",
  isMainAdmin: data.isMainAdmin === true,
  status: data.status,
});

const Detail = ({ label, value }) => (
  <div className="min-w-0 border-b border-slate-100 py-3">
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="break-words text-sm font-medium text-slate-800">
      {value === undefined || value === null || value === "" ? "—" : value}
    </p>
  </div>
);

const PasswordField = ({
  label, name, value, visible, onToggle, onChange, disabled,
}) => (
  <label className="block space-y-2">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-[#0062a0] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-[#0062a0]"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </label>
);

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState(emptyPassword);
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [notice, setNotice] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loginMeAPI();
      if (res?.data?.success === false || !res?.data?.data) {
        throw new Error(res?.data?.message || "Unable to load account details.");
      }
      const details = normalizeProfile(res.data.data);
      setProfile(details);
      setName(details.userName);
    } catch (error) {
      setNotice({ type: "error", message: getError(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveDetails = async (event) => {
    event.preventDefault();
    const cleanedName = name.trim();

    if (!cleanedName) {
      setNotice({ type: "error", message: "User name is required." });
      return;
    }
    if (cleanedName === profile.userName) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      // This service requires your confirmed profile-update endpoint.
      const res = await updateMyProfile({ userName: cleanedName });
      if (res?.data?.success !== true) {
        throw new Error(res?.data?.message || "Profile update failed.");
      }
      await loadProfile();
      setEditing(false);
      setNotice({ type: "success", message: "Profile updated successfully." });
    } catch (error) {
      setNotice({ type: "error", message: getError(error) });
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = (event) => {
    event.preventDefault();
    setNotice(null);

    if (!profile?.loginEmail) {
      setNotice({ type: "error", message: "Account email is missing." });
      return;
    }
    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      setNotice({ type: "error", message: "Please fill all password fields." });
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      setNotice({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (password.currentPassword === password.newPassword) {
      setNotice({ type: "error", message: "New password must differ from the current password." });
      return;
    }
    setConfirmPopup(true);
  };

  const handleConfirmPasswordChange = async () => {
    if (changingPassword) return;
    setConfirmPopup(false);
    setChangingPassword(true);

    try {
      const res = await FirstTime_PasswordChange({
        email: profile.loginEmail,
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });

      if (res?.data?.success !== true) {
        throw new Error(res?.data?.message || "Password change failed.");
      }

      setPassword(emptyPassword);
      setVisible({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setPasswordSuccessMessage(res?.data?.message || "Password changed successfully.");
      setSuccessPopup(true);
    } catch (error) {
      setNotice({ type: "error", message: getError(error) });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordSuccessClose = () => {
    setSuccessPopup(false);
    localStorage.removeItem("accessToken");
    window.location.replace("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-8"
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 bg-white p-3 text-[#0062a0] hover:bg-blue-50"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500">Account details and security</p>
          </div>
        </div>

        {notice && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 text-sm ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {notice.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center rounded-2xl bg-white p-20">
            <Loader2 className="animate-spin text-[#0062a0]" size={32} />
          </div>
        ) : !profile ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="mb-4 text-slate-600">Unable to load your profile.</p>
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-lg bg-[#0062a0] px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-[#0062a0]">
                {(profile.userName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-slate-900">
                  {profile.userName || "Account"}
                </h2>
                <p className="truncate text-sm text-slate-500">{profile.loginEmail}</p>
                <p className="mt-1 text-xs font-medium text-[#0062a0]">
                  {profile.userTypeName}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UserRound size={21} className="text-[#0062a0]" />
                  <h2 className="text-lg font-bold text-slate-800">Personal Details</h2>
                </div>
                {/* {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setName(profile.userName);
                      setEditing(true);
                      setNotice(null);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0062a0] hover:bg-blue-50"
                  >
                    <Pencil size={16} /> Edit Details
                  </button>
                )} */}
              </div>

              {!editing ? (
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Detail label="User Name" value={profile.userName} />
                  <Detail label="Email Address" value={profile.loginEmail} />
                  <Detail label="User ID" value={profile.userId} />
                  <Detail label="User Type" value={profile.userTypeName} />
                  <Detail label="Company" value={profile.companyName} />
                  <Detail
                    label="Account Type"
                    value={profile.isMainAdmin ? "Main Administrator" : "User"}
                  />
                  <Detail
                    label="Status"
                    value={profile.status === 1 ? "Active" : profile.status === 0 ? "Inactive" : "—"}
                  />
                </div>
              ) : (
                <form onSubmit={saveDetails} className="space-y-5">
                  <label className="block max-w-lg space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User Name
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0062a0] focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Email, user ID, role, company, account type and status are managed by the system.
                  </p>
                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setName(profile.userName);
                        setEditing(false);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-[#0062a0] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={21} className="text-[#0062a0]" />
                <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
              </div>
              <p className="mb-6 text-sm text-slate-500">
                Enter your current password and choose a new password.
              </p>
              <form onSubmit={submitPassword} className="max-w-xl space-y-5">
                {[
                  { name: "currentPassword", label: "Current Password" },
                  { name: "newPassword", label: "New Password" },
                  { name: "confirmPassword", label: "Confirm New Password" },
                ].map(({ name: fieldName, label }) => (
                  <PasswordField
                    key={fieldName}
                    name={fieldName}
                    label={label}
                    value={password[fieldName]}
                    visible={visible[fieldName]}
                    disabled={changingPassword}
                    onToggle={() =>
                      setVisible((prev) => ({
                        ...prev,
                        [fieldName]: !prev[fieldName],
                      }))
                    }
                    onChange={(event) =>
                      setPassword((prev) => ({
                        ...prev,
                        [fieldName]: event.target.value,
                      }))
                    }
                  />
                ))}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 rounded-xl bg-[#0062a0] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {changingPassword ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <KeyRound size={17} />
                  )}
                  Update Password
                </button>
              </form>
            </section>
          </>
        )}
      </div>

      <Confirmation_Popup
        isOpen={confirmPopup}
        onClose={() => {
          if (!changingPassword) setConfirmPopup(false);
        }}
        onConfirm={handleConfirmPasswordChange}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will be logged out and need to sign in again."
        btnText="Change Password"
      />

      <Success_Popup
        isOpen={successPopup}
        onClose={handlePasswordSuccessClose}
        title="Password Changed"
        message={`${passwordSuccessMessage} Please sign in again using your new password.`}
      />
    </motion.div>
  );
};

export default Profile;
