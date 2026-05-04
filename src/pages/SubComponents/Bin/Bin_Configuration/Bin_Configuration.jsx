import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShoppingCart, SquareKanban, UserRoundX, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";

// API Services
import {
  bin_dashboard_deleteById,
  bin_dashboard_Edit,
  bin_dashboard_get,
} from "../../../../service/Bin_Services/Bin_Services";
import Bin_View_Page from "./Bin_View_Page";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";

const Bin_Configuration = () => {
  const navigate = useNavigate();
    const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[8] || {};
  
  // Define permission checks
 const canView = userPermissions?.view ||  false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // UI STATES
  const [succesModel, setSuccessModel] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [isBinOpen, setIsBinOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // DATA STATES
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, customers: 0, projects: 0, active: 0, inactive: 0 });

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  // Helper function to extract error message from API response
  const extractErrorMessage = (error, defaultMessage = "An error occurred") => {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Check for nested data.message structure
      if (data.data?.message) {
        return data.data.message;
      }
      // Check for direct message property
      if (data.message) {
        return data.message;
      }
      // Check for msg property
      if (data.msg) {
        return data.msg;
      }
      // If it's a string, use it directly
      if (typeof data === 'string') {
        return data;
      }
    }
    
    // Handle network errors or other issues
    if (error.message) {
      return error.message;
    }
    
    return defaultMessage;
  };

  // Auto-close success popups
  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => setDeleteSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  useEffect(() => {
    if (succesModel) {
      const timer = setTimeout(() => setSuccessModel(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [succesModel]);

  // ---------- FETCH DATA ----------
  const fetchBinData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bin_dashboard_get(currentPage, itemsPerPage);
      const rawData = res?.data?.data?.records || res?.data?.data || res?.data || [];
      const totalCount = res?.data?.data?.total || rawData.length;

      const formattedData = rawData.map(item => ({
        ...item,
        id: item._id,
        binId: item.binId || "N/A",
        // Keep the actual ID for the API payload
        customer_Id_Raw: item.customerId?._id || item.customerId || null, 
        customerName: item.customerId?.customerName || item.customerName || "N/A",
        companyName: item.customerId?.companyName || item.companyName || "",
        projectName: item.projectId?.projectName || item.projectName || "N/A",
        itemName: item.itemMasterId?.itemName || item.itemName || "N/A",
        binMaxQuantity: item.binMaxQuantity || 0,
        isActive: item.status === 1 || item.status === true || item.itemStatus === 1 || item.itemStatus === true,
      }));

      setData(formattedData);
      setTotalItems(totalCount);
      calculateStats(formattedData, totalCount);
    } catch (err) {
      console.error("Error fetching bin data:", err);
      const errMsg = extractErrorMessage(err, "Failed to load bin configurations");
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchBinData();
  }, [fetchBinData]);

  // ---------- CALCULATE STATS ----------
  const calculateStats = (currentData, totalCount) => {
    const uniqueCustomers = new Set(currentData.map(d => d.customer_Id_Raw)).size;
    const uniqueProjects = new Set(currentData.map(d => d.projectId?._id || d.projectName)).size;

    setStats({
      total: totalCount || currentData.length,
      customers: uniqueCustomers,
      projects: uniqueProjects,
      active: currentData.filter(i => i.isActive).length,
      inactive: currentData.filter(i => !i.isActive).length,
    });
  };

  // ---------- SEARCH FILTER ----------
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item =>
      item.binId?.toLowerCase().includes(query) ||
      item.customerName?.toLowerCase().includes(query) ||
      item.projectName?.toLowerCase().includes(query) ||
      item.itemName?.toLowerCase().includes(query)
    );
  }, [searchQuery, data]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // ---------- STATUS TOGGLE ----------
  const handleToggleStatus = async (selectedRow) => {
    const newStatusBool = !selectedRow.isActive;
    const apiStatusValue = newStatusBool ? 1 : 0;

    // Construct the payload including customerId
    const payload = { 
      status: apiStatusValue,
      customerId: selectedRow.customer_Id_Raw // Sending the customer ID as requested
    };

    try {
      const res = await bin_dashboard_Edit(selectedRow.id, payload);

      // Extract success message from API response
      const successMessage = res?.data?.message || 
                            res?.data?.msg || 
                            "Status updated successfully!";

      if (res?.data?.success || res?.status === 200) {
        // Update local state for immediate UI feedback
        const updatedData = data.map(row =>
          row.id === selectedRow.id ? { ...row, isActive: newStatusBool } : row
        );
        setData(updatedData);
        calculateStats(updatedData, totalItems);
        setSuccessModel(true);
        // You can also show a success popup with the message if needed
      }
    } catch (err) {
      console.error("Status update failed:", err);
      const errMsg = extractErrorMessage(err, "Failed to update status");
      setErrorPopup({ open: true, message: errMsg });
    }
  };

  // ---------- DELETE HANDLERS ----------
  const handleDelete = (row) => {
    setDeleteTarget(row);
    setConfirmModel(true);
  };

  const executeDelete = async () => {
    setActionLoading(true);
    try {
      if (deleteTarget) {
        // Single delete
        const res = await bin_dashboard_deleteById(deleteTarget.id);
        
        // Extract success message from API response
        const successMessage = res?.data?.message || 
                              res?.data?.msg || 
                              "Bin configuration deleted successfully!";
        
        setDeleteSuccess(true);
        // You could also show the success message in a popup
        // setSuccessPopup({ open: true, message: successMessage });
        
        // Refresh data after delete
        await fetchBinData();
      } else if (selectedRows.length > 0) {
        // Bulk delete
        await Promise.all(selectedRows.map(id => bin_dashboard_deleteById(id)));
        
        setDeleteSuccess(true);
        setSelectedRows([]); // Clear selection after bulk delete
        
        // Refresh data after bulk delete
        await fetchBinData();
      }
      
      setConfirmModel(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      const errMsg = extractErrorMessage(err, "Failed to delete bin configuration");
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  // ---------- ACTION HANDLERS ----------
  const handleSelectionChange = (selectedIds) => setSelectedRows(selectedIds);

  const handleEdit = (row) => navigate('bin-create', { state: { rowId: row.id, mode: 'edit' } });

  const handleView = (row) => {
    setSelectedRowId(row.id);
    setIsBinOpen(true);
  };

  // Stats Cards Data
  const StatsData = [
    { title: "Total Bins", count: stats.total, footerText: "Registered Overall", icon: <Users /> },
    { title: "Total Customers", count: stats.customers, footerText: "Current Page", icon: <ShoppingCart /> },
    { title: "Total Projects", count: stats.projects, footerText: "Current Page", icon: <SquareKanban /> },
    { title: "Active Bins", count: stats.active, footerText: "Current Page", icon: <UserRoundX /> },
  ];

  const columns = [
    { header: 'BIN ID', key: 'binId' },
    { header: 'Customer', key: 'customerName', isCustomer: true },
    { header: 'Project Name', key: 'projectName' },
    { header: 'Item Name', key: 'itemName' },
    { header: 'Active', key: 'isActive', isToggle: true },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-[#fcfdfe] min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bin <span className="text-2xl font-bold text-[#0062a0]">Configuration</span> </h1>
            <p className="text-[#0062a0] font-medium mt-1">Management Console</p>
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={!canCreate} onClick={() => navigate('bin-create')} variant="primary">+ Create Bin</Button>
            <Download_Button disabled={!canView} onClick={() => setSuccessModel(true)} tooltipText="Export Data" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {StatsData.map((item, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatsCard title={item.title} count={item.count} footerText={item.footerText} icon={item.icon} />
            </motion.div>
          ))}
        </div>

        {/* Table Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="max-w-md w-full">
              <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search Bins by ID, Customer..." />
            </div>
            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }} 
                  className="flex items-center gap-4"
                >
                  <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">
                    {selectedRows.length} Selected
                  </span>
                  <button 
                    onClick={() => {
                      setDeleteTarget(null); // Clear single delete target for bulk delete
                      setConfirmModel(true);
                    }} 
                    className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                    disabled={actionLoading}
                  >
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-2">
            {loading && data.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading Bin Configurations...</p>
              </div>
            ) : (
              <ReUsable_Table
                columns={columns}
                data={filteredData}
                loading={loading}
                showToggle={true}
                showActions={canEdit || canDelete || canView}
                selectedRows={selectedRows}
                onSelectionChange={handleSelectionChange}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={(p) => setCurrentPage(p)}
                onLimitChange={(l) => {
                  setItemsPerPage(l);
                  setCurrentPage(1);
                }}
                onEdit={canEdit ? handleEdit : null}
                onDelete={canDelete ? handleDelete : null}
                onView={canView ? handleView : null}
                onStatusToggle={handleToggleStatus} 
                onRowClick={(row) => canView ? handleView(row) : null}
                ActionChildren="Action"
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {/* <Success_Popup 
        isOpen={succesModel} 
        onClose={() => setSuccessModel(false)} 
        message="File Downloaded Successfully!" 
      /> */}
      
      <Confirmation_Popup
        isOpen={confirmModel}
        onClose={() => {
          setConfirmModel(false);
          setDeleteTarget(null);
        }}
        onConfirm={executeDelete}
        message={
          actionLoading 
            ? "Processing..." 
            : deleteTarget 
              ? `Are you sure you want to delete Bin: ${deleteTarget.binId}?` 
              : selectedRows.length > 0 
                ? `Are you sure you want to delete ${selectedRows.length} selected items?`
                : "Are you sure you want to delete this item?"
        }
      />
      
      <Success_Popup 
        isOpen={deleteSuccess} 
        onClose={() => setDeleteSuccess(false)} 
        message={
          deleteTarget 
            ? "Bin Configuration Deleted Successfully!" 
            : selectedRows.length > 0 
              ? "Selected Items Deleted Successfully!" 
              : "Deleted Successfully!"
        } 
      />

      <ErrorMessage_Popup
        isOpen={errorPopup.open}
        onClose={() => setErrorPopup({ open: false, message: "" })}
        message={errorPopup.message}
      />

      <Bin_View_Page isOpen={isBinOpen} onClose={() => setIsBinOpen(false)} rowId={selectedRowId} />
    </motion.div>
  );
};

export default Bin_Configuration;