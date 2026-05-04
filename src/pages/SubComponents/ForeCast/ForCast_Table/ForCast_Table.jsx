import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import Download_Button from '../../../../component/button/Download_Button';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import SearchBar from '../../../../component/SearchBar/SearchBar';
import ReUsable_Table from '../../../../component/Table/ReUsable_Table';
import Button from '../../../../component/button/Buttons';
import { useNavigate } from 'react-router-dom';
import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"
import { 
  ForcastGet, 
  ForcastDelete, 
  clearForecastDeleteResult 
} from '../../../../store/Api_slice/Forecast_Slice';
import { useDispatch, useSelector } from 'react-redux';

const ForCast_Table = () => {
  const [successModel, setSuccessModel] = useState(false);
  const [errorModel, setErrorModel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

    const { permissions } = useSelector((state) => state.permissions);
  const userPermissions = permissions[10] || {};
  
  // Define permission checks
 const canView = userPermissions?.view ||  false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);
  
  const { 
    forecastGet, 
    forecastDeleteResult, 
    forecastDeleteError, 
    deleteLoading 
  } = useSelector((state) => state.forecast);
  
  // Maps API data to the 4 columns for the table
  const ForcastData = forecastGet?.data?.map((item) => ({
    id: item._id, 
    forecastId: item.forecastId,
    companyName: item.customerId?.companyName || "-",
    projectName: item.projectId?.projectName || "-",
    bomName: item.bomId?.bomName || "-",
  })) || [];

  // Fetch forecasts on component mount
  useEffect(() => {
    dispatch(ForcastGet());
  }, [dispatch]);

  // Handle delete response
  useEffect(() => {
    if (forecastDeleteResult?.success === true) {
      setDeleteSuccessMessage(forecastDeleteResult?.message || "Forecast deleted successfully!");
      setSuccessModel(true);
      dispatch(clearForecastDeleteResult());
      // Refresh the table data
      dispatch(ForcastGet());
      // Clear selected row for delete
      setSelectedRowForDelete(null);
      setConfirmDelete(false);
    }
  }, [forecastDeleteResult, dispatch]);

  // Handle delete error
  useEffect(() => {
    if (forecastDeleteError) {
      setErrorMessage(forecastDeleteError?.message || "Failed to delete forecast");
      setErrorModel(true);
      dispatch(clearForecastDeleteResult());
      setSelectedRowForDelete(null);
      setConfirmDelete(false);
    }
  }, [forecastDeleteError, dispatch]);

  // Auto-close success popup
  useEffect(() => {
    if (successModel) {
      const timer = setTimeout(() => {
        setSuccessModel(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successModel]);

  // Auto-close error popup
  useEffect(() => {
    if (errorModel) {
      const timer = setTimeout(() => {
        setErrorModel(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorModel]);

  const columns = [
    { header: 'Forecast Id', key: 'forecastId' },
    { header: 'Customer', key: 'companyName' },
    { header: 'Project', key: 'projectName' },
    { header: 'BOM', key: 'bomName' },
  ];

  const handleSelectionChange = (selectedIds) => {
    setSelectedRows(selectedIds);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  const handleDelete = (row) => {
    console.log("Delete target:", row);
    setSelectedRowForDelete(row);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRowForDelete) {
      dispatch(ForcastDelete(selectedRowForDelete.id));
    }
  };

  const handleEdit = (row) => {
    navigate("/forecast-viewer/forecast-editor", { 
      state: { rowId: row.id, mode: "edit", projectId: row.projectId } 
    });
  };
    
  // Navigates to view page with Row ID to fetch full data (including projectForecast)
  const handleView = (row) => {
    navigate("/forecast-viewer/view", { state: { rowId: row.id } });
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 font-sans text-slate-800"
    >
      <div className="">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Forecast Viewer</h1>
          </div>
          <Button disabled={!canCreate}
            variant="primary"
            onClick={() => navigate('/forecast-viewer/forecast-editor')}
          >
            Create
          </Button>
        </div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-end gap-3 mb-6">
          <FilterDropdown label="Customer" options={[]} />
          <FilterDropdown label="Project" options={[]} />
          <FilterDropdown label="Item Name" options={[]} />
          <Download_Button disabled={!canView} onClick={() => setSuccessModel(true)} />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <div className="max-w-md w-full">
              <SearchBar />
            </div>
            {selectedRows.length > 0 && (
              <span className="text-sm font-medium text-[#0062a0] animate-in fade-in slide-in-from-right-2">
                {selectedRows.length} Items Selected
              </span>
            )}
          </div>
          <div className="p-0">
            <ReUsable_Table
              columns={columns} 
              data={ForcastData}
              showToggle={false}
              showActions={true}
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              onEdit={ canEdit ? handleEdit : undefined }
              onDelete={canDelete ? handleDelete : undefined}
              onView={canView ? handleView : undefined}
              ActionChildren="Action"
              onRowClick={(row) => canView && handleView(row)}
            />
          </div>
        </motion.div>
      </div>

      {/* Confirmation Popup for Delete */}
      <Confirmation_Popup
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setSelectedRowForDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete forecast ${selectedRowForDelete?.forecastId || ''}?`}
        title="Delete Forecast"
        loading={deleteLoading}
      />

      {/* Success Popup */}
      <Success_Popup
        isOpen={successModel}
        onClose={() => setSuccessModel(false)}
        message={deleteSuccessMessage}
      />

      {/* Error Popup */}
      <ErrorMessage_Popup
        isOpen={errorModel}
        onClose={() => setErrorModel(false)}
        message={errorMessage}
        title="Delete Failed"
        btnText="Close"
      />
    </motion.div>
  );
};

const FilterDropdown = ({ label, options }) => {
  return (
    <div className="relative group min-w-[130px]">
      <button className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-[#0062a0] hover:border-[#0062a0] transition-all">
        {label}
        <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
        {options && options.length > 0 ? (
          options.map((opt, i) => (
            <div key={i} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-[#e6f4ff] hover:text-[#0062a0] cursor-pointer transition-colors border-b last:border-0 border-slate-50">
              {opt}
            </div>
          ))
        ) : (
          <div className="px-4 py-2.5 text-sm text-slate-400 text-center">
            No options
          </div>
        )}
      </div>
    </div>
  );
};

export default ForCast_Table;