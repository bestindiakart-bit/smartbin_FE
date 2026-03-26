import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Eye, EyeOff, FolderKanban, Loader2, Package, Search, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";

// IMPORT YOUR SERVICE HERE
import { customer_PUI } from "../../../../service/Master_Services/Master_Services";

const View_Page = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract rowId passed from the parent Table
  const { rowId } = location?.state || {};

  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [PUIData, setPUIData] = useState({
    customer: null,
    projects: [],
    users: [],
    items: [],
    count: { projects: 0, users: 0, items: 0 }
  });
  const [tabLoading, setTabLoading] = useState(false);

  // Table search states
  const [projectSearch, setProjectSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  
  // Table sort states
  const [projectSort, setProjectSort] = useState({ key: "", direction: "asc" });
  const [userSort, setUserSort] = useState({ key: "", direction: "asc" });
  const [itemSort, setItemSort] = useState({ key: "", direction: "asc" });
  
  // Table pagination states
  const [projectPage, setProjectPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [itemPage, setItemPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = ["Overview", "Projects", "Users", "Items"];

  // --- FETCH PUI DATA ON MOUNT (Single API Call) ---
  useEffect(() => {
    const fetchPUIData = async () => {
      if (!rowId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setTabLoading(true);
        const res = await customer_PUI(rowId);
        
        console.log("Full API Response:", res);
        
        // Extract data from the response structure
        const responseData = res?.data?.data || {};
        const responseCount = res?.data?.count || {};
        
        // Get customer data from the data.customer object
        const customerData = responseData?.customer || null;
        
        console.log("Customer Data:", customerData);
        console.log("Projects Data:", responseData?.projects);
        console.log("Users Data:", responseData?.users);
        console.log("Items Data:", responseData?.items);
        console.log("Count Data:", responseCount);
        
        setPUIData({
          customer: customerData,
          projects: responseData?.projects || [],
          users: responseData?.users || [],
          items: responseData?.items || [],
          count: responseCount || { projects: 0, users: 0, items: 0 }
        });
        
        // Set rowData from customer data for Overview tab
        if (customerData) {
          setRowData(customerData);
        }
      } catch (err) {
        console.error("Error fetching PUI data:", err);
      } finally {
        setLoading(false);
        setTabLoading(false);
      }
    };

    fetchPUIData();
  }, [rowId]);

  // Reset pagination when search changes
  useEffect(() => {
    setProjectPage(1);
  }, [projectSearch]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch]);

  useEffect(() => {
    setItemPage(1);
  }, [itemSearch]);

  // --- SEARCH HANDLERS WITH DEBOUNCE FOR BETTER PERFORMANCE ---
  const handleProjectSearch = useCallback((e) => {
    const value = e.target.value;
    setProjectSearch(value);
  }, []);

  const handleUserSearch = useCallback((e) => {
    const value = e.target.value;
    setUserSearch(value);
  }, []);

  const handleItemSearch = useCallback((e) => {
    const value = e.target.value;
    setItemSearch(value);
  }, []);

  const clearProjectSearch = useCallback(() => {
    setProjectSearch("");
  }, []);

  const clearUserSearch = useCallback(() => {
    setUserSearch("");
  }, []);

  const clearItemSearch = useCallback(() => {
    setItemSearch("");
  }, []);

  // --- FORMATTING HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (status === 1 || status === true) return "Active";
    if (status === 0 || status === false) return "Inactive";
    return "Unknown";
  };

  const getStatusColor = (status) => {
    if (status === 1 || status === true) return "bg-green-100 text-green-700";
    if (status === 0 || status === false) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status) => {
    const isActive = status === 1 || status === true;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // --- SEARCH AND SORT FUNCTIONS ---
  const filterAndSortProjects = useMemo(() => {
    let filtered = [...PUIData.projects];
    
    // Search - fixed to handle multiple characters properly
    if (projectSearch && projectSearch.trim().length > 0) {
      const searchLower = projectSearch.toLowerCase().trim();
      filtered = filtered.filter(project => 
        (project.projectName?.toLowerCase().includes(searchLower)) ||
        (project.projectId?.toLowerCase().includes(searchLower)) ||
        (project.projectHead?.toLowerCase().includes(searchLower)) ||
        (project.projectManager?.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort
    if (projectSort.key) {
      filtered.sort((a, b) => {
        let aVal = a[projectSort.key];
        let bVal = b[projectSort.key];
        
        if (projectSort.key === "projectStatus") {
          aVal = aVal === 1 || aVal === true ? 1 : 0;
          bVal = bVal === 1 || bVal === true ? 1 : 0;
        }
        
        if (aVal < bVal) return projectSort.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return projectSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [PUIData.projects, projectSearch, projectSort]);

  const filterAndSortUsers = useMemo(() => {
    let filtered = [...PUIData.users];
    
    // Search - fixed to handle multiple characters properly
    if (userSearch && userSearch.trim().length > 0) {
      const searchLower = userSearch.toLowerCase().trim();
      filtered = filtered.filter(user => 
        (user.userName?.toLowerCase().includes(searchLower)) ||
        (user.userId?.toLowerCase().includes(searchLower)) ||
        (user.loginEmail?.toLowerCase().includes(searchLower)) ||
        (user.mobile?.toLowerCase().includes(searchLower)) ||
        (user.position?.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort
    if (userSort.key) {
      filtered.sort((a, b) => {
        let aVal = a[userSort.key];
        let bVal = b[userSort.key];
        
        if (userSort.key === "status") {
          aVal = aVal === 1 || aVal === true ? 1 : 0;
          bVal = bVal === 1 || bVal === true ? 1 : 0;
        }
        
        if (aVal < bVal) return userSort.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return userSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [PUIData.users, userSearch, userSort]);

  const filterAndSortItems = useMemo(() => {
    let filtered = [...PUIData.items];
    
    // Search - fixed to handle multiple characters properly
    if (itemSearch && itemSearch.trim().length > 0) {
      const searchLower = itemSearch.toLowerCase().trim();
      filtered = filtered.filter(item => 
        (item.customerItemName?.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort
    if (itemSort.key) {
      filtered.sort((a, b) => {
        let aVal = a[itemSort.key];
        let bVal = b[itemSort.key];
        
        if (aVal < bVal) return itemSort.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return itemSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [PUIData.items, itemSearch, itemSort]);

  // Pagination
  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * itemsPerPage;
    return filterAndSortProjects.slice(start, start + itemsPerPage);
  }, [filterAndSortProjects, projectPage]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * itemsPerPage;
    return filterAndSortUsers.slice(start, start + itemsPerPage);
  }, [filterAndSortUsers, userPage]);

  const paginatedItems = useMemo(() => {
    const start = (itemPage - 1) * itemsPerPage;
    return filterAndSortItems.slice(start, start + itemsPerPage);
  }, [filterAndSortItems, itemPage]);

  // Sort handler
  const handleSort = (type, key) => {
    if (type === "projects") {
      setProjectSort(prev => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
      }));
    } else if (type === "users") {
      setUserSort(prev => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
      }));
    } else if (type === "items") {
      setItemSort(prev => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
      }));
    }
  };

  // Helper component for Information Fields
  const InfoField = ({ label, value, isPassword = false }) => (
    <div className="flex flex-col gap-1 group">
      <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">
        {label}
      </span>
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
            {value || "---"}
          </span>
        )}
      </div>
    </div>
  );

  // Projects Table Component with fixed height and Y-axis scroll
  const ProjectsTable = () => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, ID, head, or manager..."
            value={projectSearch}
            onChange={handleProjectSearch}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062a0] focus:border-transparent bg-white"
            autoComplete="off"
          />
          {projectSearch && (
            <button
              onClick={clearProjectSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={16} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Table with fixed height and Y-axis scroll */}
      <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("projects", "projectName")}>
                <div className="flex items-center gap-1">
                  Project Name
                  {projectSort.key === "projectName" && (projectSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("projects", "projectId")}>
                <div className="flex items-center gap-1">
                  Project ID
                  {projectSort.key === "projectId" && (projectSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("projects", "projectHead")}>
                <div className="flex items-center gap-1">
                  Project Head
                  {projectSort.key === "projectHead" && (projectSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("projects", "projectManager")}>
                <div className="flex items-center gap-1">
                  Project Manager
                  {projectSort.key === "projectManager" && (projectSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 bg-slate-50">Timeline</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("projects", "projectStatus")}>
                <div className="flex items-center gap-1">
                  Status
                  {projectSort.key === "projectStatus" && (projectSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <FolderKanban size={48} className="mx-auto text-slate-300 mb-3" />
                  <p>No projects found</p>
                </td>
              </tr>
            ) : (
              paginatedProjects.map((project) => (
                <tr key={project._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{project.projectName}</div>
                    {project.projectDescription && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">{project.projectDescription}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{project.projectId || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{project.projectHead || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{project.projectManager || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(project.projectStatus)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filterAndSortProjects.length > itemsPerPage && (
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-sm text-slate-600">
            Showing {(projectPage - 1) * itemsPerPage + 1} to {Math.min(projectPage * itemsPerPage, filterAndSortProjects.length)} of {filterAndSortProjects.length} projects
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setProjectPage(p => Math.max(1, p - 1))}
              disabled={projectPage === 1}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setProjectPage(p => Math.min(Math.ceil(filterAndSortProjects.length / itemsPerPage), p + 1))}
              disabled={projectPage === Math.ceil(filterAndSortProjects.length / itemsPerPage)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Users Table Component with fixed height and Y-axis scroll
  const UsersTable = () => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email, mobile, or position..."
            value={userSearch}
            onChange={handleUserSearch}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062a0] focus:border-transparent bg-white"
            autoComplete="off"
          />
          {userSearch && (
            <button
              onClick={clearUserSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={16} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Table with fixed height and Y-axis scroll */}
      <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("users", "userName")}>
                <div className="flex items-center gap-1">
                  User Name
                  {userSort.key === "userName" && (userSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("users", "userId")}>
                <div className="flex items-center gap-1">
                  User ID
                  {userSort.key === "userId" && (userSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 bg-slate-50">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 bg-slate-50">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 bg-slate-50">Position</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky top-0 bg-slate-50">Department</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("users", "status")}>
                <div className="flex items-center gap-1">
                  Status
                  {userSort.key === "status" && (userSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <Users size={48} className="mx-auto text-slate-300 mb-3" />
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{user.userName}</div>
                    {user.isMainAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-600">
                        Main Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{user.userId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.loginEmail || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.mobile || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.position || "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.department || "---"}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filterAndSortUsers.length > itemsPerPage && (
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-sm text-slate-600">
            Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filterAndSortUsers.length)} of {filterAndSortUsers.length} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setUserPage(p => Math.max(1, p - 1))}
              disabled={userPage === 1}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setUserPage(p => Math.min(Math.ceil(filterAndSortUsers.length / itemsPerPage), p + 1))}
              disabled={userPage === Math.ceil(filterAndSortUsers.length / itemsPerPage)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Items Table Component with fixed height and Y-axis scroll
  const ItemsTable = () => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item name..."
            value={itemSearch}
            onChange={handleItemSearch}
            className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062a0] focus:border-transparent bg-white"
            autoComplete="off"
          />
          {itemSearch && (
            <button
              onClick={clearItemSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={16} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Table with fixed height and Y-axis scroll */}
      <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("items", "customerItemName")}>
                <div className="flex items-center gap-1">
                  Item Name
                  {itemSort.key === "customerItemName" && (itemSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("items", "itemPerPrice")}>
                <div className="flex items-center gap-1">
                  Price/Unit
                  {itemSort.key === "itemPerPrice" && (itemSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("items", "weightPerPiece")}>
                <div className="flex items-center gap-1">
                  Weight/Piece
                  {itemSort.key === "weightPerPiece" && (itemSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("items", "safetyStockQuantity")}>
                <div className="flex items-center gap-1">
                  Safety Stock
                  {itemSort.key === "safetyStockQuantity" && (itemSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 sticky top-0 bg-slate-50" onClick={() => handleSort("items", "rol")}>
                <div className="flex items-center gap-1">
                  Reorder Level (ROL)
                  {itemSort.key === "rol" && (itemSort.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  <Package size={48} className="mx-auto text-slate-300 mb-3" />
                  <p>No items found</p>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.customerItemName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-semibold">₹{item.itemPerPrice || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.weightPerPiece ? `${item.weightPerPiece} g` : "---"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.safetyStockQuantity || 0} units</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.rol || 0} units</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filterAndSortItems.length > itemsPerPage && (
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="text-sm text-slate-600">
            Showing {(itemPage - 1) * itemsPerPage + 1} to {Math.min(itemPage * itemsPerPage, filterAndSortItems.length)} of {filterAndSortItems.length} items
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setItemPage(p => Math.max(1, p - 1))}
              disabled={itemPage === 1}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setItemPage(p => Math.min(Math.ceil(filterAndSortItems.length / itemsPerPage), p + 1))}
              disabled={itemPage === Math.ceil(filterAndSortItems.length / itemsPerPage)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Loading state for tabs
  const renderTabContent = () => {
    if (tabLoading && activeTab !== "Overview") {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#0062a0]" size={40} />
            <p className="text-slate-500 font-medium">Loading {activeTab}...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Projects":
        return (
          <div className="pb-10">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                Projects ({filterAndSortProjects.length})
              </h2>
              <Button
                onClick={() => setActiveTab("Overview")}
                variant="secondary"
                className="text-sm"
              >
                Back to Overview
              </Button>
            </div>
            <ProjectsTable />
          </div>
        );

      case "Users":
        return (
          <div className="pb-10">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                Users ({filterAndSortUsers.length})
              </h2>
              <Button
                onClick={() => setActiveTab("Overview")}
                variant="secondary"
                className="text-sm"
              >
                Back to Overview
              </Button>
            </div>
            <UsersTable />
          </div>
        );

      case "Items":
        return (
          <div className="pb-10">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                Items ({filterAndSortItems.length})
              </h2>
              <Button
                onClick={() => setActiveTab("Overview")}
                variant="secondary"
                className="text-sm"
              >
                Back to Overview
              </Button>
            </div>
            <ItemsTable />
          </div>
        );

      case "Overview":
      default:
        return (
          <div className="space-y-8 pb-10">
            {/* Quick ID Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <InfoField label="Customer Id" value={rowData?.customerId} />
                <InfoField
                  label="Created On"
                  value={formatDate(rowData?.createdAt)}
                />
                <InfoField
                  label="Last Updated"
                  value={formatDate(rowData?.updatedAt)}
                />
              </div>
            </motion.div>

            {/* Company Details */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm"
            >
              <div className="px-8 py-5 border-b border-slate-50 bg-white">
                <h2 className="text-[#0062a0] font-bold text-lg">
                  Company Details
                </h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
                <InfoField
                  label="Company Name"
                  value={rowData?.companyName}
                />
                <InfoField
                  label="Customer Name"
                  value={rowData?.customerName}
                />
                <InfoField
                  label="Customer Type"
                  value={rowData?.customerType}
                />

                <InfoField
                  label="Transit Days"
                  value={`${rowData?.transitDays} Days`}
                />
                <InfoField label="GST Number" value={rowData?.gstNumber} />
              </div>
            </motion.div>

            {/* Customer Login & Contact Details */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm"
            >
              <div className="px-8 py-5 border-b border-slate-50 bg-white">
                <h2 className="text-[#0062a0] font-bold text-lg">
                  Customer Login & Contact Details
                </h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
                <InfoField label="Admin Email" value={rowData?.adminEmail} />
                <InfoField label="Position" value={rowData?.position} />
                <InfoField label="Department" value={rowData?.department} />

                <InfoField
                  label="Primary Number"
                  value={
                    rowData?.mobileNumber?.[0]
                      ? `+91 ${rowData.mobileNumber[0]}`
                      : "---"
                  }
                />
                <InfoField
                  label="Secondary Number"
                  value={
                    rowData?.mobileNumber?.[1]
                      ? `+91 ${rowData.mobileNumber[1]}`
                      : "---"
                  }
                />
              </div>
            </motion.div>

            {/* Address Details */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm"
            >
              <div className="px-8 py-5 border-b border-slate-50 bg-white">
                <h2 className="text-[#0062a0] font-bold text-lg">
                  Address Information
                </h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                <InfoField
                  label="Shipping Address 1"
                  value={rowData?.shippingAddress1}
                />
                <InfoField
                  label="Shipping Address 2"
                  value={rowData?.shippingAddress2}
                />
                <InfoField
                  label="Billing Address"
                  value={rowData?.billingAddress}
                />
              </div>
            </motion.div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#0062a0]" size={40} />
          <p className="text-slate-500 font-medium">Loading Details...</p>
        </div>
      </div>
    );
  }

  if (!rowData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">
            No Data Found for this ID.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 font-sans text-slate-900"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.header
          variants={itemVariants}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#e0f2fe" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-3 text-[#0062a0] rounded-2xl transition-all cursor-pointer"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
                {rowData?.companyName}
              </h1>
              <p className="text-[#0062a0] font-medium text-sm">
                Customer Master / View
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${rowData?.status === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {rowData?.status === 1 ? "Active" : "Inactive"}
            </div>
            <Button
              onClick={() =>
                navigate("../create-customer", {
                  state: { rowId: rowId, mode: "edit" },
                })
              }
              variant="primary"
            >
              Edit Profile
            </Button>
          </div>
        </motion.header>

        {/* Navigation Tabs with Counts in Headers */}
        <motion.div
          variants={itemVariants}
          className="relative flex bg-[#E0F2FE] rounded-2xl p-1.5 mb-10 overflow-hidden shadow-inner flex-wrap"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const count = PUIData.count[tab.toLowerCase()] || 0;
            
            // Format tab display name with count
            let tabDisplay = tab;
            if (tab !== "Overview" && count > 0) {
              tabDisplay = `${tab} (${count})`;
            } else if (tab !== "Overview") {
              tabDisplay = `${tab} (0)`;
            }
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 px-8 rounded-xl text-[14px] font-bold transition-colors duration-300 whitespace-nowrap cursor-pointer outline-none ${
                  isActive
                    ? "text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="relative z-10">
                  {tabDisplay}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white rounded-xl shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default View_Page;