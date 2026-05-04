import { motion } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Minus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Button from '../../../../component/button/Buttons';
import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"

// API Service
import { user_master_getID } from "../../../../service/Master_Services/Master_Services";
import { useDispatch, useSelector } from 'react-redux';

const UserMaster_View = () => {
  const location = useLocation();
  const navigate = useNavigate();
          const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[2] || {};
  console.log("Permissions in User Master:", userPermissions);
  
  // Define permission checks
  const canEdit = userPermissions?.edit || false;
  
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);
  
  // Extract rowId passed from the parent Master table
  const { rowId } = location?.state || {};

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // --- 1. FETCH DATA BY ID ---
  useEffect(() => {
    const fetchData = async () => {
      if (!rowId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await user_master_getID(rowId);
        
        // As per your JSON structure: res.data.data.users
        const fetchedUser = res?.data?.data?.users;
        setUserData(fetchedUser);
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  },[rowId]);

  // --- FORMATTING HELPERS ---
  const formatModuleName = (name) => {
    if (!name) return "";
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  };

  // Helper component for Information Fields
  const InfoField = ({ label, value, isPassword = false }) => (
    <div className="flex flex-col gap-1 group">
      <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">{label}</span>
      <div className="flex items-center gap-2">
        {isPassword ? (
          <>
            <button 
              onClick={() => setShowPassword(!showPassword)} 
              className="text-slate-400 hover:text-[#0062a0] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <span className="text-slate-800 font-bold text-[16px]">
              {showPassword ? value : "••••••••"}
            </span>
          </>
        ) : (
          <span className="text-slate-800 font-bold text-[15px] group-hover:text-[#0062a0] transition-colors break-words">
            {value || '---'}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#0062a0]" size={40} />
          <p className="text-slate-500 font-medium">Loading User Profile...</p>
        </div>
      </div>
    );
  }

  if (!userData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-4">
        <p className="text-red-500 font-bold text-lg">User not found or ID is missing.</p>
        <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
      </div>
    );
  }

  // Extract permissions securely
  const permissionsData = userData?.permissions ||[];

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 font-sans text-slate-900"
    >
      <div className="max-w-full mx-auto">
        
        {/* Header Section */}
        <motion.header variants={itemVariants} className="flex items-center justify-between mb-8">
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
              <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
                {userData?.userName || "Unknown User"}
              </h1>
              <p className="text-[#0062a0] font-medium text-sm">User Master / View</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${userData?.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {userData?.status === 1 ? 'Active' : 'Inactive'}
             </div>
             <Button disabled={!canEdit}
                onClick={() => navigate('../user-create', { state: { rowId: rowId, mode: 'edit' } })}
                variant="primary"
              >
                Edit Profile
              </Button>
          </div>
        </motion.header>

        <div className="space-y-8 pb-10">
          
          {/* Quick ID Card */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <InfoField label="User ID" value={userData?.userId} />
              <InfoField label="Created On" value={formatDate(userData?.createdAt)} />
              <InfoField label="Last Updated" value={formatDate(userData?.updatedAt)} />
              <InfoField label="User Type (Role)" value={userData?.userTypeId?.userTypeName || userData?.userType} />
            </div>
          </motion.div>

          {/* User Contact Details */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-50 bg-white">
              <h2 className="text-[#0062a0] font-bold text-lg">Contact Details</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
              <InfoField label="User Name" value={userData?.userName} />
              <InfoField label="Login Email" value={userData?.loginEmail} />
              <InfoField label="Mobile Number" value={userData?.mobile ? `+91 ${userData.mobile}` : "---"} />
            </div>
          </motion.div>

          {/* Work Profile */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-50 bg-white">
              <h2 className="text-[#0062a0] font-bold text-lg">Work Profile</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
              <InfoField label="Position" value={userData?.position} />
              <InfoField label="Department" value={userData?.department} />
              <InfoField label="Linked Company" value={userData?.customerId?.companyName || userData?.companyName} />
            </div>
          </motion.div>

          {/* Security Config (Read-Only Permissions Table) */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-50 bg-white flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                 <ShieldCheck className="text-[#0062a0]" size={20} />
              </div>
              <h2 className="text-[#0062a0] font-bold text-lg">Security Config</h2>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-slate-400 font-bold uppercase text-xs tracking-widest border-r border-slate-50">
                      Module Name
                    </th>
                    {['Create', 'View', 'Edit', 'Delete'].map((head) => (
                      <th key={head} className="p-4 text-slate-400 font-bold text-center border-r last:border-r-0 border-slate-50 uppercase text-xs tracking-widest">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {permissionsData.length > 0 ? (
                    permissionsData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-slate-700 font-bold border-r border-slate-50">
                          {formatModuleName(item.module)}
                        </td>
                        {['create', 'view', 'edit', 'delete'].map((field) => (
                          <td key={field} className="p-4 text-center border-r last:border-r-0 border-slate-50">
                            <div className="flex justify-center items-center">
                              {item[field] ? (
                                <div className="bg-green-100 text-green-600 p-1.5 rounded-md">
                                  <Check size={16} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="bg-slate-100 text-slate-300 p-1.5 rounded-md">
                                  <Minus size={16} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                        No permissions configured for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default UserMaster_View;