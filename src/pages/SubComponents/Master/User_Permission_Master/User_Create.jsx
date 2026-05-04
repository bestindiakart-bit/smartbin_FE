import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Project Components
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";

// API Services
import { user_Permission_create } from "../../../../service/Master_Services/Master_Services";
import Overall_Permissions from "../../Overall_Permissions/OverAll_Permissions/Overall_Permissions";

const User_Create = () => {
  const navigate = useNavigate();
  
  // --- POPUP STATES ---
  const [successPopup, setSuccessPopup] = useState({ open: false, message: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({ open: false, message: "" });
  
  const [loading, setLoading] = useState(false);

  // --- STATE FOR API PAYLOAD ---
  const [typeName, setTypeName] = useState("");
  const [permissions, setPermissions] = useState([
    { module: "dashboard", create: false, view: false, edit: false, delete: false },
    { module: "customer_master", create: false, view: false, edit: false, delete: false },
    { module: "user_master", create: false, view: false, edit: false, delete: false },
    { module: "project_master", create: false, view: false, edit: false, delete: false },
    { module: "item_master", create: false, view: false, edit: false, delete: false },
    { module: "user_type_permission_master", create: false, view: false, edit: false, delete: false },
    { module: "warehouse_order_details", create: false, view: false, edit: false, delete: false },
    { module: "bin_configuration", create: false, view: false, edit: false, delete: false },
    { module: "bill_of_materials", create: false, view: false, edit: false, delete: false },
    { module: "forecast_viewer", create: false, view: false, edit: false, delete: false },
    { module: "smart_bin_dashboard", create: false, view: false, edit: false, delete: false },
    { module: "overall_report", create: false, view: false, edit: false, delete: false },
    { module: "warehouse_creation", create:false, view: false, edit: false, delete: false},
  ]);

  // --- TRIGGER CONFIRMATION ---
  const handleTriggerConfirm = () => {
    if (!typeName.trim()) {
      setErrorPopup({ open: true, message: "Please enter a User Type Name before creating." });
      return;
    }
    setConfirmPopup({ open: true, message: `Are you sure you want to create the "${typeName}" role?` });
  };

  // --- FINAL API CALL ---
  const handleCreatePermission = async () => {
    setConfirmPopup({ ...confirmPopup, open: false });
    setLoading(true);
    
    try {
      const payload = {
        userTypeName: typeName.toUpperCase(),
        permissions: permissions
      };
      
      const res = await user_Permission_create(payload);
      
      if (res?.data?.success) {
        setSuccessPopup({ 
          open: true, 
          message: res?.data?.message || "Role created successfully!" 
        });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to create user permission.";
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto"
      >
        {/* --- HEADER SECTION --- */}
        <header className="flex items-center gap-4 mb-8">
          <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#e0f2fe' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-3 text-[#0062a0] rounded-2xl transition-all cursor-pointer"
            >
              <ArrowLeft size={24} />
            </motion.button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Create User Role
            </h1>
            <p className="text-slate-500 text-sm">Define module access for new user types</p>
          </div>
        </header>

        {/* --- FORM SECTION --- */}
        <div className="space-y-6">
          
          {/* Card 1: Role Name */}
          <motion.div variants={sectionVariants} className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <div className="max-w-md">
              <ReUsableInput_Fields
                type="text"
                label="User Type Name"
                placeholder="e.g. ADMIN, SUPERVISOR"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Card 2: Permissions Table */}
          <motion.div variants={sectionVariants} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <Overall_Permissions 
              permissions={permissions} 
              setPermissions={setPermissions} 
            />
          </motion.div>

          {/* --- ACTION BUTTONS --- */}
          <motion.div 
            variants={sectionVariants}
            className="flex items-center gap-4 justify-end mt-10 pb-10"
          >
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              className="px-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTriggerConfirm}
              variant="primary"
              className="px-10"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing...</span>
                </div>
              ) : "Create Role"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* --- POPUPS --- */}

      {/* 1. Confirmation Popup */}
      <Confirmation_Popup
        isOpen={confirmPopup.open}
        onClose={() => setConfirmPopup({ ...confirmPopup, open: false })}
        onConfirm={handleCreatePermission}
        message={confirmPopup.message}
      />

      {/* 2. Success Popup */}
      <Success_Popup
        isOpen={successPopup.open}
        onClose={() => {
          setSuccessPopup({ ...successPopup, open: false });
          navigate(-1);
        }}
        message={successPopup.message}
      />

      {/* 3. Error Popup */}
      <ErrorMessage_Popup 
        isOpen={errorPopup.open} 
        onClose={() => setErrorPopup({ ...errorPopup, open: false })} 
        message={errorPopup.message} 
      />

    </div>
  );
};

export default User_Create;