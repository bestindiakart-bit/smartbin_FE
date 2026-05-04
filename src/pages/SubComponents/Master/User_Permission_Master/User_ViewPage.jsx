import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Project Components
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";

// API Services
import {
  user_Permission_delete,
  user_Permission_update,
  user_Permission_view
} from '../../../../service/Master_Services/Master_Services';
import Overall_Permissions from "../../Overall_Permissions/OverAll_Permissions/Overall_Permissions";

const User_ViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rowID } = location.state || {};

  // Data States
  const [typeName, setTypeName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // --- POPUP STATES ---
  const [successPopup, setSuccessPopup] = useState({ open: false, message: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({ open: false, message: "" });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  // useEffect(() => {
  //   if(successPopup.open){
  //     const timer = setTimeout(() => {
  //       setSuccessPopup({ ...successPopup, open: false });
  //       navigate(-1);
  //     }, 2000);
  //     return () => clearTimeout(timer);
  //   }
  // })

  // --- 1. FETCH DETAILS ON MOUNT ---
  useEffect(() => {
    if (!rowID) {
      navigate(-1);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await user_Permission_view(rowID);
        const data = res.data.data;
        setTypeName(data.userTypeName);
        setPermissions(data.permissions || []);
      } catch (err) {
        const errMsg = err?.response?.data?.message || "Error fetching details";
        setErrorPopup({ open: true, message: errMsg });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [rowID, navigate]);

  // --- 2. HANDLE UPDATE ---
  const handleUpdate = async () => {
    try {
      setBtnLoading(true);
      const payload = {
        userTypeName: typeName,
        permissions: permissions 
      };
      const res = await user_Permission_update(rowID, payload);
      if (res?.data?.success) {
        setSuccessPopup({ 
          open: true, 
          message: res?.data?.message || "Permissions updated successfully!" 
        });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Update failed";
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setBtnLoading(false);
    }
  };

  // --- 3. HANDLE DELETE (CONFIRMATION) ---
  const triggerDeleteConfirm = () => {
    setConfirmPopup({ 
      open: true, 
      message: `Are you sure you want to delete the role "${typeName}"?` 
    });
  };

  const executeDelete = async () => {
    try {
      setConfirmPopup({ ...confirmPopup, open: false });
      setBtnLoading(true);
      const res = await user_Permission_delete(rowID);
      if (res?.data?.success) {
        // We show success and the popup onClose handles the navigation back
        setSuccessPopup({ 
          open: true, 
          message: res?.data?.message || "Role deleted successfully" 
        });
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Delete failed";
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#0062a0]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w- mx-auto"
      >
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#e0f2fe' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-3 text-[#0062a0] rounded-2xl transition-all cursor-pointer"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Edit Permission
              </h1>
              <p className="text-[#0062a0] font-medium text-sm lowercase tracking-wider">Role: {typeName}</p>
            </div>
          </div>
          <button 
            onClick={triggerDeleteConfirm} 
            className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 p-3 px-5 rounded-xl transition-all active:scale-95"
          >
            <Trash2 size={20} />
            Delete Role
          </button>
        </header>

        <div className="space-y-6">
          {/* Role Name Input */}
          <motion.div variants={sectionVariants} className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm">
            <div className="max-w-md">
              <ReUsableInput_Fields
                label="User Type Name"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Permissions Table */}
          <motion.div variants={sectionVariants} className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <Overall_Permissions 
               permissions={permissions} 
               setPermissions={setPermissions} 
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={sectionVariants} className="flex items-center gap-4 justify-end mt-10 pb-10">
            <Button variant="secondary" onClick={() => navigate(-1)} className="px-10">Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleUpdate} 
              className="px-10" 
              disabled={btnLoading}
            >
              {btnLoading ? "Processing..." : "Save Changes"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* --- POPUPS --- */}

      {/* 1. Success Popup */}
      <Success_Popup
        isOpen={successPopup.open}
        onClose={() => {
          setSuccessPopup({ ...successPopup, open: false });
          navigate(-1);
        }}
        message={successPopup.message}
      />

      {/* 2. Error Popup */}
      <ErrorMessage_Popup 
        isOpen={errorPopup.open} 
        onClose={() => setErrorPopup({ ...errorPopup, open: false })} 
        message={errorPopup.message} 
      />

      {/* 3. Confirmation Popup */}
      <Confirmation_Popup 
        isOpen={confirmPopup.open} 
        onClose={() => setConfirmPopup({ ...confirmPopup, open: false })} 
        onConfirm={executeDelete} 
        message={confirmPopup.message} 
      />
    </div>
  );
};

export default User_ViewPage;