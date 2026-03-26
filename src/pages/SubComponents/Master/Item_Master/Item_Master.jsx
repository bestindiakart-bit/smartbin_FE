import { motion } from "framer-motion";
import {
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Package,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Components
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table"; // Ensure this path matches your folder structure
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Image from "../../../../component/image/Image";
import StatsCard from "../../../../component/stats/StatsCard";
import Create_Category_Model from "./Create_Category_Model";

// Services
import {
  item_create_edit, // Added this import for the toggle API
  item_export,
  item_master_get,
} from "../../../../service/Master_Services/Master_Services";

const Item_Master = () => {
  const navigate = useNavigate();

  // Search Params for View Toggle (Grid vs Table)
  const[searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "grid";

  const setView = (viewType) => {
    setSearchParams({ view: viewType });
  };

  // UI States
  const [isCreateModel, setIsCreateModel] = useState(false);
  const [succesModel, setSuccessModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Data States
  const [itemgetData, setItemGetData] = useState([]);
  const [pagination, setPagination] = useState({});

  // Table Pagination & Selection States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const[selectedRows, setSelectedRows] = useState([]);

  // Search Term State
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await item_master_get();
      if (res?.data?.success) {
        const apiData = res?.data?.data;
        setItemGetData(apiData?.items ||[]);
        setPagination({
          totalRecords: apiData?.totalRecords,
          totalPages: apiData?.totalPages,
          currentPage: apiData?.currentPage,
        });
      }
    } catch (err) {
      console.log("Item Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  },[]);

  // --- EXPORT LOGIC ---
  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const res = await item_export(format.toLowerCase());

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Item_Master_Report.${format.toLowerCase()}`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessModel(true);
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setExportLoading(false);
    }
  };

  // Filter Logic
  const filteredItems = itemgetData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(searchLower) ||
      item.partNumber?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate Paginated Data for Table
  const tableData = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (e) => {
    const value = e?.target?.value !== undefined ? e.target.value : e;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // --- NAVIGATION ACTION HANDLERS ---
  const handleView = (item) => {
    navigate("item-view", { state: { id: item._id || item.id } });
  };

  const handleEdit = (item) => {
    navigate("item-create", {
      state: { mode: "edit", id: item._id || item.id },
    });
  };

  const handleDelete = (item) => {
    console.log("Delete triggered for:", item._id || item.id);
    // Implement delete API logic here if required
  };

  // --- STATUS TOGGLE LOGIC ---
  const handleStatusToggle = async (item) => {
    const itemId = item._id || item.id;
    // Toggle between 1 (Active) and 0 (Inactive)
    const newStatus = item.status === 1 ? 0 : 1; 

    try {
      // Items API typically expects FormData due to images.
      const formData = new FormData();
      formData.append("status", newStatus);

      // Call API
      const res = await item_create_edit(itemId, formData);

      if (res?.data?.success || res?.status === 200) {
        // Update local state to immediately reflect the change
        const updatedData = itemgetData.map((row) =>
          (row._id || row.id) === itemId ? { ...row, status: newStatus } : row
        );
        setItemGetData(updatedData);
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const tableColumns =[
    { header: "Part Number", key: "partNumber" },
    { header: "Item Name", key: "itemName" },
    { header: "Weight (g)", key: "weightPerUnit" },
    { header: "Price (₹)", key: "price" },
    { header: "WH Stock", key: "warehouseStock" },
    { header: "Safety Stock", key: "warehouseSafetyStock" },
    { header: "ROL", key: "stockROL" },
    { header: "Status", key: "status", isToggle: true },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
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

  // Stats dynamically generated from the state
  const activeItems = itemgetData.filter((item) => item.status === 1).length;
  const inactiveItems = itemgetData.filter((item) => item.status !== 1).length;

  const StatsData =[
    {
      title: "Total Items",
      count: pagination?.totalRecords || itemgetData.length,
      footerText: "Overall",
      icon: <Package />,
    },
    {
      title: "Total Category",
      count: pagination?.totalRecords || itemgetData.length,
      footerText: "Overall",
      icon: <Layers />,
    },
    {
      title: "Total Active",
      count: activeItems,
      footerText: "Overall",
      icon: <Package className="text-green-500" />,
    },
    {
      title: "Total Inactive",
      count: inactiveItems,
      footerText: "Overall",
      icon: <XCircle className="text-red-500" />,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-800">
          Item <span className="text-[#0062a0]">Master</span>
        </h1>

        <div className="relative w-full lg:max-w-xl">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by item name or part number..."
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button onClick={() => setIsCreateModel(true)} variant="primary">
            Create Category
          </Button>
          <Button onClick={() => navigate("item-create")} variant="primary">
            Create Item
          </Button>

          <Download_Button
            onSelect={handleExport}
            tooltipText={exportLoading ? "Generating..." : "Export Data"}
          />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {StatsData.map((item, index) => (
          <motion.div key={index} variants={itemVariants}>
            <StatsCard
              title={item.title}
              count={item.count}
              footerText={item.footerText}
              icon={item.icon}
            />
          </motion.div>
        ))}
      </div>

      {/* VIEW TOGGLE BUTTONS */}
      <div className="flex item-center justify-end gap-2 mb-4">
        <button
          onClick={() => setView("grid")}
          className={`p-2 rounded-lg flex items-center justify-center cursor-pointer ${
            currentView === "grid"
              ? "bg-white text-[#0062a0] shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title="Grid View"
        >
          <LayoutGrid size={18} /> <span className="ml-2 p-1">Grid View</span>
        </button>
        <button
          onClick={() => setView("table")}
          className={`p-2 rounded-lg flex items-center justify-center cursor-pointer ${
            currentView === "table"
              ? "bg-white text-[#0062a0] shadow-sm font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
          title="Table View"
        >
          <List size={18} /> <span className="ml-2 p-1">Table View</span>
        </button>
      </div>

      {/* Main Content Area (Toggle Grid / Table) */}
      {loading || exportLoading ? (
        <div className="p-20 flex flex-col items-center justify-center text-slate-400 font-medium">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>
            {exportLoading ? "Preparing export file..." : "Loading items..."}
          </p>
        </div>
      ) : currentView === "table" ? (
        // --- TABLE VIEW ---
        <motion.div
          key="table-view"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <ReUsable_Table
            columns={tableColumns}
            data={tableData} // Pass paginated data
            totalItems={filteredItems.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleView}
            onStatusToggle={handleStatusToggle} // Passed toggle function down to table
            showActions={true}
            showToggle={true}
          />
        </motion.div>
      ) : (
        // --- GRID VIEW ---
        <motion.div
          key={`grid-view-${filteredItems.length}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => handleView(item)}
                className="cursor-pointer bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src={item.itemImages?.[0]}
                      alt={item.itemName}
                      className="object-contain w-full h-full p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[#0062a0] text-xl font-extrabold tracking-tight">
                        {item.partNumber}
                      </h3>
                      {/* Grid View Status Badge Update: Clicking also toggles the status here! */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(item);
                        }}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border w-fit cursor-pointer hover:scale-105 transition-transform ${
                          item.status === 1
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {item.status === 1 ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-slate-400 font-bold text-sm">
                        {item.itemName}
                      </p>
                      <span className="text-slate-900 font-bold text-[15px]">
                        <p>{item.weightPerUnit}g/piece</p>
                        <p>{item.price}rs/piece</p>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#eff6ff] py-3 rounded-xl text-center border border-blue-50">
                    <p className="text-slate-900 font-black text-lg">
                      {item.warehouseStock || 0}
                    </p>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">
                      Warehouse
                    </p>
                  </div>
                  <div className="bg-[#fef2f2] py-3 rounded-xl text-center border border-red-50">
                    <p className="text-slate-900 font-black text-lg">
                      {item.warehouseROL || 0}
                    </p>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">
                      ROL
                    </p>
                  </div>
                  <div className="bg-[#f0fdf4] py-3 rounded-xl text-center border border-green-50">
                    <p className="text-slate-900 font-black text-lg">
                      {item.warehouseSafetyStock || 0}
                    </p>
                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-1">
                      Safety
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
              <Package size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-semibold">No Items Found</p>
              <p className="text-sm">Try adjusting your search query.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Popups */}
      <Create_Category_Model
        isOpen={isCreateModel}
        onClose={() => setIsCreateModel(false)}
      />
      <Success_Popup
        isOpen={succesModel}
        onClose={() => setSuccessModel(false)}
        message="File Downloaded Successfully!"
      />
    </motion.div>
  );
};

export default Item_Master;``