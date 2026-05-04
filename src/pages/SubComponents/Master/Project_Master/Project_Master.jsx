import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, SquareKanban, Users, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Project_Master_View from "./Project_Master_View";
import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";

// API Services
import {
  project_export,
  project_master_delete,
  project_master_get,
  project_patch_row,
} from "../../../../service/Master_Services/Master_Services";

// Project Components
import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import { useDispatch, useSelector } from "react-redux";

const Project_Master = () => {
  const navigate = useNavigate();
      const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[3] || {};
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
  const[deleteSuccess, setDeleteSuccess] = useState(false);
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const[isOpenViewPage, setIsOpenViewPage] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Data States
  const [searchQuery, setSearchQuery] = useState("");
  const [projectData, setProjectData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({ total: 0, customers: 0, active: 0, inactive: 0 });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  useEffect(()=>{
    if(deleteSuccess){
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
      }, 2000);
      return () => clearTimeout(timer)
    }
  })

  // --- 1. FETCH DATA (Dynamic Pagination & Flattening) ---
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Passing page and limit to the API service
      const res = await project_master_get(currentPage, itemsPerPage);
      
      const rawArray = res?.data?.data?.projects ||[];
      const totalCountFromServer = res?.data?.data?.totalCount || rawArray.length;

      const formattedData = rawArray.map((item) => ({
        ...item,
        id: item._id, 
        customerName: item.projectName || "N/A", 
        companyName: item.slug || "No slug", 
        customerDisplayName: item.customerId?.companyName || "N/A",
        status: item.status === 1 || item.status === true,
        formattedCreatedDate: formatDate(item.createdAt),
      }));

      setProjectData(formattedData);
      setTotalItems(totalCountFromServer);
      
      // Calculate Stats (Based on current page data or full data if provided by API)
      calculateStats(formattedData, totalCountFromServer);
    } catch (err) {
      console.error("Fetch Error:", err);
      setProjectData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const calculateStats = (data, totalCount) => {
    const uniqueCustomers =[...new Set(data.map(item => item?.customerId?._id))].filter(Boolean).length;
    setStats({
      total: totalCount,
      customers: uniqueCustomers,
      active: data.filter(i => i.status === true).length,
      inactive: data.filter(i => i.status === false).length,
    });
  };

  useEffect(() => { 
    fetchProjects(); 
  }, [fetchProjects]);

  // --- 2. SEARCH & FILTER ---
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return projectData;
    const query = searchQuery.toLowerCase();
    return projectData.filter((item) => 
      item.projectName?.toLowerCase().includes(query) ||
      item.projectId?.toLowerCase().includes(query) ||
      item.customerDisplayName?.toLowerCase().includes(query)
    );
  }, [searchQuery, projectData]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  // --- 3. STATUS TOGGLE ---
  const handleToggleStatus = async (selectedRow) => {
    const newStatusBool = !selectedRow.status;
    const apiValue = newStatusBool ? 1 : 0; 
    const patchPayload = { status: apiValue };

    try {
      const res = await project_patch_row(selectedRow.id, patchPayload);
      if (res?.data?.success || res?.status === 200) {
        setProjectData(prev => prev.map(row => 
          row.id === selectedRow.id ? { ...row, status: newStatusBool } : row
        ));
      }
    } catch (err) {
      const errMsg = err.response?.data?.data?.message || "Update Failed";
      setErrorPopup({ open: true, message: errMsg });
    }
  };

  // --- 4. EXPORT LOGIC ---
  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      const response = await project_export(format);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `project_export_${new Date().toISOString().split('T')[0]}.${format}`;
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

  // --- 5. DELETE LOGIC ---
  const handleDelete = (row) => {
    setDeleteTarget(row);
    setConfirmModel(true);
  };

  const executeDelete = async () => {
    try {
      setActionLoading(true);
      if (deleteTarget) {
        await project_master_delete(deleteTarget.id);
      } else {
        await Promise.all(selectedRows.map((id) => project_master_delete(id)));
      }
      setConfirmModel(false);
      setDeleteTarget(null);
      setSelectedRows([]);
      setDeleteSuccess(true);
      fetchProjects();
    } catch (err) {
      setErrorPopup({ open: true, message: "Deletion failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = (row) => { setSelectedRowId(row.id); setIsOpenViewPage(true); };
  const handleEdit = (row) => navigate('project-create', { state: { rowId: row.id, mode: 'edit' } });

  const StatsData =[
    { title: "Total Project", count: stats.total, footerText: "OverAll", icon: <SquareKanban /> },
    { title: "Total Customers", count: stats.customers, footerText: "Current Page", icon: <Users /> },
    { title: "Total Active", count: stats.active, footerText: "Current Page", icon: <CheckCircle2 /> },
    { title: "Total Inactive", count: stats.inactive, footerText: "Current Page", icon: <XCircle /> },
  ];
  
  const columns =[
    { header: 'Project ID', key: 'projectId' },
    { header: 'Project Name', key: 'customerName', isCustomer: true }, 
    { header: 'Customer', key: 'customerDisplayName' }, 
    { header: 'Created', key: 'formattedCreatedDate' },
    { header: "Status", key: "status", isToggle: true },
  ];

  return (
    <motion.div initial="hidden" animate="visible" className="p-6 md:p-8 bg-[#fcfdfe] min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Project <span className="text-[#0062a0]">Master</span></h1>
            <p className="text-[#0062a0] font-medium mt-1">Directory Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button disabled ={!canCreate} onClick={() => navigate('project-create')} variant="primary">+ Create Project</Button>
            <Download_Button disabled={!canView} onSelect={handleExport} tooltipText={exportLoading ? "Generating..." : "Export Data"} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {StatsData.map((item, index) => (
            <StatsCard key={index} title={item.title} count={item.count} footerText={item.footerText} icon={item.icon} />
          ))}
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          {/* SEARCH & BULK DELETE ACTION BAR */}
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="max-w-md w-full">
              <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search projects..." />
            </div>

            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">
                    {selectedRows.length} Selected
                  </span>
                  <button onClick={() => setConfirmModel(true)} className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors">
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-2">
            {loading && projectData.length === 0 ? (
              <div className="p-20 text-center"><Loader2 className="animate-spin inline text-[#0062a0]" size={32} /></div>
            ) : (
              <ReUsable_Table
                columns={columns} 
                data={filteredData}
                loading={loading}
                showToggle={true}
                showActions={canEdit || canDelete || canView}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}

                // --- Pagination Props ---
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={(p) => setCurrentPage(p)}
                onLimitChange={(l) => {
                  setItemsPerPage(l);
                  setCurrentPage(1);
                }}

                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDelete : undefined}
                onView={canView ? handleView : undefined}
                onStatusToggle={handleToggleStatus}
                onRowClick={canView ? handleView : undefined}
                ActionChildren="Action"
              />
            )}
          </div>
        </div>
      </div>

      <Success_Popup isOpen={succesModel} onClose={() => setSuccessModel(false)} message="File Downloaded Successfully!" />
      <Confirmation_Popup isOpen={confirmModel} onClose={() => { setConfirmModel(false); setDeleteTarget(null); }} onConfirm={executeDelete} message={actionLoading ? "Processing..." : "Are you sure you want to delete?"} />
      <ErrorMessage_Popup isOpen={errorPopup.open} onClose={() => setErrorPopup({ ...errorPopup, open: false })} message={errorPopup.message} />
      <Project_Master_View isOpen={isOpenViewPage} onClose={() => { setIsOpenViewPage(false); setSelectedRowId(null); }} rowId={selectedRowId} />
      <Success_Popup isOpen={deleteSuccess} onClose={() => setDeleteSuccess(false)} message="Deleted Successfully!" />
    </motion.div>
  );
};

export default Project_Master;