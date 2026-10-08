import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import { user_Permission_delete, user_Permission_update, user_Permission_view } from "../../../../service/Master_Services/Master_Services";
import Overall_Permissions from "../../Overall_Permissions/OverAll_Permissions/Overall_Permissions";

const ACTIONS = ["create", "view", "edit", "delete"];
const EMPTY_PERMISSIONS = [];
const normalizeModule = (value) => String(value ?? "").trim().toLowerCase();
const getErrorMessage = (err, fallback) => err?.response?.data?.data?.message || err?.response?.data?.message || err?.message || fallback;
const normalizePermissions = (items) => (Array.isArray(items) ? items : [])
  .filter((item) => typeof item?.module === "string" && item.module.trim())
  .map((item) => ({ module: item.module, ...Object.fromEntries(ACTIONS.map((key) => [key, item[key] === true])) }));

// Redux supplies module names; role API supplies saved checked values.
// Preserve role modules not present in Redux so an edit does not silently remove them.
const mergePermissions = (available, saved) => {
  const savedItems = normalizePermissions(saved);
  const savedMap = new Map(savedItems.map((item) => [normalizeModule(item.module), item]));
  const names = new Map();
  normalizePermissions(available).forEach((item) => names.set(normalizeModule(item.module), item.module));
  savedItems.forEach((item) => {
    if (!names.has(normalizeModule(item.module))) names.set(normalizeModule(item.module), item.module);
  });
  return Array.from(names, ([key, module]) => {
    const previous = savedMap.get(key);
    return { module, ...Object.fromEntries(ACTIONS.map((action) => [action, previous?.[action] === true])) };
  });
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const sectionVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

const User_ViewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const rowID = state?.rowID;
  const reduxPermissions = useSelector((s) => s.permissions?.permissions ?? EMPTY_PERMISSIONS);
  const reduxLoading = useSelector((s) => s.permissions?.loading ?? false);
  const reduxInitialized = useSelector((s) => s.permissions?.initialized);
  const reduxError = useSelector((s) => s.permissions?.error);
  const availablePermissions = useMemo(() => normalizePermissions(reduxPermissions), [reduxPermissions]);

  const [typeName, setTypeName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [savedPermissions, setSavedPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [successPopup, setSuccessPopup] = useState({ open: false, message: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({ open: false, message: "" });

  // Fetch only selected role; never re-fetch /me on this page.
  useEffect(() => {
    if (!rowID) {
      setLoadError("Role ID is missing. Open this page from the role list.");
      setLoading(false);
      return;
    }
    let active = true;
    const fetchRole = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const response = await user_Permission_view(rowID);
        if (!active) return;
        if (response?.data?.success === false || !response?.data?.data) throw new Error(response?.data?.message || "Role not found.");
        const role = response.data.data;
        setTypeName(role.userTypeName || "");
        setSavedPermissions(Array.isArray(role.permissions) ? role.permissions : []);
      } catch (err) {
        if (!active) return;
        const message = getErrorMessage(err, "Failed to fetch role details.");
        setLoadError(message);
        setErrorPopup({ open: true, message });
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRole();
    return () => { active = false; };
  }, [rowID]);

  // Merge once role and central Redux modules are ready. Avoid resetting user edits on unrelated renders.
  useEffect(() => {
    if (reduxLoading || reduxInitialized === false || savedPermissions === null) return;
    setPermissions((current) => {
      const source = current.length ? current : savedPermissions;
      return mergePermissions(availablePermissions, source);
    });
  }, [availablePermissions, reduxLoading, reduxInitialized, savedPermissions]);

  const permissionReady = !reduxLoading && reduxInitialized !== false && availablePermissions.length > 0 && savedPermissions !== null;
  const busy = btnLoading || loading;
  const showError = (message) => setErrorPopup({ open: true, message });

  const handleUpdate = async () => {
    if (busy || loadError || !permissionReady || !rowID) return;
    if (!typeName.trim()) return showError("Please enter a User Type Name.");
    if (!permissions.length) return showError("No permissions are available for this role.");
    setBtnLoading(true);
    try {
      const payload = { userTypeName: typeName.trim().toUpperCase(), permissions: normalizePermissions(permissions) };
      const response = await user_Permission_update(rowID, payload);
      if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to update role permissions.");
      setSuccessPopup({ open: true, message: response.data.message || "Permissions updated successfully!" });
    } catch (err) {
      showError(getErrorMessage(err, "Update failed."));
    } finally {
      setBtnLoading(false);
    }
  };

  const triggerDeleteConfirm = () => {
    if (busy || loadError || !rowID) return;
    setConfirmPopup({ open: true, message: `Are you sure you want to delete the role "${typeName}"?` });
  };

  const executeDelete = async () => {
    if (busy || loadError || !rowID) return;
    setConfirmPopup({ open: false, message: "" });
    setBtnLoading(true);
    try {
      const response = await user_Permission_delete(rowID);
      if (!response?.data?.success) throw new Error(response?.data?.message || "Failed to delete role.");
      setSuccessPopup({ open: true, message: response.data.message || "Role deleted successfully!" });
    } catch (err) {
      showError(getErrorMessage(err, "Delete failed."));
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading || reduxLoading || (reduxInitialized === false && !loadError)) {
    return <div className="flex min-h-screen items-center justify-center gap-3 bg-[#f8fafc] text-slate-500"><Loader2 className="animate-spin text-[#0062a0]" size={32} />Loading role permissions...</div>;
  }

  if (loadError || reduxError || !permissionReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8fafc] p-6">
        <p className="text-center text-sm text-red-600">{loadError || reduxError || "No permission modules found in Redux. Initialize permissions after login."}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
        <ErrorMessage_Popup isOpen={errorPopup.open} onClose={() => setErrorPopup({ open: false, message: "" })} message={errorPopup.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button type="button" whileHover={{ scale: 1.1, backgroundColor: "#e0f2fe" }} whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="cursor-pointer rounded-2xl p-3 text-[#0062a0] transition-all"><ArrowLeft size={24} /></motion.button>
            <div><h1 className="text-2xl font-bold tracking-tight text-slate-800">Edit Permission</h1><p className="text-sm font-medium text-[#0062a0]">Role: {typeName}</p></div>
          </div>
          <button type="button" onClick={triggerDeleteConfirm} disabled={busy} className="flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-red-500 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={20} />Delete Role</button>
        </header>
        <div className="space-y-6">
          <motion.div variants={sectionVariants} className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="max-w-md"><ReUsableInput_Fields type="text" label="User Type Name" value={typeName} onChange={(e) => setTypeName(e.target.value)} /></div>
          </motion.div>
          <motion.div variants={sectionVariants} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <Overall_Permissions permissions={permissions} setPermissions={setPermissions} />
          </motion.div>
          <motion.div variants={sectionVariants} className="mt-10 flex items-center justify-end gap-4 pb-10">
            <Button variant="secondary" onClick={() => navigate(-1)} className="px-10" disabled={busy}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdate} className="px-10" disabled={busy || !permissions.length}>{btnLoading ? <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" />Processing...</span> : "Save Changes"}</Button>
          </motion.div>
        </div>
      </motion.div>
      <Success_Popup isOpen={successPopup.open} onClose={() => { setSuccessPopup({ open: false, message: "" }); navigate(-1); }} message={successPopup.message} />
      <ErrorMessage_Popup isOpen={errorPopup.open} onClose={() => setErrorPopup({ open: false, message: "" })} message={errorPopup.message} />
      <Confirmation_Popup isOpen={confirmPopup.open} onClose={() => setConfirmPopup({ open: false, message: "" })} onConfirm={executeDelete} message={confirmPopup.message} />
    </div>
  );
};

export default User_ViewPage;
