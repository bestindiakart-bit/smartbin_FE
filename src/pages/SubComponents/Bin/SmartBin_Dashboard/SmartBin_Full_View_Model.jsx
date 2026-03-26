import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LogoSmartBin from "../../../../assets/LogoSmartBin.svg";
import ViewMore_Modal from "./ViewMore_Model";

// Project Components
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";

// Services
import {
  binDashboard_dynamicGet,
  smartbinDashboard_getall,
} from "../../../../service/Bin_Services/Bin_Services";

// Helper function
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

// --- EMOTIVE COLOR DROPDOWN COMPONENT ---
const COLOR_OPTIONS = [
  { label: "All Colors", value: "All", bg: "bg-gray-200" },
  { label: "Green (Safe)", value: "Green", bg: "bg-green-500" },
  { label: "Red (Critical)", value: "Red", bg: "bg-red-500" },
  { label: "Yellow (Warning)", value: "Yellow", bg: "bg-yellow-500" },
  { label: "Orange (Notice)", value: "Orange", bg: "bg-orange-500" },
  { label: "Blue (Info)", value: "Blue", bg: "bg-blue-500" },
];

const FilterColorDropdown = ({ label, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selectedOpt = COLOR_OPTIONS.find((o) => o.value === selected) || COLOR_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#0062a0]/40 transition-all focus:outline-none"
      >
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold leading-none mb-1">{label}</span>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 leading-none">
            {selected !== "All" && <span className={`w-2.5 h-2.5 rounded-full ${selectedOpt.bg} shadow-sm`} />}
            <span>{selected}</span>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 ml-2 transition-transform duration-300 ${open ? "rotate-180 text-[#0062a0]" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-[9999] overflow-hidden py-1"
          >
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-slate-50 ${
                  selected === opt.value ? "bg-blue-50/50 text-[#0062a0]" : "text-slate-600"
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${opt.bg} shadow-sm`} />
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SmartBin_Full_View_Model = ({ isOpen, onClose }) => {
  const [tableData, setTableData] = useState([]);
  const [dynamicData, setDynamicData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination & Filtering States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [globalSearch, setGlobalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [binStatusColor, setBinStatusColor] = useState("All");
  const [whStatusColor, setWhStatusColor] = useState("All");
  
  // Modal states
  const [isViewMore, setIsMoreView] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // Stores the full clicked row

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, binStatusColor, whStatusColor]);

  // Prepare filter values for API
  const getApiFilterValue = (color) => (color === "All" ? "" : color.toLowerCase());

  // Fetch Data integrating Search and Color filters
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const [staticRes, dynamicRes] = await Promise.all([
          smartbinDashboard_getall(
            currentPage,
            itemsPerPage,
            debouncedSearch,
            getApiFilterValue(binStatusColor),
            getApiFilterValue(whStatusColor)
          ),
          binDashboard_dynamicGet(
            currentPage,
            itemsPerPage,
            debouncedSearch,
            getApiFilterValue(binStatusColor),
            getApiFilterValue(whStatusColor)
          ),
        ]);

        const staticRecords = staticRes?.data?.data?.records || [];
        setTableData(staticRecords);
        setDynamicData(dynamicRes?.data?.data || []);

        setTotalItems(staticRes?.data?.data?.totalRecords || staticRecords.length);
      } catch (err) {
        console.error("Full View Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, currentPage, itemsPerPage, debouncedSearch, binStatusColor, whStatusColor]);

  // Merge static and dynamic data
  const processedData = useMemo(() => {
    return tableData.map((item, index) => {
      const liveData = dynamicData.find((d) => d.binId === item.binId);
      return {
        ...item, // This preserves all fields including customerMasterId and itemMasterID
        srNo: index + 1,
        id: item.id || item._id || `row-${index}`,
        currentStatus: liveData?.masterStatus || (item.status === 1 ? "Active" : "Inactive"),
        binQty: liveData?.currentQuantity ?? item.binQty,
        binStatus: liveData?.statusTag || liveData?.currentStatus || item.binStatus,
        binStatusMessage: liveData?.statusMessage || "",               
        binUpdatedOn: liveData?.lastUpdatedAt ? formatDateTime(liveData.lastUpdatedAt) : item.binUpdatedOn,
        warehouseCurrentStock: liveData?.warehouseCurrentStock ?? item.warehouseCurrentStock,
        warehouseStatusMessage: item.warehouseStatusMessage || liveData?.warehouseStatusMessage || "",
      };
    });
  }, [tableData, dynamicData]);

  // Table Columns
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex flex-col p-4 md:p-6 lg:p-10 overflow-hidden"
        >
          <div className="bg-[#fcfdfe] rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-200/60 flex-1 flex flex-col overflow-hidden w-full h-full">
            {/* Header */}
            <header className="px-6 md:px-8 py-5 flex flex-wrap items-center justify-between bg-white border-b border-slate-200 gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:text-[#0062a0] hover:bg-blue-50 transition-all font-bold group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-md">Back to Dashboard</span>
              </button>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase flex-1 text-center hidden md:block">
                Inventory Status <span className="text-[#0062a0]">Full View</span>
              </h1>
              <div className="flex items-center justify-end">
                <img src={LogoSmartBin} alt="SmartBin Logo" className="h-9 w-auto object-contain drop-shadow-sm" />
              </div>
            </header>

            {/* Toolbar */}
            <div className="px-6 md:px-8 py-4 flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-slate-50/80 border-b border-slate-200">
              <div className="relative group w-full xl:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400 group-focus-within:text-[#0062a0] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Global Search records..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0062a0] focus:ring-4 focus:ring-[#0062a0]/10 shadow-sm transition-all"
                />
                {globalSearch && (
                  <button onClick={() => setGlobalSearch("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold shadow-sm">
                  <Filter size={16} className="text-slate-400" /> Filters
                </div>
                <FilterColorDropdown label="Bin Status" selected={binStatusColor} onSelect={setBinStatusColor} />
                <FilterColorDropdown label="WH Status" selected={whStatusColor} onSelect={setWhStatusColor} />
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 bg-slate-50/30">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden h-full flex flex-col relative">
                <ReUsable_Table
                  columns={columns}
                  showActions={false}
                  data={processedData}
                  loading={loading}
                  selectedRows={selectedRows}
                  onSelectionChange={setSelectedRows}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onLimitChange={setItemsPerPage}
                  tableHeight="h-full"
                  showWhstatus={true}
                  showbinstatus={true}
                  showToggle={false}
                  ActionChildren="Info"
                  showMoreView={true}
                  onMoreView={(row) => {
                    // This captures the entire row object with customerMasterId and itemMasterID
                    console.log("Row clicked for More View:", row);
                    setSelectedRow(row);
                    setIsMoreView(true);
                  }}
                />
              </div>
            </div>

            {/* Modal passed with complete row data */}
            <ViewMore_Modal
              isOpen={isViewMore}
              data={selectedRow}
              onClose={() => {
                setIsMoreView(false);
                setSelectedRow(null);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartBin_Full_View_Model;