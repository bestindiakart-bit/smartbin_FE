import { AnimatePresence, motion } from "framer-motion";
import { Loader2, UserCheck, UserRoundX, Users, Warehouse } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"

// API Services
import {
  warehouse_create_edit,
  warehouse_delete,
  warehouse_get
} from "../../../../service/Orders_Services/Oreder_Services";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import Warehouse_View from "./Warehouse_View";
import { useDispatch, useSelector } from "react-redux";

const WareHouse_Orders = () => {
  const navigate = useNavigate();
          const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[6] || {};
  console.log("Permissions in User Master:", userPermissions);
  
  // Define permission checks
   const canView = userPermissions?.view ||  false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // UI States
  const [successModel, setSuccessModel] = useState(false);
  const[confirmModel, setConfirmModel] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isViewModel, setIsViewModel] = useState(false);
  const[loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [data, setData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const[searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Stats State
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const[totalItems, setTotalItems] = useState(0);

  // --- 1. CALCULATE STATS FROM DATA (Updated to match Customer_Master) ---
  const calculateStats = (currentData) => {
    setStats({
      total: currentData.length,
      active: currentData.filter(i => i.status === true).length,
      inactive: currentData.filter(i => i.status === false).length
    });
  };

  // --- 2. FETCH DATA (Updated Mapping) ---
 const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await warehouse_get(currentPage, itemsPerPage);
      
      if (res?.data?.success) {
        const apiData = res.data.data?.records || res.data.data?.items || res.data.data ||[];
        const totalCount = res.data.data?.total || res.data.totalCount || res.data.totalRecords || apiData.length;
        
        // Format data: Map nested customerName to the top level
        const formattedData = apiData.map(item => ({
          ...item,
          id: item._id || item.id,
          status: item.status === 1,
          // Extract nested customerName here safely
          customerName: item.customerId?.companyName || "Unknown Customer" 
        }));
        
        setData(formattedData);
        setTotalItems(totalCount);
        calculateStats(formattedData);
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // --- 3. STATUS TOGGLE API (Matched to Customer_Master Logic) ---
  const handleToggleStatus = async (selectedRow) => {
    const newStatusBool = !selectedRow.status;
    const apiStatusValue = newStatusBool ? 1 : 0;
    
    try {
      // Sending { status: apiStatusValue } payload just like customer_master
      const res = await warehouse_create_edit(selectedRow.id, { status: apiStatusValue });
      
      if (res?.data?.success || res?.status === 200) {
        const updatedData = data.map(row => 
          row.id === selectedRow.id ? { ...row, status: newStatusBool } : row
        );
        setData(updatedData);
        calculateStats(updatedData);
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // --- 4. DELETE LOGIC ---
  const handleDeleteTrigger = (row) => {
    setDeleteTarget(row);
    setConfirmModel(true);
  };

  const executeDelete = async () => {
    try {
      setActionLoading(true);
      if (deleteTarget) {
        await warehouse_delete(deleteTarget.id);
      } else {
        // Bulk delete if multiple selected
        await Promise.all(selectedRows.map(id => warehouse_delete(id)));
      }
      setConfirmModel(false);
      setDeleteTarget(null);
      setSelectedRows([]);
      setDeleteSuccess(true);
      fetchWarehouses(); // Refresh list
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // --- 5. SEARCH LOGIC ---
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) => (
      item.warehouseName?.toLowerCase().includes(query) ||
      item.warehouseId?.toLowerCase().includes(query) ||
      item.customerName?.toLowerCase().includes(query) ||
      item.warehouseLocation?.toLowerCase().includes(query)
    ));
  },[searchQuery, data]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1); 
  };

  // --- 6. STATS CONFIG ---
   const StatsData =[
    { 
      title: "Total Warehouses", 
      count: stats.total, 
      footerText: "Current Page", 
      icon: <Warehouse className="text-[#0062a0]" /> 
    },
    { 
      // Replace "Total Customers" with whatever the 2nd metric should be
      title: "Total Customers", 
      count: "0", 
      footerText: "OverAll", 
      icon: <Users className="text-slate-500" /> 
    },
    { 
      title: "Total Active", 
      count: stats.active, 
      footerText: "Current Page", 
      icon: <UserCheck className="text-green-500" /> 
    },
    { 
      title: "Total Inactive", 
      count: stats.inactive, 
      footerText: "Current Page", 
      icon: <UserRoundX className="text-red-500" /> 
    },
  ];

  const columns =[
    { header: 'Warehouse ID', key: 'warehouseId' },
    { header: 'Customer', key: 'customerName' },
    { header: 'Warehouse Name', key: 'warehouseName' },
    { header: 'Location', key: 'warehouseLocation' },
    { header: 'Active', key: 'status', isToggle: true }, 
  ];

  const handleEdit = (row) => navigate('warehouse-create', { state: { mode: 'edit', id: row.id } });
  
  const handleView = (row) => {
    setSelectedId(row.id);
    setIsViewModel(true);
  };

  return (
    <motion.div initial="hidden" animate="visible" className="bg-[#fcfdfe] min-h-screen">
      <div className="max-w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse <span className="text-[#0062a0]">Orders</span></h1>
            <p className="text-[#0062a0] font-medium mt-1">Inventory & Warehouse Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={!canCreate} onClick={() => navigate('warehouse-create')} variant="primary">+ Create Warehouse</Button>
            <Download_Button disabled={!canView} onClick={() => setSuccessModel(true)} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {StatsData.map((item, index) => (
            <StatsCard key={index} title={item.title} count={item.count} footerText={item.footerText} icon={item.icon} />
          ))}
        </div>

        {/* Search and Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="max-w-md w-full">
              <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search warehouse..." />
            </div>
            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">{selectedRows.length} Items Selected</span>
                  <button onClick={() => setConfirmModel(true)} className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors">Delete</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-2">
            {loading && data.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400 font-medium">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading Data...</p>
              </div>
            ) : (
              <ReUsable_Table
                columns={columns} 
                data={filteredData}
                loading={loading}
                showToggle={true}
                showActions={true}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                
                // Pagination Props
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={(p) => setCurrentPage(p)}
                onLimitChange={(l) => {
                  setItemsPerPage(l);
                  setCurrentPage(1);
                }}

                // Action Handlers
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDeleteTrigger : undefined}
                onView={canView ? handleView : undefined}
                onStatusToggle={handleToggleStatus}
                onRowClick={canView ? handleView : undefined}
                tableHeight="h-[550px]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Popups */}
      <Success_Popup isOpen={successModel} onClose={() => setSuccessModel(false)} message="File Downloaded Successfully!" />
      
      <Confirmation_Popup 
        isOpen={confirmModel} 
        onClose={() => { setConfirmModel(false); setDeleteTarget(null); }} 
        onConfirm={executeDelete} 
        message={actionLoading ? "Deleting..." : "Are you sure you want to delete?"} 
      />
      
      <Success_Popup isOpen={deleteSuccess} onClose={() => setDeleteSuccess(false)} message="Deleted Successfully!" />
      
      <Warehouse_View
        isOpen={isViewModel}
        onClose={() => setIsViewModel(false)}
        id={selectedId}
      />
    </motion.div>
  );
};

export default WareHouse_Orders;