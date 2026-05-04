import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  SquareKanban,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// API Services
import {
  customer_create_edit,
  customer_delete,
  customer_export,
  customer_get,
} from "../../../../service/Master_Services/Master_Services";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";

const Customer_Master = () => {
  const navigate = useNavigate();
  const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[1] || {};
  
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
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorModel, setErrorModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Data States
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // --- 1. FETCH DATA (Dynamic) ---
  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customer_get(currentPage, itemsPerPage);

      if (res?.data?.success) {
        const rawData = res?.data?.data?.records || [];
        const totalCount = res?.data?.data?.total || 0;

        const formattedData = rawData.map((item) => ({
          ...item,
          id: item._id,
          status: item.status === 1,
        }));

        setData(formattedData);
        setTotalItems(totalCount);
        calculateStats(formattedData);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setErrorMessage("Failed to fetch customers");
      setErrorModel(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const calculateStats = (currentData) => {
    setStats({
      total: currentData.length,
      active: currentData.filter((i) => i.status === true).length,
      inactive: currentData.filter((i) => i.status === false).length,
    });
  };

  // Trigger fetch when page or limit changes
  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  // --- 2. EXPORT LOGIC ---
  const handleExport = async (format) => {
    if (!canView) {
      setErrorMessage("You don't have permission to export customer data");
      setErrorModel(true);
      return;
    }

    try {
      setExportLoading(true);
      const response = await customer_export(format.toLowerCase());
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `Customer_Master_Report.${format.toLowerCase()}`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessModel(true);
    } catch (err) {
      console.error("Export failed:", err);
      setErrorMessage("Export failed. Please try again.");
      setErrorModel(true);
    } finally {
      setExportLoading(false);
    }
  };

  // --- 3. FILTER LOGIC (Local search on current page data) ---
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.companyName?.toLowerCase().includes(query) ||
        item.customerName?.toLowerCase().includes(query) ||
        item.adminEmail?.toLowerCase().includes(query) ||
        item.gstNumber?.toLowerCase().includes(query)
    );
  }, [searchQuery, data]);

  // Handle search input change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  // --- 4. STATUS TOGGLE ---
  const handleToggleStatus = async (selectedRow) => {
    const newStatusBool = !selectedRow.status;
    const apiStatusValue = newStatusBool ? 1 : 0;
    try {
      const res = await customer_create_edit(selectedRow.id, {
        status: apiStatusValue,
      });
      if (res?.data?.success || res?.status === 200) {
        const updatedData = data.map((row) =>
          row.id === selectedRow.id ? { ...row, status: newStatusBool } : row,
        );
        setData(updatedData);
        calculateStats(updatedData);
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // --- 5. DELETE LOGIC ---
  const handleDelete = (row) => {
    if (!canDelete) {
      setErrorMessage("You don't have permission to delete customers");
      setErrorModel(true);
      return;
    }
    setDeleteTarget(row);
    setConfirmModel(true);
  };

  const handleBulkDelete = () => {
    if (!canDelete) {
      setErrorMessage("You don't have permission to delete customers");
      setErrorModel(true);
      return;
    }
    if (selectedRows.length === 0) {
      setErrorMessage("Please select customers to delete");
      setErrorModel(true);
      return;
    }
    setConfirmModel(true);
  };

  const executeDelete = async () => {
    if (!canDelete) {
      setErrorMessage("You don't have permission to delete customers");
      setErrorModel(true);
      setConfirmModel(false);
      return;
    }

    try {
      setActionLoading(true);
      if (deleteTarget) {
        await customer_delete(deleteTarget.id);
      } else {
        await Promise.all(selectedRows.map((id) => customer_delete(id)));
      }
      setConfirmModel(false);
      setDeleteTarget(null);
      setSelectedRows([]);
      setDeleteSuccess(true);
      await fetchCustomerData();
    } catch (err) {
      console.error("Deletion failed:", err);
      setErrorMessage("Failed to delete customers");
      setErrorModel(true);
    } finally {
      setActionLoading(false);
    }
  };

  // --- 6. NAVIGATION & TABLE CONFIG ---
  const handleEdit = (row) => {
    if (!canEdit) {
      setErrorMessage("You don't have permission to edit customers");
      setErrorModel(true);
      return;
    }
    navigate("create-customer", {
      state: { rowId: row.id, mode: "edit", projectId: row.projectId },
    });
  };

  const handleView = (row) => {
    if (!canView) {
      setErrorMessage("You don't have permission to view customer details");
      setErrorModel(true);
      return;
    }
    navigate("customer-view", {
      state: { rowId: row.id, projectId: row.projectId },
    });
  };

  const handleCreate = () => {
    if (!canCreate) {
      setErrorMessage("You don't have permission to create customers");
      setErrorModel(true);
      return;
    }
    navigate("create-customer");
  };

  const StatsData = [
    {
      title: "Total Customer",
      count: stats.total,
      footerText: "Current Page",
      icon: <Users />,
    },
    {
      title: "Total Projects",
      count: "0",
      footerText: "OverAll",
      icon: <SquareKanban />,
    },
    {
      title: "Total Active",
      count: stats.active,
      footerText: "Current Page",
      icon: <UserCheck />,
    },
    {
      title: "Total Inactive",
      count: stats.inactive,
      footerText: "Current Page",
      icon: <UserRoundX />,
    },
  ];

  const columns = [
    { header: "Company Name", key: "companyName" },
    { header: "Customer Name", key: "customerName", isCustomer: true },
    { header: "Email", key: "adminEmail" },
    { header: "GST Number", key: "gstNumber" },
    { header: "Transit Days", key: "transitDays" },
    { header: "Active", key: "status", isToggle: true },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="bg-[#fcfdfe] min-h-screen"
    >
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Customer <span className="text-[#0062a0]">Master</span>
            </h1>
            <p className="text-[#0062a0] font-medium mt-1">
              Directory Management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreate}
              variant="primary"
              disabled={!canCreate}
              title={!canCreate ? "You don't have permission to create" : ""}
            >
              + Create Customer
            </Button>
            <Download_Button
              onSelect={handleExport}
              tooltipText={exportLoading ? "Generating..." : "Export Data"}
              disabled={!canView}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {StatsData.map((item, index) => (
            <StatsCard
              key={index}
              title={item.title}
              count={item.count}
              footerText={item.footerText}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="max-w-md w-full">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search customers..."
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
                  {canDelete && (
                    <button
                      onClick={handleBulkDelete}
                      className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                    >
                      Delete Selected
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-2">
            {loading && data.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading Customers...</p>
              </div>
            ) : (
              <ReUsable_Table
                columns={columns}
                data={filteredData}
                loading={loading}
                showToggle={true}
                showActions={canEdit || canDelete || canView}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
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
                onStatusToggle={ handleToggleStatus}
                onRowClick={canView ? (row) => handleView(row) : null}
                ActionChildren="Actions"
              />
            )}
          </div>
        </div>
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
          setDeleteTarget(null);
        }}
        onConfirm={executeDelete}
        message={
          actionLoading
            ? "Processing..."
            : deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.companyName || deleteTarget.customerName}?`
            : `Are you sure you want to delete ${selectedRows.length} selected customer(s)?`
        }
        title="Confirm Delete"
        loading={actionLoading}
      />
      
      <Success_Popup
        isOpen={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Deleted Successfully!"
      />

      <ErrorMessage_Popup
        isOpen={errorModel}
        onClose={() => setErrorModel(false)}
        message={errorMessage}
        title="Error"
        btnText="Close"
      />
    </motion.div>
  );
};

export default Customer_Master;