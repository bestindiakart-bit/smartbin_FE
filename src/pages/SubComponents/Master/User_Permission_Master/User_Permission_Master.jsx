import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";
import {
  user_Permission_delete,
  user_Permission_get
} from "../../../../service/Master_Services/Master_Services";
import { useDispatch, useSelector } from "react-redux";

const User_Permission_Master = () => {
  const navigate = useNavigate();
      const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[5] || {};
  console.log("Permissions in User Master:", userPermissions);
  
  // Define permission checks
  const canView = userPermissions?.view ||  false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // --- 1. INITIALIZE ALL STATES AT THE TOP ---
  const [perData, setPerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Moved up to fix ReferenceError
  
  const [successPopup, setSuccessPopup] = useState({ open: false, message: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({ open: false, message: "", id: null });

  // --- 2. CALCULATE DERIVED VALUES (Memoized) ---
  const filteredData = useMemo(() => {
    return perData.filter((item) =>
      item.userTypeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, perData]);

  const MAX_PERMISSIONS = 4;
  const isLimitReached = perData.length >= MAX_PERMISSIONS;

  // --- 3. API CALL: FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await user_Permission_get();
      if (res?.data?.success) {
        setPerData(res?.data?.data || []);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Failed to fetch permissions";
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // --- 4. API CALL: DELETE ROLE ---
  const handleDeleteExecute = async () => {
    try {
      const res = await user_Permission_delete(confirmPopup.id);
      if (res?.data?.success) {
        setConfirmPopup({ open: false, message: "", id: null });
        setSuccessPopup({ 
          open: true, 
          message: res?.data?.message || "Role deleted successfully" 
        });
        fetchData(); // Refresh list
      }
    } catch (err) {
      setConfirmPopup({ open: false, message: "", id: null });
      const errMsg = err?.response?.data?.message || "Error deleting role";
      setErrorPopup({ open: true, message: errMsg });
    }
  };

  // --- 5. EFFECTS ---
  useEffect(() => { 
    fetchData(); 
  }, []);

  // --- 6. ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0, 
      transition: { type: 'spring', stiffness: 260, damping: 20 } 
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.1 } }
  };

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] font-sans"
    >
      <div className="max-w-full mx-auto">
        
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User Permission <span className="text-[#0062a0]">Master</span></h1>
            <p className="text-[#0062a0] font-medium mt-1">Access Control & Roles</p>
          </div>
          
          {!loading && (
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <span className={`text-sm font-bold ${isLimitReached ? 'text-red-500' : 'text-[#0062a0]'}`}>
                {perData.length} / {MAX_PERMISSIONS} Roles Defined
              </span>
            </div>
          )}
        </motion.div>

        {/* ACTIONS BAR */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6 relative z-50">
          <div className="w-full lg:max-w-md">
            <SearchBar 
              value={searchTerm} 
              onChange={(val) => setSearchTerm(val)} 
              onClear={() => setSearchTerm("")}
              placeholder="Search by role name..."
            />
          </div>

          <div className="flex items-center gap-4">
            <motion.div whileHover={!isLimitReached ? { scale: 1.02 } : {}} whileTap={!isLimitReached ? { scale: 0.98 } : {}}>
              <Button 
                onClick={() => !isLimitReached && navigate("user-create")} 
                variant={isLimitReached ? "secondary" : "primary"}
                className={isLimitReached ? "opacity-50 cursor-not-allowed grayscale" : "shadow-md"}
                disabled={isLimitReached && !canCreate}  
              >
                {isLimitReached ? "Role Limit Reached" : "+ Create Permission"}
              </Button>
            </motion.div>
            <Download_Button disabled={!canView} onClick={() => setSuccessPopup({ open: true, message: "Report generated successfully!" })} />
          </div>
        </motion.div>

        {/* GRID CONTENT */}
        <AnimatePresence>
          {loading ? (
  <div className="flex justify-center py-20">
    <div className="w-10 h-10 border-4 border-t-[#0062a0] rounded-full animate-spin"></div>
  </div>
) : (
  <motion.div
    layout
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
  >
              {filteredData.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center shadow-sm hover:shadow-xl transition-all group relative"
                >
                  <button 
                    onClick={() => setConfirmPopup({ 
                      open: true, 
                      message: `Are you sure you want to delete ${item.userTypeName}?`, 
                      id: item._id 
                    })}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="relative mb-4">
                    <span className="text-6xl font-black text-slate-900 leading-none group-hover:text-[#0062a0] transition-colors">{index + 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-500 mb-8 uppercase tracking-widest text-center">
                    {item.userTypeName?.replace("_", " ")}
                  </h3>
                  <Button disabled={!canEdit} onClick={() => navigate('user-view', { state: { rowID: item._id } })} variant="primary" className="w-full">
                    Edit Role
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {!loading && filteredData.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate-400 italic">
            No roles found matching "{searchTerm}"
          </motion.div>
        )}
      </div>

      {/* POPUP COMPONENTS */}
      <Success_Popup 
        isOpen={successPopup.open} 
        onClose={() => setSuccessPopup({ ...successPopup, open: false })} 
        message={successPopup.message} 
      />

      <ErrorMessage_Popup 
        isOpen={errorPopup.open} 
        onClose={() => setErrorPopup({ ...errorPopup, open: false })} 
        message={errorPopup.message} 
      />

      <Confirmation_Popup 
        isOpen={confirmPopup.open} 
        onClose={() => setConfirmPopup({ ...confirmPopup, open: false })} 
        onConfirm={handleDeleteExecute} 
        message={confirmPopup.message} 
      />
    </motion.div>
  );
};

export default User_Permission_Master;