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
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";

const Customer_Master = () => {
  const navigate = useNavigate();

  // UI States
  const [succesModel, setSuccessModel] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
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
        item.gstNumber?.toLowerCase().includes(query),
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
    setDeleteTarget(row);
    setConfirmModel(true);
  };

  const executeDelete = async () => {
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
    } finally {
      setActionLoading(false);
    }
  };

  // --- NAVIGATION & TABLE CONFIG ---
  const handleEdit = (row) =>
    navigate("create-customer", { state: { rowId: row.id, mode: "edit", projectId: row.projectId } });
  const handleView = (row) =>
    navigate("customer-view", { state: { rowId: row.id, projectId: row.projectId } });

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
      className="p-6 md:p-8 bg-[#fcfdfe] min-h-screen"
    >
      <div className="max-w-[1600px] mx-auto">
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
              onClick={() => navigate("create-customer")}
              variant="primary"
            >
              + Create Customer
            </Button>
            <Download_Button
              onSelect={handleExport}
              tooltipText={exportLoading ? "Generating..." : "Export Data"}
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
                  <button
                    onClick={() => setConfirmModel(true)}
                    className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
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
                <p>Loading Customers...</p>
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
                // --- Dynamic Pagination Props ---
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={(p) => setCurrentPage(p)}
                onLimitChange={(l) => {
                  setItemsPerPage(l);
                  setCurrentPage(1); // Reset to page 1 when limit changes
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onStatusToggle={handleToggleStatus}
                onRowClick={(row) => handleView(row)}
                ActionChildren="Action"
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
          actionLoading ? "Processing..." : "Are you sure you want to delete?"
        }
      />
      <Success_Popup
        isOpen={deleteSuccess}
        onClose={() => setDeleteSuccess(false)}
        message="Deleted Successfully!"
      />
    </motion.div>
  );
};

export default Customer_Master;
