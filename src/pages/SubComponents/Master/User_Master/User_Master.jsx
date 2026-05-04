import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, UserCheck, UserCircle, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"

// API Services
import {
  user_create_edit,
  user_delete,
  user_export,
  user_master_get,
} from "../../../../service/Master_Services/Master_Services";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import { useDispatch, useSelector } from "react-redux";

const User_Master = () => {
  const navigate = useNavigate();
    const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[2] || {};
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
  const [succesModel, setSuccessModel] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Data States
  const [searchQuery, setSearchQuery] = useState("");
  const [masterData, setMasterData] = useState([]); // Initialized as empty array
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({ total: 0, subAdmin: 0, admin: 0, user: 0 });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // --- FETCH DATA ---
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await user_master_get(currentPage, itemsPerPage);
      
      // FIX: Improved mapping to ensure usersArray is ALWAYS an array
      const usersArray = res?.data?.data?.users || res?.data?.users || (Array.isArray(res?.data) ? res.data : []);
      const roleCounts = res?.data?.data?.roleCounts || [];
      const totalCountFromServer = res?.data?.data?.totalCount || usersArray.length;

      const formattedData = usersArray.map((item) => ({
        ...item,
        id: item._id || item.id,
        customerName: item.userName || "N/A", 
        companyName: item.companyName || "N/A", 
        formattedDate: formatDate(item.createdAt),
        status: item.status === 1, 
        role: item.userTypeId?.userTypeName || "User"
      }));

      setMasterData(formattedData);
      setTotalItems(totalCountFromServer);
      
      // Update Stats
      const sub = roleCounts.find(r => r.role === "SUB_ADMIN")?.count || 0;
      const adm = roleCounts.find(r => r.role === "ADMIN")?.count || 0;
      const usr = roleCounts.find(r => r.role === "USER")?.count || 0;
      setStats({ total: totalCountFromServer, subAdmin: sub, admin: adm, user: usr });
    } catch (err) {
      console.error("Error fetching users:", err);
      setMasterData([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return masterData;
    const query = searchQuery.toLowerCase();
    return masterData.filter((item) => 
      item.userName?.toLowerCase().includes(query) ||
      item.companyName?.toLowerCase().includes(query) ||
      item.userId?.toLowerCase().includes(query)
    );
  }, [searchQuery, masterData]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1); 
  };

  const handleToggleStatus = async (selectedRow) => {
    const newStatusBool = !selectedRow.status;
    const apiStatusValue = newStatusBool ? 1 : 0;
    try {
      const res = await user_create_edit(selectedRow.id, { status: apiStatusValue });
      if (res?.data?.success || res?.status === 200) {
        setMasterData(prev => prev.map(row => 
          row.id === selectedRow.id ? { ...row, status: newStatusBool } : row
        ));
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const response = await user_export(format);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `user_export_${new Date().toISOString().split('T')[0]}.${format}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessModel(true);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExportLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      setActionLoading(true);
      if (deleteTarget) {
        await user_delete(deleteTarget.id);
      } else {
        await Promise.all(selectedRows.map((id) => user_delete(id)));
      }
      setConfirmModel(false);
      setDeleteTarget(null);
      setSelectedRows([]);
      setDeleteSuccess(true);
      fetchUserData();
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (row) => navigate("user-create", { state: { rowId: row.id, mode: "edit" } });
  const handleView = (row) => navigate("user-view", { state: { rowId: row.id } });

  const StatsData = [
    { title: "Total User", count: stats.total, footerText: "OverAll", icon: <Users /> },
    { title: "Sub Admin", count: stats.subAdmin, footerText: "OverAll", icon: <ShieldCheck /> },
    { title: "Admin", count: stats.admin, footerText: "OverAll", icon: <UserCheck /> },
    { title: "User", count: stats.user, footerText: "OverAll", icon: <UserCircle /> },
  ];

  const columns = [
    { header: "Customer Detail", key: "companyName" },
    { header: "User Name", key: "userName" },
    { header: "User Id", key: "userId" },
    { header: "Created", key: "formattedDate" }, 
    { header: "Position", key: "position" },
    { header: "User Type", key: "role" },
    { header: "Status", key: "status", isToggle: true },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="p-6 md:p-8 bg-[#fcfdfe] min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">User <span className="text-[#0062a0]">Master</span></h1>
            <p className="text-[#0062a0] font-medium mt-1">Directory Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("user-create")} variant="primary" disabled={!canCreate}>
              + Create User
            </Button>
            <Download_Button onSelect={handleExport} disabled={!canView} tooltipText={exportLoading ? "Generating..." : "Export Data"} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {StatsData.map((item, index) => (
            <StatsCard key={index} title={item.title} count={item.count} footerText={item.footerText} icon={item.icon} />
          ))}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search user details..." />
            
            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">
                    {selectedRows.length} Selected
                  </span>
                  <button onClick={() => setConfirmModel(true)} className="text-red-500 hover:text-red-700 text-sm font-bold">
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-2">
            <ReUsable_Table
              columns={columns} 
              data={filteredData} // Passing filtered data (Array)
              loading={loading}
              showToggle={true}
              showActions={canEdit || canDelete || canView}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={(p) => setCurrentPage(p)}
              onLimitChange={(l) => { setItemsPerPage(l); setCurrentPage(1); }}

              onEdit={canEdit ? handleEdit : null}
              onDelete={canDelete ? (row) => { setDeleteTarget(row); setConfirmModel(true); } : null}
              onView={canView ? handleView : null}
              onStatusToggle={handleToggleStatus}
              onRowClick={handleView}
              ActionChildren="Action"
            />
          </div>
        </div>
      </div>

      <Success_Popup isOpen={succesModel} onClose={() => setSuccessModel(false)} message="File Downloaded Successfully!" />
      <Confirmation_Popup 
        isOpen={confirmModel} 
        onClose={() => { setConfirmModel(false); setDeleteTarget(null); }} 
        onConfirm={executeDelete} 
        message={actionLoading ? "Processing..." : "Are you sure you want to delete?"} 
      />
      <Success_Popup isOpen={deleteSuccess} onClose={() => setDeleteSuccess(false)} message="Deleted Successfully!" />
    </motion.div>
  );
};

export default User_Master;