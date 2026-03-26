import { AnimatePresence, motion } from "framer-motion";
import { SquareKanban, UserCheck, UserRoundX, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { binDashboard_dynamicGet, smartbinDashboard_getall } from "../../../../service/Bin_Services/Bin_Services";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import SmartBin_Full_View_Model from "./SmartBin_Full_View_Model";

// Helper function for formatting ISO dates
const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}/${month}/${year} (${hours}:${minutes} ${ampm})`;
};

const SmartBin_Dashboard = () => {
  const navigate = useNavigate();
  const [succesModel, setSuccessModel] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isOpenSmartModel, setIsOpenSmartModel] = useState(false);

  // Data States
  const [tableData, setTableData] = useState([]);
  const [dynamicData, setDynamicData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");



  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  // Merge static and dynamic data
  const processedData = useMemo(() => {
    return tableData.map((item, index) => {
      const liveData = dynamicData.find((d) => d.binId === item.binId);
      return {
        ...item,
        srNo: index + 1,
        id: item.id || item._id || `row-${index}`,

        // Bin dynamic fields (from liveData)
        binQty: liveData?.currentQuantity ?? item.binQty,
        binStatus: liveData?.statusTag || liveData?.currentStatus || item.binStatus,
        binStatusMessage: liveData?.statusMessage || "",               // For tooltip / extra info
        binUpdatedOn: liveData?.lastUpdatedAt ? formatDateTime(liveData.lastUpdatedAt) : item.binUpdatedOn,

        // Warehouse dynamic fields (fallback to static)
        warehouseCurrentStock: liveData?.warehouseCurrentStock ?? item.warehouseCurrentStock,
        warehouseStatusMessage: item.warehouseStatusMessage || liveData?.warehouseStatusMessage || "",

        // Status column: use masterStatus from dynamic if available
        currentStatus: liveData?.masterStatus || (item.status === 1 ? "Active" : "Inactive"),
      };
    });
  }, [tableData, dynamicData]);

  // Dynamic Stats Calculations based on Processed Data & Total Items
  const statsData = useMemo(() => {
    // 1. Unique Active Projects on screen
    const uniqueProjectsCount = new Set(processedData.map((d) => d.projectName).filter(Boolean)).size;

    // 2. Critical Stock Count (Checking for red or orange indicators)
    const criticalCount = processedData.filter((d) => {
      const status = d.binStatus?.toLowerCase() || "";
      return status === "red" || status === "orange" || status === "critical";
    }).length;

    // 3. System Health Percentage (Online/Active vs Total)
    const onlineCount = processedData.filter((d) => {
      return (
        d.currentStatus?.toLowerCase() === "active" ||
        d.binStatus?.toLowerCase() === "online" ||
        d.binStatus?.toLowerCase() === "green" ||
        d.status === 1
      );
    }).length;

    const healthPct = processedData.length > 0 ? Math.round((onlineCount / processedData.length) * 100) : 0;

    return [
      { title: "Total Bins", count: totalItems.toString(), footerText: "Across all sites", icon: <Users /> },
      { title: "Active Projects", count: uniqueProjectsCount.toString(), footerText: "On current view", icon: <SquareKanban /> },
      { title: "Critical Stock", count: criticalCount.toString().padStart(2, "0"), footerText: "Needs Attention", icon: <UserRoundX className="text-red-500" /> },
      { title: "System Health", count: `${healthPct}%`, footerText: "Online/Active", icon: <UserCheck className="text-green-500" /> },
    ];
  }, [processedData, totalItems]);

  // Columns Configuration
 const columns = [
    { header: "Customer", key: "customerName" },
    { header: "Project Name", key: "projectName" },
    { header: "Master ID", key: "masterId" },
    { header: "BIN ID", key: "binId" },
    { header: "Item Name", key: "itemName" },
    { header: "Bin Status", key: "binStatus", isStatus: true },  
    { header: "Bin Max", key: "binMaxLimit" },             // binStatusTag for color
    { header: "Bin QTY", key: "binQty" },
    { header: "Bin Reorder", key: "binReorderLevel" },
    { header: "Bin Safety", key: "binSafetyLimit" },
    { header: "Bin Updated", key: "binUpdatedOn" },
    { header: "WH Status", key: "warehouseStatusTag", isPaid: true }, 
    { header: "WH Max", key: "warehouseMaxLimit" },        // warehouseStatusTag for color
    { header: "WH C Qty", key: "warehouseCurrentStock" },
    { header: "WH Reorder", key: "warehouseReorderLevel" },
    { header: "WH Safety", key: "warehouseSafetyLimit" },
    { header: "Status", key: "currentStatus", isStatus: true },               // now uses masterStatus
  ];

  const handleSelectionChange = (selectedIds) => setSelectedRows(selectedIds);
  const handleEdit = (row) => navigate("edit-bin", { state: { rowID: row.id } });
  const handleView = () => setIsOpenSmartModel(true);

  // Fetch Data on Mount or when Pagination/Search changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [staticRes, dynamicRes] = await Promise.all([
          smartbinDashboard_getall(currentPage, itemsPerPage, debouncedSearch),
          binDashboard_dynamicGet(currentPage, itemsPerPage, debouncedSearch),
        ]);

        const records = staticRes?.data?.data?.records || [];
        const total = staticRes?.data?.data?.totalRecords || records.length;

        setTableData(records);
        setDynamicData(dynamicRes?.data?.data || []);
        setTotalItems(total);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearch]);

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 md:p-8 bg-[#fcfdfe] min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Smart Bin Dashboard</h1>
            <p className="text-[#0062a0] font-medium mt-1">Real-time Inventory Monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsOpenSmartModel(true)} variant="secondary">
              Full View
            </Button>
            <Download_Button onClick={() => setSuccessModel(true)} />
          </div>
        </motion.div>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsData.map((item, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatsCard title={item.title} count={item.count} footerText={item.footerText} icon={item.icon} />
            </motion.div>
          ))}
        </div>

        {/* Table Container */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <div className="max-w-md w-full">
              <SearchBar placeholder="Global Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#f0f9ff] border border-blue-200 px-4 py-1.5 rounded-full text-[13px] font-bold text-[#0062a0]"
                >
                  {selectedRows.length} Items Selected
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-1">
            <ReUsable_Table
              columns={columns}
              data={processedData}
              loading={loading}
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              onEdit={handleEdit}
              onView={handleView}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onLimitChange={setItemsPerPage}
              showActions={false}
              showWhstatus={true}
              showbinstatus={true}
              showToggle={false}
              ActionChildren="Actions"
              
            />
          </div>
        </motion.div>
      </div>

      <Success_Popup isOpen={succesModel} onClose={() => setSuccessModel(false)} message="File Downloaded Successfully!" />
      <SmartBin_Full_View_Model isOpen={isOpenSmartModel} onClose={() => setIsOpenSmartModel(false)} />
    </motion.div>
  );
};

export default SmartBin_Dashboard;