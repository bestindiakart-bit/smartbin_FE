import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, SquareKanban, UserRoundX, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";

// Import API services
import { deleteAPI, getAPI } from "../../../../service/Orders_Services/Oreder_Services";
import { useDispatch, useSelector } from "react-redux";

const Bill_Of_Metarials = () => {
  const navigate = useNavigate();
    const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[9] || {};
  
  // Define permission checks
 const canView = userPermissions?.view ||  false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);
  
  // UI States
  const [succesModel, setSuccessModel] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [DeleteSuccess, setDeleteSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [stats, setStats] = useState({ 
    total: 0, 
    active: 0, 
    totalItems: 0,
    uniqueCustomers: 0 
  });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // --- SMOOTHNESS VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
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

  // Calculate stats from all data (accumulated across pages)
  const calculateStats = (allData) => {
    // Count unique customers
    const uniqueCustomers = new Set(
      allData.map(item => item.customerName).filter(name => name !== 'N/A')
    ).size;
    
    // Count total items across all BOMs
    const totalItemsCount = allData.reduce((acc, item) => {
      if (item.items && Array.isArray(item.items)) {
        return acc + item.items.length;
      }
      return acc;
    }, 0);
    
    // Count active BOMs
    const activeBOMs = allData.filter(item => item.isActive).length;

    setStats({
      total: allData.length,
      active: activeBOMs,
      totalItems: totalItemsCount,
      uniqueCustomers: uniqueCustomers
    });
  };

  // --- FETCH BOM DATA WITH PAGINATION ---
  const fetchBOMData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAPI('/bom/', { page: currentPage, limit: itemsPerPage });
      
      // Handle paginated response structure
      const responseData = res?.data?.data || res?.data;
      
      // Extract items and pagination info
      const boms = responseData?.boms || responseData || [];
      const pagination = responseData?.pagination || {};
      
      // Set pagination info
      setTotalItems(pagination.totalItems || boms.length);
      
      const formattedData = boms.map((b) => ({
        id: b._id,
        bomId: b.bomId || 'N/A',
        bomName: b.bomName || 'N/A',
        customerName: b.customerId?.companyName || b.customerId?.name || 'N/A',
        projectName: b?.projectId?.projectName || 'N/A',
        itemName: b?.items?.map(item => item?.itemId?.itemName).join(', ') || 'N/A',
        status: b.isActive === false ? 'Inactive' : 'Active',
        isActive: b.isActive !== false,
        // Store complete data for edit
        customerId: b.customerId?._id || b.customerId,
        projectId: b.projectId?._id || b.projectId,
        items: b.items || [],
        overallQuantity: b.overallQuantity || 0
      }));
      
      setData(formattedData);
      
      // Calculate stats from current page data
      calculateStats(formattedData);
      
    } catch (error) {
      console.error("Error fetching BOM list:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Trigger fetch when page or limit changes
  useEffect(() => {
    fetchBOMData();
  }, [fetchBOMData]);

  // --- FILTER LOGIC (Local search on current page data) ---
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.bomId?.toLowerCase().includes(query) ||
        item.bomName?.toLowerCase().includes(query) ||
        item.customerName?.toLowerCase().includes(query) ||
        item.projectName?.toLowerCase().includes(query) ||
        item.itemName?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
    );
  }, [searchQuery, data]);

  // Handle search input change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    // Don't reset page when searching within current page data
  };

  // --- STATUS TOGGLE ---
  const handleToggleStatus = async (selectedRow) => {
    const newStatus = !selectedRow.isActive;
    const newStatusText = newStatus ? 'Active' : 'Inactive';
    
    try {
      // Optimistically update UI
      const updatedData = data.map((row) =>
        row.id === selectedRow.id 
          ? { ...row, isActive: newStatus, status: newStatusText } 
          : row
      );
      setData(updatedData);
      calculateStats(updatedData);
      
      // You can implement API call here if backend supports status toggle
      // await putAPI(`/bom/${selectedRow.id}/toggle-status`, { isActive: newStatus });
      
    } catch (err) {
      console.error("Status update failed:", err);
      // Revert on error
      fetchBOMData();
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = (row) => {
    setDeleteId(row.id);
    setConfirmModel(true);
  };

  const executeDelete = async () => {
    try {
      setActionLoading(true);
      
      if (deleteId) {
        await deleteAPI(`/bom/${deleteId}`);
      } else if (selectedRows.length > 0) {
        // Handle bulk delete if needed
        await Promise.all(selectedRows.map(id => deleteAPI(`/bom/${id}`)));
      }
      
      setConfirmModel(false);
      setDeleteId(null);
      setSelectedRows([]);
      setDeleteSuccess(true);
      await fetchBOMData(); // Refresh current page
      
    } catch (error) {
      console.error("Error deleting BOM:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // --- NAVIGATION & TABLE CONFIG ---
  const handleEdit = (row) => {
    // Format items for the edit page
    const formattedItems = row.items?.map((item, index) => {
      const itemData = item.itemId || item;
      return {
        id: index + 1,
        _id: itemData?._id || item._id,
        supplierItem: itemData?.itemName || item.itemName || "N/A",
        customerItem: itemData?.customerItemName || item.customerItemName || itemData?.itemName || item.itemName || "N/A",
        unit: item.quantity || item.qty || 0
      };
    }) || [];

    navigate('bill-create', { 
      state: { 
        mode: 'edit', 
        rowId: row.id,
        bomData: {
          bomName: row.bomName,
          customerId: row.customerId,
          projectId: row.projectId,
          overallQuantity: row.overallQuantity,
          items: row.items
        },
        itemListData: formattedItems
      } 
    });
  };
  
  const handleView = (row) => {
    navigate('bill-view', { 
      state: { 
        rowId: row.id,
        rowData: row
      } 
    });
  };

  // Auto-close success popups
  useEffect(() => {
    if (succesModel) {
      const timer = setTimeout(() => setSuccessModel(false), 2000);
      return () => clearTimeout(timer); 
    }
  }, [succesModel]);

  useEffect(() => {
    if (DeleteSuccess) {
      const timer = setTimeout(() => setDeleteSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [DeleteSuccess]);

  // Stats cards data
  const StatsData = [
    { 
      title: "Total BOMs", 
      count: stats.total, 
      footerText: "Current Page", 
      icon: <Users /> 
    },
    { 
      title: "Active BOMs", 
      count: stats.active, 
      footerText: "Current Page", 
      icon: <ShoppingCart /> 
    },
    { 
      title: "Total Items", 
      count: stats.totalItems, 
      footerText: "Across BOMs", 
      icon: <SquareKanban /> 
    },
    { 
      title: "Customers", 
      count: stats.uniqueCustomers, 
      footerText: "Unique", 
      icon: <UserRoundX /> 
    },
  ];
  
  const columns = [
    { header: 'BOM Id', key: 'bomId' },
    { header: 'BOM Name', key: 'bomName' },
    { header: 'Customer', key: 'customerName', isCustomer: true },
    { header: 'Project Name', key: 'projectName', isCustomer: true },
    { header: 'Item Name', key: 'itemName' },
    { header: 'Status', key: 'status', isStatus: true },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 md:p-8 bg-[#fcfdfe] min-h-screen"
    >
      <div className="max-w-full mx-auto">
        
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Bill of <span className="text-[#0062a0]">Materials</span>
            </h1>
            <p className="text-[#0062a0] font-medium mt-1">BOM Master Directory</p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button disabled={!canCreate} onClick={() => navigate('bill-create')} variant="primary">
                + Create BOM
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Download_Button disabled={!canView} onClick={() => setSuccessModel(true)} />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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

        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="max-w-md w-full">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by BOM ID, Name, Customer, Project..."
              />
            </div>

            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">
                    {selectedRows.length} Selected
                  </span>
                  <button
                    onClick={() => {
                      setDeleteId(null); // Clear single delete ID
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
            <ReUsable_Table
              columns={columns}
              data={filteredData}
              loading={loading}
              showStatusBadge={true}
              showToggle={true}
              showActions={true}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              // Pagination Props (built into ReUsable_Table)
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={(page) => setCurrentPage(page)}
              onLimitChange={(limit) => {
                setItemsPerPage(limit);
                setCurrentPage(1); // Reset to page 1 when limit changes
              }}
              onEdit={canEdit ? handleEdit : null}
              onDelete={canDelete ? handleDelete : null}
              onView={canView ? handleView : null}
              onStatusToggle={handleToggleStatus}
              onRowClick={(row) => canView ? handleView(row) : null}
              ActionChildren="Actions"
            />
          </div>
          
          {/* Optional footer with additional info */}
          {filteredData.length > 0 && searchQuery && (
            <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500">
              Found {filteredData.length} results on page {currentPage}
              {filteredData.length !== data.length && (
                <span> (filtered from {data.length} items)</span>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <Success_Popup
        isOpen={succesModel}
        onClose={() => setSuccessModel(false)}
        message="File Downloaded Successfully!"
      />
      
      <Confirmation_Popup
        isOpen={confirmModel}
        onClose={() => {
          setConfirmModel(false);
          setDeleteId(null);
        }}
        onConfirm={executeDelete}
        message={
          actionLoading 
            ? "Processing..." 
            : selectedRows.length > 0 
              ? `Are you sure you want to delete ${selectedRows.length} selected BOMs?`
              : "Are you sure you want to delete this BOM entry?"
        }
      />

      <Success_Popup
        isOpen={DeleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message={selectedRows.length > 0 ? "BOMs Deleted Successfully!" : "BOM Deleted Successfully!"}
      />
    </motion.div>
  );
};

export default Bill_Of_Metarials;