import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import { user_Permission_create } from "../../../../service/Master_Services/Master_Services";
import Overall_Permissions from "../../Overall_Permissions/OverAll_Permissions/Overall_Permissions";

const toModuleList = (items) => {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items.filter((item) => {
    const module = typeof item?.module === "string" ? item.module.trim() : "";
    if (!module || seen.has(module)) return false;
    seen.add(module);
    return true;
  }).map(({ module }) => module.trim());
};

const INITIAL_ACTIONS = { create: false, view: false, edit: false, delete: false };
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const User_Create = () => {
  const navigate = useNavigate();
  const { permissions: reduxPermissions = [], loading: reduxLoading = false, initialized, error: reduxError } =
    useSelector((state) => state.permissions ?? {});
  const moduleNames = useMemo(() => toModuleList(reduxPermissions), [reduxPermissions]);
  const moduleKey = moduleNames.join("\u0000");
  const [typeName, setTypeName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ open: false, message: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({ open: false, message: "" });
  const permissionsReady = !reduxLoading && initialized !== false && !reduxError && moduleNames.length > 0;

  // Sync module catalog without discarding selections if Redux refreshes.
  useEffect(() => {
    if (!permissionsReady) return;
    setPermissions((previous) => {
      const previousMap = new Map(previous.map((item) => [item.module, item]));
      return moduleNames.map((module) => ({
        module,
        ...INITIAL_ACTIONS,
        ...(previousMap.get(module) || {}),
      }));
    });
  }, [moduleKey, permissionsReady]);

  const showError = (message) => setErrorPopup({ open: true, message });

  const handleTriggerConfirm = () => {
    if (loading) return;
    if (!permissionsReady || !permissions.length) return showError("Permission modules are not ready in Redux.");
    if (!typeName.trim()) return showError("Please enter a User Type Name before creating.");
    setConfirmPopup({ open: true, message: `Are you sure you want to create the "${typeName.trim()}" role?` });
  };

  const handleCreatePermission = async () => {
    if (loading || !permissionsReady || !permissions.length || !typeName.trim()) return;
    setConfirmPopup({ open: false, message: "" });
    setLoading(true);
    try {
      const payload = {
        userTypeName: typeName.trim().toUpperCase(),
        permissions: permissions.map((item) => ({
          module: item.module,
          create: item.create === true,
          view: item.view === true,
          edit: item.edit === true,
          delete: item.delete === true,
        })),
      };
      const res = await user_Permission_create(payload);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to create user role.");
      setSuccessPopup({ open: true, message: res.data.message || "Role created successfully!" });
    } catch (err) {
      showError(err?.response?.data?.data?.message || err?.response?.data?.message || err?.message || "Failed to create user role.");
    } finally {
      setLoading(false);
    }
  };

  if (reduxLoading || initialized === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfdfe]">
        <Loader2 className="animate-spin text-[#0062a0]" size={40} />
        <span className="ml-3 text-slate-500">Loading available permissions...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] p-6 font-sans">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-full">
        <header className="mb-8 flex items-center gap-4">
          <motion.button type="button" whileHover={{ scale: 1.1, backgroundColor: "#e0f2fe" }}
            whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="cursor-pointer rounded-2xl p-3 text-[#0062a0] transition-all">
            <ArrowLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">Create User Role</h1>
            <p className="text-sm text-slate-500">Define module access for new user types</p>
          </div>
        </header>

        <div className="space-y-6">
          <motion.div variants={sectionVariants} className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="max-w-md">
              <ReUsableInput_Fields type="text" label="User Type Name" placeholder="e.g. ADMIN, SUPERVISOR"
                value={typeName} onChange={(e) => setTypeName(e.target.value)} />
            </div>
          </motion.div>

          <motion.div variants={sectionVariants} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            {!permissionsReady ? (
              <p className="p-6 text-sm text-red-600">{typeof reduxError === "string" ? reduxError : "No permission modules found in Redux."}</p>
            ) : (
              <Overall_Permissions permissions={permissions} setPermissions={setPermissions} />
            )}
          </motion.div>

          <motion.div variants={sectionVariants} className="mt-10 flex items-center justify-end gap-4 pb-10">
            <Button variant="secondary" onClick={() => navigate(-1)} className="px-10" disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleTriggerConfirm} className="px-10"
              disabled={loading || !permissionsReady || !permissions.length}>
              {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} />Processing...</span> : "Create Role"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <Confirmation_Popup isOpen={confirmPopup.open} onClose={() => setConfirmPopup({ open: false, message: "" })}
        onConfirm={handleCreatePermission} message={confirmPopup.message} />
      <Success_Popup isOpen={successPopup.open} onClose={() => { setSuccessPopup({ open: false, message: "" }); navigate(-1); }}
        message={successPopup.message} />
      <ErrorMessage_Popup isOpen={errorPopup.open} onClose={() => setErrorPopup({ open: false, message: "" })}
        message={errorPopup.message} />
    </div>
  );
};

export default User_Create;
