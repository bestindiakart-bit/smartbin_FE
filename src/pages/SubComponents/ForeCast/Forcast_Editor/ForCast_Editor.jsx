import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, Package, Loader, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Project Components
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
import ReUsableInput_Fields from '../../../../component/ReUsableInput_Fields/ReUsableInput_Fields';
import Button from '../../../../component/button/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCustomerId, 
  fetchBomApi, 
  fetchProjectApi, 
  fetchSingleBomApi, 
  clearBomData, 
  clearProjectData, 
  clearSingleBomData, 
  ForcastPost,
  ForcastGet,
  ForcastUpdate 
} from '../../../../store/Api_slice/Forecast_Slice';

const ForCast_Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Extract Route State for Edit Mode
  const { rowId, mode, edit, _id } = location.state || {};
  const forecastId = rowId || _id;
  const isEdit = mode === 'edit' || edit === true || !!forecastId;

  // Modals & Messages State
  const [confirm, setConfirm] = useState(false);
  const [successModel, setSuccessModel] = useState(false);
  const [errorModel, setErrorModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const[successMessage, setSuccessMessage] = useState('');

  // Redux States
  const { 
    forcastEdit, 
    bomData, 
    projectData, 
    singleBomData, 
    postLoading,
    updateLoading, // Destructure update loading state
    forecastGet 
  } = useSelector((state) => state.forecast);
  
  const forcastData = forcastEdit?.data ||[];  
  const projectList = projectData?.data || projectData?.projects ||[];
  const bomList = Array.isArray(bomData?.data)
    ? bomData.data
    : Array.isArray(bomData?.boms)
    ? bomData.boms
    :[];
  const bomDetails = singleBomData?.data || singleBomData?.bom || null;

  // Dynamic Button Loading check
  const isLoading = postLoading || updateLoading;

  // Main Form State
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    bomId: '',
  });

  // Dynamic Forecast Rows State
  const[forecastRows, setForecastRows] = useState([
    { id: Date.now(), month: '', quantity: '', rawMonth: '' }
  ]);

  // Initial Fetches
  useEffect(() => {
    dispatch(fetchCustomerId());
    if (isEdit && !forecastGet?.data) {
      dispatch(ForcastGet());
    }
  }, [dispatch, isEdit, forecastGet]);

  // --- PRE-FILL DATA FOR EDIT MODE ---
  useEffect(() => {
    if (isEdit && forecastId && forecastGet?.data) {
      const editData = forecastGet.data.find(item => item._id === forecastId);
      
      if (editData) {
        setFormData({
          customerId: editData.customerId?._id || '',
          projectId: editData.projectId?._id || '',
          bomId: editData.bomId?._id || ''
        });

        if (editData.customerId?._id) {
          dispatch(fetchProjectApi(editData.customerId._id));
        }
        if (editData.customerId?._id && editData.projectId?._id) {
          dispatch(fetchBomApi({ customerId: editData.customerId._id, projectId: editData.projectId._id }));
        }
        if (editData.bomId?._id) {
          dispatch(fetchSingleBomApi(editData.bomId._id));
        }

        if (editData.projectForecast && editData.projectForecast.length > 0) {
          const monthNames =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const prefilledRows = editData.projectForecast.map((pf, index) => {
            let rawMonthValue = '';
            if (pf.forecastMonth) {
              const[monthStr, yearStr] = pf.forecastMonth.split(' ');
              const monthIdx = monthNames.indexOf(monthStr) + 1;
              if (monthIdx > 0) {
                rawMonthValue = `${yearStr}-${monthIdx.toString().padStart(2, '0')}`;
              }
            }

            return {
              id: Date.now() + index,
              month: pf.forecastMonth,
              rawMonth: rawMonthValue, 
              quantity: pf.productionQuantity
            };
          });
          
          setForecastRows(prefilledRows);
        }
      }
    }
  },[isEdit, forecastId, forecastGet, dispatch]);

  // --- SUCCESS MODAL TIMER & NAVIGATION ---
  useEffect(() => {
    if (successModel) {
      const timer = setTimeout(() => {
        setSuccessModel(false);
        if (!isEdit) resetForm();
        navigate(-1); // Navigate back to the table page after 2 seconds
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successModel, isEdit, navigate]);

  const resetForm = () => {
    setFormData({ customerId: '', projectId: '', bomId: '' });
    setForecastRows([{ id: Date.now(), month: '', quantity: '', rawMonth: '' }]);
    dispatch(clearBomData());
    dispatch(clearProjectData());
    dispatch(clearSingleBomData());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "customerId" && { projectId: "", bomId: "" }),
      ...(name === "projectId" && { bomId: "" }),
    }));

    if (name === "customerId" && value) {
      dispatch(fetchProjectApi(value));
      dispatch(clearBomData());
      dispatch(clearSingleBomData());
    }
    
    if (name === "projectId" && value && formData.customerId) {
      dispatch(fetchBomApi({ customerId: formData.customerId, projectId: value }));
      dispatch(clearSingleBomData());
    }

    if (name === "bomId" && value) {
      dispatch(fetchSingleBomApi(value));
    }
  };

  const handleMonthChange = (id, value) => {
    if (value) {
      const date = new Date(value);
      const monthNames =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const year = date.getFullYear();
      const month = monthNames[date.getMonth()];
      const formattedMonth = `${month} ${year}`;
      
      handleRowChange(id, 'month', formattedMonth);
      handleRowChange(id, 'rawMonth', value);
    } else {
      handleRowChange(id, 'month', '');
      handleRowChange(id, 'rawMonth', '');
    }
  };

  const handleAddRow = () => {
    if (forecastRows.length < 6) {
      setForecastRows([...forecastRows, { id: Date.now(), month: '', quantity: '', rawMonth: '' }]);
    }
  };

  const handleRemoveRow = (id) => {
    if (forecastRows.length > 1) {
      setForecastRows(forecastRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setForecastRows(forecastRows.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const preparePayload = () => {
    const projectForecast = forecastRows
      .filter(row => row.rawMonth && row.quantity && Number(row.quantity) > 0)
      .map(row => {
        const date = new Date(row.rawMonth);
        const monthNames =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          forecastMonth: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
          productionQuantity: Number(row.quantity)
        };
      });

    return {
      customerId: formData.customerId || undefined,
      projectId: formData.projectId,
      bomId: formData.bomId,
      projectForecast
    };
  };

  const handleSubmitInit = () => {
    if (!formData.projectId) {
      setErrorMessage("Please select a project");
      setErrorModel(true); return;
    }
    if (!formData.bomId) {
      setErrorMessage("Please select a BOM");
      setErrorModel(true); return;
    }
    
    const hasValidRows = forecastRows.some(row => row.rawMonth && row.quantity && Number(row.quantity) > 0);
    if (!hasValidRows) {
      setErrorMessage("Please add at least one forecast month with quantity");
      setErrorModel(true); return;
    }
    
    const months = forecastRows.filter(row => row.month).map(row => row.month);
    if (new Set(months).size !== months.length) {
      setErrorMessage("Duplicate months found. Please select unique months for each forecast row.");
      setErrorModel(true); return;
    }
    
    if (forecastRows.some(row => row.quantity && parseInt(row.quantity) <= 0)) {
      setErrorMessage("Production quantity must be greater than 0");
      setErrorModel(true); return;
    }
    
    setConfirm(true); // Opens confirmation popup
  };

  // --- REWRITTEN CONFIRM ACTION TO USE .UNWRAP() ---
  // This removes the need for flaky useEffect listeners
  const handleConfirmAction = () => {
    const payload = preparePayload();
    setConfirm(false); // Instantly close the confirm modal

    if (isEdit) {
      // Execute UPDATE
      dispatch(ForcastUpdate({ id: forecastId, payload }))
        .unwrap() // unwraps the Promise
        .then((res) => {
          setSuccessMessage(res.message || 'Forecast Updated Successfully!');
          setSuccessModel(true); // Open Success Modal
        })
        .catch((err) => {
          setErrorMessage(err.message || 'Failed to update forecast');
          setErrorModel(true); // Open Error Modal
        });
    } else {
      // Execute POST (Create)
      dispatch(ForcastPost(payload))
        .unwrap() // unwraps the Promise
        .then((res) => {
          setSuccessMessage(res.message || 'Forecast Created Successfully!');
          setSuccessModel(true); // Open Success Modal
        })
        .catch((err) => {
          setErrorMessage(err.message || 'Failed to create forecast');
          setErrorModel(true); // Open Error Modal
        });
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8"
    >
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">
        
        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 text-[#0062a0] hover:bg-blue-50 rounded-2xl transition-all cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-800">
                {isEdit ? "Edit Forecast" : "Forecast Editor"}
              </h1>
            </div>
          </div>
        </motion.div>

        {/* MAIN FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Customer Name"
              name="customerId"
              type="select"
              options={[
                { label: "Select Customer", value: "" },
                ...forcastData.map((item) => ({ label: item.companyName, value: item._id })),
              ]}
              value={formData.customerId}
              onChange={handleChange}
              disabled={isEdit} 
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields 
              label="Project Name" 
              name="projectId"
              type="select"
              options={[
                { label: 'Select Project', value: '' },
                ...projectList.map((item) => ({ label: item?.projectName || item?.projectId, value: item?._id })),
              ]}
              value={formData.projectId} 
              onChange={handleChange}
              disabled={!formData.customerId || isEdit}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="BOM ID"
              name="bomId"
              type="select"
              options={[
                { label: 'Select Bom', value: '' },
                ...bomList.map((item) => ({ label: item?.bomName || item?.bomId, value: item?._id })),
              ]}
              value={formData.bomId}
              onChange={handleChange}
              disabled={!formData?.customerId || !formData?.projectId || isEdit}
            />
          </motion.div>
        </div>

        {/* BOM DETAILS SECTION */}
        {bomDetails && bomDetails.items && bomDetails.items.length > 0 && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#0062a0]" />
              <h3 className="text-lg font-semibold text-[#0062a0]">BOM Item List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bomDetails.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {typeof item.itemId === 'object' ? item.itemId.itemName : item.itemId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PROJECT FORECAST SECTION */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0062a0]">Project Forecast (Month)</h2>
            <div className="text-sm text-gray-500">
              {forecastRows.filter(row => row.month && row.quantity).length}/{forecastRows.length} Months filled
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {forecastRows.map((row, index) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full"
                >
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 pb-2">Forecast Month {index + 1}</label>
                      <input
                        type="month"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0062a0] focus:border-transparent transition-all"
                        value={row.rawMonth || ''}
                        onChange={(e) => handleMonthChange(row.id, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <ReUsableInput_Fields
                      label="Production Quantity"
                      type='number'
                      placeholder="Enter quantity"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)}
                      min="1"
                    />
                  </div>

                  <div className="flex items-center gap-3 pb-1.5 h-full">
                    {index === forecastRows.length - 1 && forecastRows.length < 6 ? (
                      <button onClick={handleAddRow} className="p-3 bg-[#e6f4ff] text-[#0062a0] rounded-xl hover:bg-blue-100 transition-all active:scale-90" title="Add more month">
                        <Plus size={24} strokeWidth={3} />
                      </button>
                    ) : (
                      index === forecastRows.length - 1 && <div className="w-[52px]"></div>
                    )}
                    {forecastRows.length > 1 && (
                      <button onClick={() => handleRemoveRow(row.id)} className="p-3 bg-[#e6f4ff] text-slate-800 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90" title="Remove month">
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* FOOTER BUTTONS */}
        <motion.div variants={itemVariants} className="flex items-center gap-6 justify-end mt-16 mb-4">
          <Button
            onClick={handleSubmitInit}
            variant="primary"
            disabled={!formData.projectId || !formData.bomId || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </div>
            ) : (
              isEdit ? 'Update Forecast' : 'Create Forecast'
            )}
          </Button>
        </motion.div>
      </div>

      {/* POPUPS */}
      <Confirmation_Popup
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleConfirmAction}
        message={`Are you sure you want to ${isEdit ? 'Update' : 'Create'} Forecast?`}
      />
      <Success_Popup
        isOpen={successModel}
        onClose={() => setSuccessModel(false)}
        message={successMessage} 
      />
      <ErrorMessage_Popup
        isOpen={errorModel}
        onClose={() => setErrorModel(false)}
        message={errorMessage} 
      />
    </motion.div>
  );
};

export default ForCast_Editor;