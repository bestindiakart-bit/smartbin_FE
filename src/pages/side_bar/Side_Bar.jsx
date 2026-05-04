import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ChevronDown,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import LogoSmartBin from "../../assets/LogoSmartBin.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissions } from "../../store/Permission_Store/Permission_Slice";

const Side_Bar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed, isLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({ Masters: true });
  const {permissions} = useSelector((state)=>state.permissions);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // Safely extract token to prevent crashes if it's missing or malformed
  const token = localStorage.getItem("accessToken");
  let owner = false;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      owner = payload?.data?.owner;
    }
  } catch (error) {
    console.error("Error decoding token");
  }

  const permissionMap = permissions?.reduce((acc, item) => {
  acc[item.module] = item;
  return acc;
}, {});

  const menuData = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard size={22} />, module: "dashboard" },

  {
    name: "Masters",
    icon: <Database size={22} />,
    subModules: [
      { name: "Customer Master", path: "/customer-master", module: "customer_master" },
      { name: "User Master", path: "/user-master", module: "user_master" },
      { name: "User Permission Master", path: "/user-permission-master", module: "user_type_permission_master" },
      { name: "Project Master", path: "/project-master", module: "project_master" },
      { name: "Item Master", path: "/item-master", module: "item_master" },
    ],
  },

  {
    name: "Orders",
    icon: <ShoppingCart size={22} />,
    subModules: [
      { name: "Warehouse Orders", path: "/warehouse-orders", module: "warehouse_order_details" },
      { name: "Order Processing", path: "/order-processing", module: "warehouse_creation" },
      { name: "Bill of Materials", path: "/bill-of-materials", module: "bill_of_materials" },
    ],
  },

  {
    name: "Bin",
    icon: <Archive size={22} />,
    subModules: [
      { name: "Smart Bin Dashboard", path: "/bin-dashboard", module: "smart_bin_dashboard" },
      { name: "Bin Configuration", path: "/bin-config", module: "bin_configuration" },
    ],
  },

  {
    name: "Forecast",
    icon: <TrendingUp size={22} />,
    subModules: [
      { name: "Forecast Viewer", path: "/forecast-viewer", module: "forecast_viewer" },
    ],
  },

  { name: "Overall Report", path: "/overall-report", icon: <FileText size={22} />, module: "overall_report" },
  { name: "Setting", path: "/create-setting", icon: <Settings size={22} /> }
];

const filteredMenu = menuData
  .map((item) => {
    if (!item.subModules) {
      if (!item.module) return item;

      if (!permissionMap?.[item.module]?.view) return null;
      return item;
    }
    const filteredSubs = item.subModules.filter(
      (sub) => permissionMap?.[sub.module]?.view
    );
    if (filteredSubs.length === 0) return null;

    return { ...item, subModules: filteredSubs };
  })
  .filter(Boolean);

  const toggleSubMenu = (name) => {
    if (isCollapsed) return;
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <motion.aside
      initial={false}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      animate={{
        width: isCollapsed ? "85px" : "290px",
        x: window.innerWidth < 1024 ? (isMobileOpen ? 0 : -300) : 0,
      }}
      transition={{ duration: 0.4, ease:[0.4, 0, 0.2, 1] }}
      className="fixed inset-y-0 left-0 z-40 bg-[#0062a0] flex flex-col lg:static overflow-visible"
    >
      {/* Brand Section */}
      <div className="p-6 flex items-center h-[100px] overflow-hidden">
        {!isCollapsed && (
          isLoading ? (
            <div className="w-32 h-8 bg-white/20 rounded-md animate-pulse" />
          ) : (
            <motion.img
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              src={LogoSmartBin}
              alt="SmartBin"
              className="w-32 brightness-0 invert"
            />
          )
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-4 flex flex-col">
        {isLoading ? (
          // Skeleton for Menu Items
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className={`flex items-center p-4 transition-all duration-300 ${isCollapsed ? "justify-center" : "ml-2"}`}>
              <div className="w-6 h-6 bg-white/20 rounded-md animate-pulse" />
              {!isCollapsed && <div className="ml-4 w-32 h-4 bg-white/20 rounded-md animate-pulse" />}
            </div>
          ))
        ) : (
          // Actual Menu Items
          filteredMenu.map((item) => {
            const hasSub = !!item.subModules;
            const isSubOpen = openMenus[item.name];
            const isParentActive = hasSub && item.subModules.some(s => location.pathname === s.path);
            const isDirectActive = location.pathname === item.path;

            return (
              <div key={item.name} className="flex flex-col mb-1 relative">
                {hasSub ? (
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex items-center p-4 transition-all duration-300 group
                      ${isParentActive && isCollapsed ? "active-item-notch" : "text-white/80 hover:bg-white/10"}
                      ${isCollapsed ? "justify-center" : "justify-between ml-2"}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`transition-transform duration-300 ${isParentActive ? "scale-110" : ""}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <motion.div animate={{ rotate: isSubOpen ? 180 : 0 }}>
                        <ChevronDown size={18} />
                      </motion.div>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `flex items-center p-4 transition-all duration-300
                      ${isCollapsed ? "justify-center" : "ml-2"}
                      ${isActive ? "active-item-notch" : "text-white/80 hover:bg-white/10"}`}
                  >
                    <span className={`transition-transform duration-300 ${isDirectActive ? "scale-110" : ""}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{item.name}</span>}
                  </NavLink>
                )}

                {/* Submodules */}
                <AnimatePresence>
                  {hasSub && !isCollapsed && isSubOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col py-1"
                    >
                      {item.subModules.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) => `
                            py-3 pl-16 pr-4 text-[14px] transition-all duration-300 relative
                            ${isActive ? "active-item-notch font-bold" : "text-white/60 hover:text-white hover:translate-x-2"}
                          `}
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        {isLoading ? (
          <div className={`flex items-center p-4 ${isCollapsed ? "justify-center" : "ml-2"}`}>
            <div className="w-6 h-6 bg-white/20 rounded-md animate-pulse" />
            {!isCollapsed && <div className="ml-4 w-20 h-4 bg-white/20 rounded-md animate-pulse" />}
          </div>
        ) : (
          <button
            onClick={() => {navigate("/login"), localStorage.removeItem("accessToken")}}
            className={`flex items-center gap-4 w-full p-4 text-white/80 font-bold hover:bg-red-500/20 hover:text-white transition-all rounded-xl cursor-pointer
              ${isCollapsed ? "justify-center" : "ml-2"}`}
          >
            <LogOut size={22} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Side_Bar;