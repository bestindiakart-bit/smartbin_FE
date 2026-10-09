import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, User, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoSmartBin from "../../assets/LogoSmartBin.svg";
import { loginMeAPI } from "../../service/Login/Login";

const dropdownVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } },
  exit: { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } },
};

const firstText = (...values) => {
  const value = values.find((item) => typeof item === "string" && item.trim());
  return value?.trim() || "";
};

const readableRole = (value) => {
  if (typeof value === "string") return value.replace(/_/g, " ").trim();
  if (value && typeof value === "object") {
    return firstText(value.userTypeName, value.roleName, value.name, value.type);
  }
  return "";
};

const formatProfile = (response) => {
  const data = response?.data?.data ?? response?.data ?? {};
  // /me may return a user directly or nested under user/superAdmin/customer.
  const account = data.user ?? data.superAdmin ?? data.admin ?? data.customer ?? data;
  const name = firstText(
    account.userName, account.name, account.fullName, account.customerName,
    account.companyName, data.userName, data.name, data.customerName
  );
  const email = firstText(
    account.loginEmail, account.adminEmail, account.email,
    data.loginEmail, data.adminEmail, data.email
  );
  const role = firstText(
    readableRole(account.userTypeId), readableRole(account.userType),
    readableRole(account.role), readableRole(data.userType), readableRole(data.role),
    account.position, data.position
  );
  const avatar = firstText(account.profileImage, account.avatar, account.image, data.profileImage);
  return { name: name || (email ? email.split("@")[0] : "My Account"), email, role, avatar };
};

const getInitials = (name) =>
  (name || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

const TopHeader = ({ toggleMobileSidebar, isCollapsed, isLoading }) => {
  const navigate = useNavigate();
  const dropdownContainerRef = useRef(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const response = await loginMeAPI();
      if (response?.data?.success === false) throw new Error("Unable to load account details");
      setProfile(formatProfile(response));
    } catch (error) {
      setProfileError(error?.message || "Unable to load account details");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => setActiveDropdown((current) => current === name ? null : name);
  const signOut = () => {
    localStorage.removeItem("accessToken");
    setActiveDropdown(null);
    // If your app has Redux authentication/permission state, clear it in the logout action too.
    navigate("/login", { replace: true });
  };

  const loading = isLoading || profileLoading;
  const displayName = profile?.name || "My Account";
  const displayEmail = profile?.email || "Email unavailable";
  const displayRole = profile?.role || "Account";

  return (
    <header className="relative z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-8 sm:py-5">
      <div className="flex items-center gap-6">
        <button type="button" onClick={toggleMobileSidebar} aria-label="Open navigation" className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden">
          <Menu size={24} />
        </button>
        <AnimatePresence>
          {isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="hidden items-center lg:flex">
              {isLoading ? <div className="h-8 w-32 animate-pulse rounded-md bg-gray-200" /> : <img src={LogoSmartBin} alt="SmartBin" className="w-32" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 sm:gap-5" ref={dropdownContainerRef}>
        <div className="relative">
          <button type="button" aria-label="Notifications" aria-expanded={activeDropdown === "notification"} onClick={() => toggleDropdown("notification")}
            className={`rounded-full p-2.5 transition-colors ${activeDropdown === "notification" ? "bg-blue-100 text-[#004e80]" : "bg-blue-50 text-[#0062a0] hover:bg-blue-100"}`}>
            <Bell size={22} />
          </button>
          <AnimatePresence>
            {activeDropdown === "notification" && (
              <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl sm:w-80">
                <div className="border-b border-gray-100 px-5 py-4 font-bold text-gray-800">Notifications</div>
                <div className="flex items-center gap-3 px-5 py-6 text-sm text-gray-500"><Info size={18} /> No notifications available.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative border-l border-gray-100 pl-3">
          <button type="button" onClick={() => toggleDropdown("profile")} aria-expanded={activeDropdown === "profile"}
            className={`flex items-center gap-3 rounded-xl p-1.5 transition-colors ${activeDropdown === "profile" ? "bg-gray-100" : "hover:bg-gray-50"}`}>
            <div className="hidden text-right sm:block">
              {loading ? <><div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" /><div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-200" /></> : <>
                <p className="max-w-40 truncate text-sm font-bold leading-tight text-gray-800">{displayName}</p>
                <p className="max-w-40 truncate text-xs font-medium text-gray-400">{displayRole}</p>
              </>}
            </div>
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-blue-50 bg-[#0062a0] text-sm font-semibold text-white shadow-sm">
              {loading ? <div className="h-full w-full animate-pulse bg-gray-200" /> : profile?.avatar ? <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" /> : getInitials(displayName)}
            </div>
          </button>

          <AnimatePresence>
            {activeDropdown === "profile" && (
              <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                <div className="border-b border-gray-100 bg-gray-50/50 p-5">
                  <p className="truncate text-base font-bold text-gray-800">{loading ? "Loading profile..." : displayName}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-gray-500">{loading ? "" : displayEmail}</p>
                  {profileError && <button type="button" onClick={fetchProfile} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">Retry profile loading</button>}
                </div>
                <div className="p-2">
                  <button type="button" onClick={() => { setActiveDropdown(null); navigate("/profile"); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700">
                    <User size={18} /> My Profile
                  </button>
                </div>
                <div className="border-t border-gray-100 p-2">
                  <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
