// import { useCallback, useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   Check,
//   Eye,
//   EyeOff,
//   KeyRound,
//   Loader2,
//   Pencil,
//   ShieldCheck,
//   UserRound,
//   X,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import {
//   loginMeAPI,
//   FirstTime_PasswordChange,
// } from "../../../service/Login/Login";
// import { updateMyProfile } from "../../../service/Login/profileService";
// import Confirmation_Popup from "../../../component/Popup_Models/Confirmation_Popup";
// import Success_Popup from "../../../component/Popup_Models/Success_Popup";

// const emptyPassword = {
//   currentPassword: "",
//   newPassword: "",
//   confirmPassword: "",
// };

// const getError = (error) =>
//   error?.response?.data?.data?.message ||
//   error?.response?.data?.message ||
//   error?.data?.data?.message ||
//   error?.data?.message ||
//   error?.message ||
//   "Request failed.";

// const normalizeProfile = (data = {}) => ({
//   userName: data.userName || "",
//   loginEmail: data.loginEmail || "",
//   userId: data.userId || "",
//   userTypeName: data.userTypeId?.userTypeName || "",
//   companyName: data.companyName || "",
//   isMainAdmin: data.isMainAdmin === true,
//   status: data.status,
// });

// const Detail = ({ label, value }) => (
//   <div className="min-w-0 border-b border-slate-100 py-3">
//     <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
//       {label}
//     </p>
//     <p className="break-words text-sm font-medium text-slate-800">
//       {value === undefined || value === null || value === "" ? "—" : value}
//     </p>
//   </div>
// );

// const PasswordField = ({
//   label,
//   name,
//   value,
//   visible,
//   onToggle,
//   onChange,
//   disabled,
// }) => (
//   <label className="block space-y-2">
//     <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//       {label}
//     </span>
//     <div className="relative">
//       <input
//         type={visible ? "text" : "password"}
//         name={name}
//         value={value}
//         onChange={onChange}
//         disabled={disabled}
//         required
//         autoComplete={
//           name === "currentPassword" ? "current-password" : "new-password"
//         }
//         placeholder={`Enter ${label.toLowerCase()}`}
//         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-[#0062a0] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
//       />
//       <button
//         type="button"
//         onClick={onToggle}
//         disabled={disabled}
//         aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
//         className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-[#0062a0]"
//       >
//         {visible ? <EyeOff size={18} /> : <Eye size={18} />}
//       </button>
//     </div>
//   </label>
// );

// const Profile = () => {
//   const navigate = useNavigate();

//   const [profile, setProfile] = useState(null);
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [changingPassword, setChangingPassword] = useState(false);
//   const [password, setPassword] = useState(emptyPassword);
//   const [visible, setVisible] = useState({
//     currentPassword: false,
//     newPassword: false,
//     confirmPassword: false,
//   });
//   const [notice, setNotice] = useState(null);
//   const [confirmPopup, setConfirmPopup] = useState(false);
//   const [successPopup, setSuccessPopup] = useState(false);
//   const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

//   const loadProfile = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await loginMeAPI();
//       if (res?.data?.success === false || !res?.data?.data) {
//         throw new Error(
//           res?.data?.message || "Unable to load account details.",
//         );
//       }
//       const details = normalizeProfile(res.data.data);
//       setProfile(details);
//       setName(details.userName);
//     } catch (error) {
//       setNotice({ type: "error", message: getError(error) });
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadProfile();
//   }, [loadProfile]);

//   const saveDetails = async (event) => {
//     event.preventDefault();
//     const cleanedName = name.trim();

//     if (!cleanedName) {
//       setNotice({ type: "error", message: "User name is required." });
//       return;
//     }
//     if (cleanedName === profile.userName) {
//       setEditing(false);
//       return;
//     }

//     setSaving(true);
//     setNotice(null);
//     try {
//       // This service requires your confirmed profile-update endpoint.
//       const res = await updateMyProfile({ userName: cleanedName });
//       if (res?.data?.success !== true) {
//         throw new Error(res?.data?.message || "Profile update failed.");
//       }
//       await loadProfile();
//       setEditing(false);
//       setNotice({ type: "success", message: "Profile updated successfully." });
//     } catch (error) {
//       setNotice({ type: "error", message: getError(error) });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const submitPassword = (event) => {
//     event.preventDefault();
//     setNotice(null);

//     if (!profile?.loginEmail) {
//       setNotice({ type: "error", message: "Account email is missing." });
//       return;
//     }
//     if (
//       !password.currentPassword ||
//       !password.newPassword ||
//       !password.confirmPassword
//     ) {
//       setNotice({ type: "error", message: "Please fill all password fields." });
//       return;
//     }
//     if (password.newPassword !== password.confirmPassword) {
//       setNotice({ type: "error", message: "New passwords do not match." });
//       return;
//     }
//     if (password.currentPassword === password.newPassword) {
//       setNotice({
//         type: "error",
//         message: "New password must differ from the current password.",
//       });
//       return;
//     }
//     setConfirmPopup(true);
//   };

//   const handleConfirmPasswordChange = async () => {
//     if (changingPassword) return;
//     setConfirmPopup(false);
//     setChangingPassword(true);

//     try {
//       const res = await FirstTime_PasswordChange({
//         email: profile.loginEmail,
//         currentPassword: password.currentPassword,
//         newPassword: password.newPassword,
//       });

//       if (res?.data?.success !== true) {
//         throw new Error(res?.data?.message || "Password change failed.");
//       }

//       setPassword(emptyPassword);
//       setVisible({
//         currentPassword: false,
//         newPassword: false,
//         confirmPassword: false,
//       });
//       setPasswordSuccessMessage(
//         res?.data?.message || "Password changed successfully.",
//       );
//       setSuccessPopup(true);
//     } catch (error) {
//       setNotice({ type: "error", message: getError(error) });
//     } finally {
//       setChangingPassword(false);
//     }
//   };

//   const handlePasswordSuccessClose = () => {
//     setSuccessPopup(false);
//     localStorage.removeItem("accessToken");
//     window.location.replace("/login");
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-8"
//     >
//       <div className="mx-auto max-w-5xl space-y-6">
//         <div className="flex items-center gap-3">
//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="rounded-xl border border-slate-200 bg-white p-3 text-[#0062a0] hover:bg-blue-50"
//             aria-label="Go back"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
//             <p className="text-sm text-slate-500">
//               Account details and security
//             </p>
//           </div>
//         </div>

//         {notice && (
//           <div
//             role="alert"
//             className={`rounded-xl border px-4 py-3 text-sm ${
//               notice.type === "error"
//                 ? "border-red-200 bg-red-50 text-red-700"
//                 : "border-green-200 bg-green-50 text-green-700"
//             }`}
//           >
//             {notice.message}
//           </div>
//         )}

//         {loading ? (
//           <div className="flex justify-center rounded-2xl bg-white p-20">
//             <Loader2 className="animate-spin text-[#0062a0]" size={32} />
//           </div>
//         ) : !profile ? (
//           <div className="rounded-2xl bg-white p-8 text-center">
//             <p className="mb-4 text-slate-600">Unable to load your profile.</p>
//             <button
//               type="button"
//               onClick={loadProfile}
//               className="rounded-lg bg-[#0062a0] px-4 py-2 text-white"
//             >
//               Retry
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//               <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-[#0062a0]">
//                 {(profile.userName || "U").charAt(0).toUpperCase()}
//               </div>
//               <div className="min-w-0">
//                 <h2 className="truncate text-xl font-semibold text-slate-900">
//                   {profile.userName || "Account"}
//                 </h2>
//                 <p className="truncate text-sm text-slate-500">
//                   {profile.loginEmail}
//                 </p>
//                 <p className="mt-1 text-xs font-medium text-[#0062a0]">
//                   {profile.userTypeName}
//                 </p>
//               </div>
//             </div>

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//               <div className="mb-5 flex items-center justify-between gap-3">
//                 <div className="flex items-center gap-2">
//                   <UserRound size={21} className="text-[#0062a0]" />
//                   <h2 className="text-lg font-bold text-slate-800">
//                     Personal Details
//                   </h2>
//                 </div>
//                 {/* {!editing && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setName(profile.userName);
//                       setEditing(true);
//                       setNotice(null);
//                     }}
//                     className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0062a0] hover:bg-blue-50"
//                   >
//                     <Pencil size={16} /> Edit Details
//                   </button>
//                 )} */}
//               </div>

//               {!editing ? (
//                 <div className="grid gap-x-8 sm:grid-cols-2">
//                   <Detail label="User Name" value={profile.userName} />
//                   <Detail label="Email Address" value={profile.loginEmail} />
//                   <Detail label="User ID" value={profile.userId} />
//                   <Detail label="User Type" value={profile.userTypeName} />
//                   <Detail label="Company" value={profile.companyName} />
//                   <Detail
//                     label="Account Type"
//                     value={profile.isMainAdmin ? "Main Administrator" : "User"}
//                   />
//                   <Detail
//                     label="Status"
//                     value={
//                       profile.status === 1
//                         ? "Active"
//                         : profile.status === 0
//                           ? "Inactive"
//                           : "—"
//                     }
//                   />
//                 </div>
//               ) : (
//                 <form onSubmit={saveDetails} className="space-y-5">
//                   <label className="block max-w-lg space-y-2">
//                     <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
//                       User Name
//                     </span>
//                     <input
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0062a0] focus:ring-2 focus:ring-blue-100"
//                     />
//                   </label>
//                   <p className="text-xs text-slate-500">
//                     Email, user ID, role, company, account type and status are
//                     managed by the system.
//                   </p>
//                   <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
//                     <button
//                       type="button"
//                       disabled={saving}
//                       onClick={() => {
//                         setName(profile.userName);
//                         setEditing(false);
//                       }}
//                       className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700"
//                     >
//                       <X size={16} /> Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={saving}
//                       className="flex items-center gap-2 rounded-xl bg-[#0062a0] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
//                     >
//                       {saving ? (
//                         <Loader2 className="animate-spin" size={16} />
//                       ) : (
//                         <Check size={16} />
//                       )}
//                       Save Changes
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </section>

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
//               <div className="mb-2 flex items-center gap-2">
//                 <ShieldCheck size={21} className="text-[#0062a0]" />
//                 <h2 className="text-lg font-bold text-slate-800">
//                   Change Password
//                 </h2>
//               </div>
//               <p className="mb-6 text-sm text-slate-500">
//                 Enter your current password and choose a new password.
//               </p>
//               <form onSubmit={submitPassword} className="max-w-xl space-y-5">
//                 {[
//                   { name: "currentPassword", label: "Current Password" },
//                   { name: "newPassword", label: "New Password" },
//                   { name: "confirmPassword", label: "Confirm New Password" },
//                 ].map(({ name: fieldName, label }) => (
//                   <PasswordField
//                     key={fieldName}
//                     name={fieldName}
//                     label={label}
//                     value={password[fieldName]}
//                     visible={visible[fieldName]}
//                     disabled={changingPassword}
//                     onToggle={() =>
//                       setVisible((prev) => ({
//                         ...prev,
//                         [fieldName]: !prev[fieldName],
//                       }))
//                     }
//                     onChange={(event) =>
//                       setPassword((prev) => ({
//                         ...prev,
//                         [fieldName]: event.target.value,
//                       }))
//                     }
//                   />
//                 ))}
//                 <button
//                   type="submit"
//                   disabled={changingPassword}
//                   className="flex items-center gap-2 rounded-xl bg-[#0062a0] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
//                 >
//                   {changingPassword ? (
//                     <Loader2 size={17} className="animate-spin" />
//                   ) : (
//                     <KeyRound size={17} />
//                   )}
//                   Update Password
//                 </button>
//               </form>
//             </section>
//           </>
//         )}
//       </div>

//       <Confirmation_Popup
//         isOpen={confirmPopup}
//         onClose={() => {
//           if (!changingPassword) setConfirmPopup(false);
//         }}
//         onConfirm={handleConfirmPasswordChange}
//         title="Confirm Password Change"
//         message="Are you sure you want to change your password? You will be logged out and need to sign in again."
//         btnText="Change Password"
//       />

//       <Success_Popup
//         isOpen={successPopup}
//         onClose={handlePasswordSuccessClose}
//         title="Password Changed"
//         message={`${passwordSuccessMessage} Please sign in again using your new password.`}
//       />
//     </motion.div>
//   );
// };

// export default Profile;

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  UserRound,
  X,
  Mail,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  loginMeAPI,
  FirstTime_PasswordChange,
} from "../../../service/Login/Login";
import Confirmation_Popup from "../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../component/Popup_Models/Success_Popup";

// FUTURE: Enable editing when the profile-update API is finalized.
// import { updateMyProfile } from "../../../service/Login/profileService";
// import { Pencil, Check } from "lucide-react";

const EMPTY_PASSWORD = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const EMPTY_VISIBILITY = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
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

function Detail({ label, value }) {
  return (
    <div className="min-w-0 border-b border-slate-100 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-slate-800">
        {value === undefined || value === null || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  visible,
  onToggle,
  onChange,
  disabled,
}) {
  return (
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
          autoComplete={
            name === "currentPassword" ? "current-password" : "new-password"
          }
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#0062a0] focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
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
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState({ ...EMPTY_PASSWORD });
  const [visible, setVisible] = useState({ ...EMPTY_VISIBILITY });
  const [passwordError, setPasswordError] = useState("");
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await loginMeAPI();
      if (res?.data?.success === false || !res?.data?.data) {
        throw new Error(
          res?.data?.message || "Unable to load account details.",
        );
      }
      setProfile(normalizeProfile(res.data.data));
    } catch (error) {
      setNotice({ type: "error", message: getError(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!passwordModalOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !changingPassword && !confirmPopup)
        closePasswordModal();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // Escape handler should track the current modal and confirmation state.
  }, [passwordModalOpen, changingPassword, confirmPopup]);

  const openPasswordModal = () => {
    setPassword({ ...EMPTY_PASSWORD });
    setVisible({ ...EMPTY_VISIBILITY });
    setPasswordError("");
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (changingPassword || confirmPopup) return;
    setPasswordModalOpen(false);
    setPassword({ ...EMPTY_PASSWORD });
    setVisible({ ...EMPTY_VISIBILITY });
    setPasswordError("");
  };

  const submitPassword = (event) => {
    event.preventDefault();
    setPasswordError("");
    if (!profile?.loginEmail) {
      setPasswordError("Account email is missing.");
      return;
    }
    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      setPasswordError("Please fill all password fields.");
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (password.currentPassword === password.newPassword) {
      setPasswordError("New password must differ from the current password.");
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
      setPassword({ ...EMPTY_PASSWORD });
      setVisible({ ...EMPTY_VISIBILITY });
      setPasswordError("");
      setPasswordModalOpen(false);
      setPasswordSuccessMessage(
        res?.data?.message || "Password changed successfully.",
      );
      setSuccessPopup(true);
    } catch (error) {
      setPasswordError(getError(error));
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
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="rounded-xl border border-slate-200 bg-white p-3 text-[#0062a0] transition hover:bg-blue-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500">
              Your account information and security
            </p>
          </div>
        </header>

        {notice && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 text-sm ${notice.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}
          >
            {notice.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-20">
            <Loader2 className="animate-spin text-[#0062a0]" size={32} />
          </div>
        ) : !profile ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
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
          /* SINGLE CARD — all profile details and one top-right password action */
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-[#0062a0]">
                  {(profile.userName || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-bold text-slate-900">
                    {profile.userName || "Account"}
                  </h2>
                  <p className="flex items-center gap-1.5 break-all text-sm text-slate-500">
                    <Mail size={14} className="shrink-0" />{" "}
                    {profile.loginEmail || "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#0062a0]">
                    {profile.userTypeName || "User"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* FUTURE: Enable after edit details API is ready.
                <button type="button" onClick={openEditDetails} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0062a0]">Edit Details</button>
                */}
                <button
                  type="button"
                  onClick={openPasswordModal}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0062a0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f82] sm:w-auto"
                >
                  <KeyRound size={17} /> Change Password
                </button>
              </div>
            </div>
            <div className="p-5 sm:p-7">
              <div className="mb-3 flex items-center gap-2">
                <UserRound size={20} className="text-[#0062a0]" />
                <h3 className="text-base font-bold text-slate-800">
                  Personal Details
                </h3>
              </div>
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
                  value={
                    profile.status === 1
                      ? "Active"
                      : profile.status === 0
                        ? "Inactive"
                        : "—"
                  }
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Portal prevents parent transforms, animations and sidebar stacking contexts
          from hiding or briefly flashing the password dialog. */}
      {/* Hide the higher z-index password modal while confirming so the existing confirmation popup is clickable. */}
      {passwordModalOpen &&
        !confirmPopup &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-slate-950/55"
              onClick={closePasswordModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-dialog-title"
              className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              style={{ maxHeight: "calc(100dvh - 24px)" }}
            >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-[#0062a0]">
                    <LockKeyhole size={21} />
                  </div>
                  <div>
                    <h2
                      id="password-dialog-title"
                      className="text-lg font-bold text-slate-900"
                    >
                      Change Password
                    </h2>
                    <p className="text-xs text-slate-500 sm:text-sm">
                      Enter your current password and a new password.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  disabled={changingPassword || confirmPopup}
                  onClick={closePasswordModal}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={submitPassword} className="flex min-h-0 flex-col">
                <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                  {passwordError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                    >
                      {passwordError}
                    </div>
                  )}
                  {[
                    { name: "currentPassword", label: "Current Password" },
                    { name: "newPassword", label: "New Password" },
                    { name: "confirmPassword", label: "Confirm New Password" },
                  ].map(({ name, label }) => (
                    <PasswordField
                      key={name}
                      name={name}
                      label={label}
                      value={password[name]}
                      visible={visible[name]}
                      disabled={changingPassword || confirmPopup}
                      onToggle={() =>
                        setVisible((prev) => ({ ...prev, [name]: !prev[name] }))
                      }
                      onChange={(event) => {
                        setPassword((prev) => ({
                          ...prev,
                          [name]: event.target.value,
                        }));
                        if (passwordError) setPasswordError("");
                      }}
                    />
                  ))}
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    disabled={changingPassword || confirmPopup}
                    onClick={closePasswordModal}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword || confirmPopup}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0062a0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004f82] disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <KeyRound size={17} />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {createPortal(
        <>
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
        </>,
        document.body,
      )}
    </div>
  );
}
