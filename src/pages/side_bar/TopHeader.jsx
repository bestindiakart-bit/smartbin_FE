import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  Info,
  LogOut,
  Menu,
  Settings,
  User
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LogoSmartBin from "../../assets/LogoSmartBin.svg";
import { useNavigate } from "react-router-dom";

const TopHeader = ({ toggleMobileSidebar, isCollapsed, isLoading }) => {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notification' | 'profile' | null
  const dropdownContainerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current && 
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  },[]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  // Modern spring animation for dropdowns
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: 15, 
      scale: 0.95, 
      transformOrigin: "top right" 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shadow-sm z-30">
      <div className="flex items-center gap-6">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={toggleMobileSidebar} 
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Logo shows here ONLY when Sidebar is collapsed */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="hidden lg:flex items-center"
            >
              {isLoading ? (
                <div className="w-32 h-8 bg-gray-200 rounded-md animate-pulse" />
              ) : (
                <img src={LogoSmartBin} alt="SmartBin" className="w-32" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-5" ref={dropdownContainerRef}>
        {isLoading ? (
          // Skeleton for Right Side (Bell + User Profile)
          <>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
              <div className="hidden sm:flex flex-col gap-1 items-end">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-11 h-11 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </>
        ) : (
          <>
            {/* --- NOTIFICATION DROPDOWN --- */}
            <div className="relative">
              <div 
                onClick={() => toggleDropdown('notification')}
                className={`relative p-2.5 rounded-full cursor-pointer transition-colors ${
                  activeDropdown === 'notification' 
                    ? 'bg-blue-100 text-[#004e80]' 
                    : 'bg-blue-50 text-[#0062a0] hover:bg-blue-100'
                }`}
              >
                <Bell size={22} />
                {/* Red dot indicator */}
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </div>

              <AnimatePresence>
                {activeDropdown === 'notification' && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <span className="font-bold text-gray-800">Notifications</span>
                      <span className="text-xs text-blue-600 cursor-pointer hover:underline font-semibold">Mark all as read</span>
                    </div>
                    
                    <div className="max-h-[320px] overflow-y-auto no-scrollbar">
                      {/* Notification Item 1 */}
                      <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4">
                        <div className="mt-0.5 bg-green-100 p-2 rounded-full h-fit text-green-600">
                          <CheckCircle size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Order #1234 Processed</p>
                          <p className="text-sm text-gray-500 mt-0.5 leading-snug">Warehouse order has been successfully processed and updated.</p>
                          <p className="text-[11px] font-medium text-gray-400 mt-1.5">Just now</p>
                        </div>
                      </div>

                      {/* Notification Item 2 */}
                      <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4">
                        <div className="mt-0.5 bg-blue-100 p-2 rounded-full h-fit text-blue-600">
                          <Info size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">System Update Completed</p>
                          <p className="text-sm text-gray-500 mt-0.5 leading-snug">Smart Bin forecast module has been updated to v2.4.</p>
                          <p className="text-[11px] font-medium text-gray-400 mt-1.5">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 text-center border-t border-gray-50 bg-gray-50/30">
                      <button className="text-sm text-blue-600 font-bold hover:text-blue-800 transition-colors">
                        View All Activity
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* --- PROFILE DROPDOWN --- */}
            <div className="relative border-l border-gray-100 pl-3">
              <div 
                onClick={() => toggleDropdown('profile')}
                className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-xl transition-all ${
                  activeDropdown === 'profile' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-tight">Smart Bin</p>
                  <p className="text-xs text-gray-400 font-medium">Administrator</p>
                </div>
                <div className="w-11 h-11 rounded-full border-2 border-blue-50 p-0.5 overflow-hidden bg-white shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=Smart+Bin&background=0062a0&color=fff" alt="User" className="w-full h-full rounded-full object-cover" />
                </div>
              </div>

              <AnimatePresence>
                {activeDropdown === 'profile' && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Header profile details */}
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-base font-bold text-gray-800">Smart Bin Admin</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">admin@smartbin.com</p>
                    </div>
                    
                    {/* Menu links */}
                    <div className="p-2 flex flex-col gap-1">
                      <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors font-semibold text-left w-full">
                        <User size={18} /> My Profile
                      </button>
                      <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors font-semibold text-left w-full">
                        <Settings size={18} /> Account Settings
                      </button>
                    </div>
                    
                    {/* Logout */}
                    <div onClick={() => {navigate("/login"), localStorage.removeItem("accessToken")}}
                    className="p-2 border-t border-gray-50">
                      <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-semibold text-left w-full">
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </>
        )}
      </div>
    </header>
  );
};

export default TopHeader;