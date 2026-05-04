import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Importing existing project components
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ReUsableInput_Fields from '../../../../component/ReUsableInput_Fields/ReUsableInput_Fields';
import Button from '../../../../component/button/Buttons';

// API Services
import {
  bin_dashboard_create,
  bin_dashboard_Edit,
  bin_dashboard_getById,
  bin_item_master_get,
  bin_ProjectName_get,
  customer_id,
  get_warehouse_byId,
} from "../../../../service/Bin_Services/Bin_Services";

// Helper function to parse "10 kg" or "500 gm" into value and unit
const parseWeightStr = (weightStr) => {
  if (!weightStr) return { value: '', unit: 'kg' };
  const str = String(weightStr).trim();
  const match = str.match(/^([\d.]+)\s*(kg|gm)$/i);
  if (match) {
    return { value: match[1], unit: match[2].toLowerCase() };
  }
  return { value: str, unit: 'kg' };
};

const Bin_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract mode and rowId from location state
  const { mode, rowId } = location.state || {};
  const isEditMode = mode === "edit";

  // UI States
  const[confirm, setConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const[isDescExpanded, setIsDescExpanded] = useState(false);

  // Dynamic Popup States
  const[successModel, setSuccessModel] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModel, setErrorModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Dropdown Options States
  const [customerOptions, setCustomerOptions] = useState([{ label: 'Loading...', value: '' }]);
  const [projectOptions, setProjectOptions] = useState([{ label: 'Loading...', value: '' }]);
  const [itemOptions, setItemOptions] = useState([{ label: 'Loading...', value: '' }]);
  const [allItemsData, setAllItemsData] = useState([]);

  // Weight Unit States
  const [binWeightUnit, setBinWeightUnit] = useState('kg');
  const[customerWeightUnit, setCustomerWeightUnit] = useState('kg');

  // Form State
  const[formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    masterId: '',
    binId: '',
    supplierItemName: '',
    customerItemName: '',
    binAllowableWeight: '',
    binAllowableLimit: '',
    customerAllowableWeight: '',
    customerAllowableLimit: '',
    safetyStockQuantity: '',
    rol: '',
    itemPerPrice: '',
    weightPerUnit: '',
    itemMasterId: '',
    warehouseId: '',    
    warehouseName: '',  
    itemStatus: false
  });

  // --- 1. FETCH INITIAL MASTER DATA ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const[customerRes, itemRes] = await Promise.all([
          customer_id(),
          bin_item_master_get()
        ]);

        const customers = customerRes?.data?.data ||[];
        const items = itemRes?.data?.data?.items ||[];
        setAllItemsData(items);

        setCustomerOptions([
          { label: 'Select Customer', value: '' },
          ...customers.map(c => ({ label: c.companyName, value: c._id }))
        ]);

        setItemOptions([
          { label: 'Select Item', value: '' },
          ...items.map(i => ({ label: i.partNumber, value: i._id }))
        ]);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  },[]);

  // --- 2. FETCH SPECIFIC BIN DATA FOR EDIT MODE ---
  useEffect(() => {
    const fetchBinForEdit = async () => {
      if (isEditMode && rowId) {
        try {
          setFetchingData(true);
          const res = await bin_dashboard_getById(rowId);
          const data = res?.data?.data?.record || res?.data?.data || res?.data;

          if (data) {
            const bWeight = parseWeightStr(data.binAllowableWeight);
            const cWeight = parseWeightStr(data.customerAllowableWeight);
            
            setBinWeightUnit(bWeight.unit);
            setCustomerWeightUnit(cWeight.unit);

            setFormData({
              customerId: data.customerId?._id || data.customerId || '',
              projectId: data.projectId?._id || data.projectId || '',
              masterId: data.masterId || '',
              binId: data.binId || '',
              supplierItemName: data.supplierItemName || '',
              customerItemName: data.customerItemName || '',
              binAllowableWeight: bWeight.value || '',
              binAllowableLimit: data.binAllowablelimit || data.binAllowableLimit || '',
              customerAllowableWeight: cWeight.value || '',
              customerAllowableLimit: data.customerAllowableLimit || '',
              safetyStockQuantity: data.safetyStockQuantity || '',
              rol: data.rol || '',
              itemPerPrice: data.itemPerPrice || '',
              weightPerUnit: data.weightPerUnit !== undefined ? data.weightPerUnit : (data.weightPerPiece || ''),
              itemMasterId: data.itemMasterId?._id || data.itemMasterId || '',
              warehouseId: data.warehouseId?._id || data.warehouseId || '',    
              warehouseName: data.warehouseId?.warehouseName || data.warehouseName || '',  
              itemStatus: data.itemStatus ?? data.status ?? false
            });
          }
        } catch (err) {
          console.error("Error fetching bin details:", err);
        } finally {
          setFetchingData(false);
        }
      }
    };
    fetchBinForEdit();
  }, [isEditMode, rowId]);

  // --- 3. FETCH PROJECTS BY CUSTOMER ---
  useEffect(() => {
    const fetchProjectsByCustomer = async () => {
      if (!formData.customerId) {
        setProjectOptions([{ label: 'Select Project', value: '' }]);
        return;
      }
      try {
        const projectRes = await bin_ProjectName_get(formData.customerId);
        const projects = projectRes?.data?.data ||[];
        setProjectOptions([
          { label: 'Select Project', value: '' },
          ...projects.map(p => ({ label: p.projectName, value: p._id }))
        ]);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjectsByCustomer();
  }, [formData.customerId]);

  // --- 4. FETCH WAREHOUSE BY CUSTOMER AND ITEM ---
  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      if (fetchingData) return; 

      if (formData.customerId && formData.itemMasterId) {
        try {
          const res = await get_warehouse_byId(formData.customerId, formData.itemMasterId);
          const warehouseData = res?.data?.data;
          if (warehouseData) {
            setFormData(prev => ({
              ...prev,
              warehouseId: warehouseData._id,           
              warehouseName: warehouseData.warehouseName 
            }));
          }
        } catch (error) {
          console.error("Failed to fetch warehouse", error);
        }
      }
    };
    fetchWarehouseDetails();
  }, [formData.customerId, formData.itemMasterId, fetchingData]);

  // --- 5. AUTO-FILL WEIGHT PER UNIT FROM ITEM ---
  useEffect(() => {
    if (fetchingData || !allItemsData.length || !formData.itemMasterId) return;

    const selectedItem = allItemsData.find(item => item._id === formData.itemMasterId);
    if (selectedItem && selectedItem.weightPerUnit !== undefined) {
      setFormData(prev => ({
        ...prev,
        weightPerUnit: selectedItem.weightPerUnit
      }));
    }
  },[formData.itemMasterId, allItemsData, fetchingData]);

  // --- 6. AUTOMATIC QUANTITY CALCULATION ---
  useEffect(() => {
    if (!formData.itemMasterId || allItemsData.length === 0 || fetchingData) return;

    const unitWeight = parseFloat(formData.weightPerUnit) || 1; 
    const numericBinWeight = parseFloat(formData.binAllowableWeight);
    const numericCustWeight = parseFloat(formData.customerAllowableWeight);

    setFormData(prev => ({
      ...prev,
      binAllowableLimit: !isNaN(numericBinWeight) 
        ? Math.floor((binWeightUnit === 'kg' ? numericBinWeight * 1000 : numericBinWeight) / unitWeight).toString() 
        : prev.binAllowableLimit,
      customerAllowableLimit: !isNaN(numericCustWeight) 
        ? Math.floor((customerWeightUnit === 'kg' ? numericCustWeight * 1000 : numericCustWeight) / unitWeight).toString() 
        : prev.customerAllowableLimit
    }));
  },[formData.binAllowableWeight, formData.customerAllowableWeight, binWeightUnit, customerWeightUnit, formData.weightPerUnit, formData.itemMasterId, allItemsData, fetchingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 7. FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    if (!formData.customerId || !formData.itemMasterId) return;
    setConfirm(false);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        binAllowableWeight: `${formData.binAllowableWeight} ${binWeightUnit}`,
        binAllowablelimit: Number(formData.binAllowableLimit),
        customerAllowableWeight: `${formData.customerAllowableWeight} ${customerWeightUnit}`,
        customerAllowableLimit: Number(formData.customerAllowableLimit),
        safetyStockQuantity: Number(formData.safetyStockQuantity),
        rol: Number(formData.rol),
        itemPerPrice: Number(formData.itemPerPrice),
        weightPerUnit: Number(formData.weightPerUnit), 
      };

      const res = isEditMode
        ? await bin_dashboard_Edit(rowId, payload)
        : await bin_dashboard_create(payload);

      // Checking for exact nested structure: res.data.success
      if (res?.data?.success) {
        const apiSuccessMessage = res?.data?.data?.message || res?.data?.message || `Bin Configuration ${isEditMode ? "Updated" : "Created"} Successfully!`;
        setSuccessMessage(apiSuccessMessage);
        setSuccessModel(true);
        
        setTimeout(() => {
          setSuccessModel(false);
          navigate(-1);
        }, 2000);
      } else {
        // If HTTP status is 200 but success is false
        const apiErrorMessage = res?.data?.data?.message || res?.data?.message || "Something went wrong while saving.";
        setErrorMessage(apiErrorMessage);
        setErrorModel(true);
      }
    } catch (err) {
      console.error("Submission failed", err);
      
      // Extracts exactly from nested structure -> {"success":false,"statusCode":400,"data":{"message":"Required fields missing"}}
      const apiErrorMessage = 
        err?.response?.data?.data?.message || 
        err?.response?.data?.message || 
        err?.message || 
        "An unexpected error occurred.";
        
      setErrorMessage(apiErrorMessage);
      setErrorModel(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItemDesc = allItemsData.find(item => item._id === formData.itemMasterId)?.itemDescription || '';

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#0062a0]" size={48} />
          <p className="text-slate-500 font-medium">Loading Bin Details...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fcfdfe] p-4 md:p-8">
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl transition-all cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            {isEditMode ? "Edit Bin Configuration" : "Create Bin Configuration"}
          </h1>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 items-start">
          <ReUsableInput_Fields label="Customer Name" name="customerId" type="select" options={customerOptions} value={formData.customerId} onChange={handleChange} />
          <ReUsableInput_Fields label="Project Name" name="projectId" type="select" options={projectOptions} value={formData.projectId} onChange={handleChange} />
          <ReUsableInput_Fields label="Master ID" name="masterId" value={formData.masterId} onChange={handleChange} />
          <ReUsableInput_Fields label="BIN ID" name="binId" value={formData.binId} onChange={handleChange} />
          
          {/* Item Name Field with Expandable Description */}
          <div className="flex flex-col w-full min-h-[90px]">
            <ReUsableInput_Fields 
              label="Item Name" 
              name="itemMasterId" 
              type="select" 
              options={itemOptions} 
              value={formData.itemMasterId} 
              onChange={handleChange} 
            />
            {selectedItemDesc && (
              <div className="flex items-start justify-between text-blue-600 bg-blue-50/50 px-2 py-1.5 rounded-lg border border-blue-100/50 mt-1">
                <span className={`text-[13px] font-medium leading-tight transition-all duration-300 ${isDescExpanded ? 'whitespace-normal' : 'line-clamp-1'}`}>
                  <span className="font-bold mr-1">Desc:</span> {selectedItemDesc}
                </span>
                
                {selectedItemDesc.length > 50 && (
                  <button 
                    type="button" 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="ml-2 flex-shrink-0 cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-0.5 rounded-full transition-colors mt-[1px]"
                    title={isDescExpanded ? "Show less" : "Show more"}
                  >
                    {isDescExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
            )}
          </div>

          <ReUsableInput_Fields label="Warehouse Name" name="warehouseName" type="text" value={formData.warehouseName} disabled={true} />
          
          <ReUsableInput_Fields 
            label="Weight per Unit" 
            name="weightPerUnit"
            type="number" 
            value={formData.weightPerUnit} 
            onChange={handleChange} 
            disabled={true} 
          />

          <ReUsableInput_Fields label="Item Price" name="itemPerPrice" type="number" value={formData.itemPerPrice} onChange={handleChange} />
          <ReUsableInput_Fields label="Customer Item Name" name="customerItemName" value={formData.customerItemName} onChange={handleChange} />

          {/* BIN WEIGHT */}
          <div className="relative">
            <ReUsableInput_Fields label="BIN Allowable Weight" name="binAllowableWeight" type="number" value={formData.binAllowableWeight} onChange={handleChange} />
            <div className="absolute right-1 bottom-[8px] z-10">
              <select value={binWeightUnit} onChange={(e) => setBinWeightUnit(e.target.value)} className="bg-slate-100 text-slate-700 text-sm font-bold rounded-lg px-2 py-1.5 outline-none border border-slate-200 cursor-pointer shadow-sm">
                <option value="kg">kg</option>
                <option value="g">gm</option>
              </select>
            </div>
          </div>
          <ReUsableInput_Fields label="BIN Allowable Limit" name="binAllowableLimit" value={formData.binAllowableLimit} disabled={true} />

          {/* CUSTOMER WEIGHT */}
          <div className="relative">
            <ReUsableInput_Fields label="Customer Allowable Weight" name="customerAllowableWeight" type="number" value={formData.customerAllowableWeight} onChange={handleChange} />
            <div className="absolute right-1 bottom-[8px] z-10">
              <select value={customerWeightUnit} onChange={(e) => setCustomerWeightUnit(e.target.value)} className="bg-slate-100 text-slate-700 text-sm font-bold rounded-lg px-2 py-1.5 outline-none border border-slate-200 cursor-pointer shadow-sm">
                <option value="kg">kg</option>
                <option value="g">gm</option>
              </select>
            </div>
          </div>
          <ReUsableInput_Fields label="Customer Allowable Limit" name="customerAllowableLimit" value={formData.customerAllowableLimit} disabled={true} />
          
          <ReUsableInput_Fields label="Safety Stock Quantity" name="safetyStockQuantity" type="number" value={formData.safetyStockQuantity} onChange={handleChange} />
          <ReUsableInput_Fields label="ROL (Re Order Level)" name="rol" type="number" value={formData.rol} onChange={handleChange} />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6 justify-end mt-12 mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="primary" onClick={() => setConfirm(true)} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : (isEditMode ? "Update" : "Create")}
          </Button>
        </div>
      </div>

      {/* Popups */}
      <Confirmation_Popup
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleFinalSubmit}
        message={`Are you sure you want to ${isEditMode ? "Update" : "Create"} Bin Configuration?`}
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

export default Bin_Create;