import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Project components
import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
import ReUsableInput_Fields from '../../../../component/ReUsableInput_Fields/ReUsableInput_Fields';
import Button from '../../../../component/button/Buttons';
import {
  customer_Name,
  Item_Name,
  smart_dashboard_create,
  smart_dashboard_createId,
  warehouse_get
} from "../../../../service/Orders_Services/Oreder_Services";

const Warehouse_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEdit = location.state?.mode === 'edit';
  const editId = location.state?.id;

  const [confirm, setConfirm] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ open: false, message: "" });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [isDataFetching, setIsDataFetching] = useState(false);
  
  const [customerOptions, setCustomerOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [allItemsData, setAllItemsData] = useState([]); 
  const [expandedDescMap, setExpandedDescMap] = useState({}); 

  // 1. Top-level form data
  const [formData, setFormData] = useState({
    customerId: '', 
    warehouseName: '',
    warehouseLocation: '',
    remarks: ''
  });

  // 2. Dynamic sections state (Array of objects)
  const initialSectionState = {
    itemMasterId: '',     
    warehouseMaxLimit: '',
    safetyStock: '',
    reorderRequired: '',
    currentStock: '',
    supplierName: '',
    lastTransactionQuantity: '',
    lastTransactionDate: '',
    warehouseStatus: 1 
  };

  const [sections, setSections] = useState([{ ...initialSectionState }]);

  // Helper function to extract error message from API response
  const extractErrorMessage = (error, defaultMessage = "An error occurred") => {
    if (error.response?.data) {
      const data = error.response.data;
      
      // Check for nested data.message structure (like in your example)
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

  // Auto-close success popup and navigate
  useEffect(() => {
    if (successPopup.open) {
      const timer = setTimeout(() => {
        setSuccessPopup({ open: false, message: "" });
        navigate(-1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successPopup.open, navigate]);

  // --- DATA LOADING LOGIC ---
  const loadInitialData = useCallback(async () => {
    try {
      setIsDataFetching(true);
      
      // Fetch Dropdowns
      const [custRes, itemRes] = await Promise.all([
        customer_Name(),
        Item_Name()
      ]);

      const customers = custRes?.data?.data?.records || custRes?.data?.data || [];
      setCustomerOptions(customers.map(c => ({
        label: c.companyName || c.companyName, 
        value: c._id || c.customerId || c.id 
      })));

      const items = itemRes?.data?.data?.items || itemRes?.data?.data || [];
      setAllItemsData(items); 
      setItemOptions(items.map(i => ({
        label: i.partNumber, 
        value: i._id || i.itemMasterId || i.id 
      })));

      // --- FETCH EDIT DATA ---
      if (isEdit && editId) {
        const res = await warehouse_get(editId);
        const rawData = res?.data?.data;
        const data = Array.isArray(rawData) ? rawData[0] : rawData;

        if (data) {
          // Set top-level data
          const extractedCustomerId = typeof data.customerId === 'object' 
            ? data.customerId?._id 
            : data.customerId;

          setFormData({
            customerId: extractedCustomerId || '',
            warehouseName: data.warehouseName || '',
            warehouseLocation: data.warehouseLocation || '',
            remarks: data.remarks || '',
          });

          // Check if backend returns items array
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            setSections(data.items.map(sec => {
              
              const extractedItemId = typeof sec.itemMasterId === 'object' 
                ? sec.itemMasterId?._id 
                : sec.itemMasterId;

              // Format date properly for the <input type="date">
              const formattedDate = sec.lastTransactionDate 
                ? new Date(sec.lastTransactionDate).toISOString().split('T')[0] 
                : '';

              return {
                itemMasterId: extractedItemId || '',
                // Used !== undefined so value `0` doesn't evaluate to `''`
                warehouseMaxLimit: sec.warehouseLimit !== undefined ? sec.warehouseLimit : '',
                safetyStock: sec.warehouseSafeStock !== undefined ? sec.warehouseSafeStock : '',
                reorderRequired: sec.warehouseReorderLevel !== undefined ? sec.warehouseReorderLevel : '',
                currentStock: sec.currentStock !== undefined ? sec.currentStock : '',
                supplierName: sec.supplerName || sec.supplierName || '', 
                lastTransactionQuantity: sec.lastTransationQuantity || sec.lastTransactionQuantity || '', 
                lastTransactionDate: formattedDate,
                warehouseStatus: data.status !== undefined ? data.status : 1 
              };
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
      const errMsg = extractErrorMessage(err, "Failed to load initial data");
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setIsDataFetching(false);
    }
  }, [isEdit, editId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSections = [...sections];
    
    // Convert status to number so it strictly matches dropdown
    let finalValue = value;
    if (name === 'warehouseStatus') {
      finalValue = Number(value);
    }

    updatedSections[index][name] = finalValue;
    setSections(updatedSections);
  };

  const toggleDesc = (index) => {
    setExpandedDescMap((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const addSection = () => {
    setSections([...sections, { ...initialSectionState }]);
  };

  const removeSection = (index) => {
    if (sections.length > 1) {
      const updatedSections = sections.filter((_, i) => i !== index);
      setSections(updatedSections);
      
      const newExpandedMap = { ...expandedDescMap };
      delete newExpandedMap[index];
      setExpandedDescMap(newExpandedMap);
    }
  };

  // Form Submission
  const handleFinalSubmit = async () => {
    // Validate required fields
    if (!formData.customerId || !formData.warehouseName) {
      setErrorPopup({ 
        open: true, 
        message: "Customer and Warehouse Name are required fields." 
      });
      return;
    }

    setConfirm(false);
    setLoading(true);
    
    try {
      const payload = {
        customerId: formData.customerId,
        warehouseName: formData.warehouseName,
        warehouseLocation: formData.warehouseLocation,
        remarks: formData.remarks,
        status: sections[0]?.warehouseStatus ?? 1, 
        
        items: sections.map(sec => ({
          itemMasterId: sec.itemMasterId,
          // Fixed parse numbers securely to ensure empty strings safely cast to 0 without breaking
          warehouseLimit: sec.warehouseMaxLimit === '' ? 0 : Number(sec.warehouseMaxLimit),
          warehouseReorderLevel: sec.reorderRequired === '' ? 0 : Number(sec.reorderRequired),
          warehouseSafeStock: sec.safetyStock === '' ? 0 : Number(sec.safetyStock),
          currentStock: sec.currentStock === '' ? 0 : Number(sec.currentStock),
          supplerName: sec.supplierName, 
          lastTransationQuantity: sec.lastTransactionQuantity === '' ? 0 : Number(sec.lastTransactionQuantity), 
          lastTransactionDate: sec.lastTransactionDate
        }))
      };

      let res;
      if (isEdit) {
        res = await smart_dashboard_createId(editId, payload);
      } else {
        res = await smart_dashboard_create(payload);
      }

      // Extract success message from API response
      const successMessage = res?.data?.message || 
                            res?.data?.msg || 
                            (isEdit ? "Warehouse Details Updated Successfully!" : "Warehouse Details Created Successfully!");

      setSuccessPopup({ open: true, message: successMessage });
      
    } catch (err) {
      console.error("Submission Error:", err);
      
      // Extract error message from API response
      const errMsg = extractErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} warehouse`);
      
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  if (isDataFetching) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0062a0]" size={48} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fcfdfe] p-4 md:p-8">
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl transition-all cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            {isEdit ? "Edit Warehouse Details" : "Create Warehouse Details"}
          </h1>
        </div>

        {/* TOP-LEVEL FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <ReUsableInput_Fields 
            label="Customer name" 
            name="customerId" 
            type="select" 
            options={customerOptions} 
            value={formData.customerId} 
            onChange={handleChange} 
            required
          />
          <ReUsableInput_Fields 
            label="Warehouse Name" 
            name="warehouseName" 
            value={formData.warehouseName} 
            onChange={handleChange} 
            required
          />
          <ReUsableInput_Fields 
            label="Warehouse Location" 
            name="warehouseLocation" 
            value={formData.warehouseLocation} 
            onChange={handleChange} 
          />
        </div>

        {/* DYNAMIC SECTIONS LOOP */}
        {sections.map((section, index) => {
          // Find the description for this specific section's item
          const selectedItemDesc = allItemsData.find(
            item => (item._id || item.itemMasterId || item.id) === section.itemMasterId
          )?.itemDescription || '';
          
          const isDescExpanded = !!expandedDescMap[index];

          return (
            <div key={index} className='relative grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 items-start border border-slate-200 rounded-lg p-6 mt-6 bg-[#fafcff]'>
              
              {sections.length > 1 && (
                <button 
                  onClick={() => removeSection(index)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  title="Remove Section"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="md:col-span-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Item Details {index + 1}</h3>
              </div>

              {/* Item Name Field with Expandable Description */}
              <div className="flex flex-col w-full min-h-[90px]">
                <ReUsableInput_Fields 
                  label="Item Name" 
                  name="itemMasterId" 
                  type="select" 
                  options={itemOptions} 
                  value={section.itemMasterId} 
                  onChange={(e) => handleSectionChange(index, e)} 
                />
                
                {selectedItemDesc && (
                  <div className="flex items-start justify-between text-blue-600 bg-blue-50/50 px-2 py-1.5 rounded-lg border border-blue-100/50 mt-1">
                    <span className={`text-[13px] font-medium leading-tight transition-all duration-300 ${isDescExpanded ? 'whitespace-normal' : 'line-clamp-1'}`}>
                      <span className="font-bold mr-1">Desc:</span> {selectedItemDesc}
                    </span>
                    
                    {selectedItemDesc.length > 50 && (
                      <button 
                        type="button" 
                        onClick={() => toggleDesc(index)}
                        className="ml-2 flex-shrink-0 cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-0.5 rounded-full transition-colors mt-[1px]"
                        title={isDescExpanded ? "Show less" : "Show more"}
                      >
                        {isDescExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <ReUsableInput_Fields 
                label="Warehouse Max Limit" 
                name="warehouseMaxLimit" 
                type="number" 
                value={section.warehouseMaxLimit} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              <ReUsableInput_Fields 
                label="Safety Stock" 
                name="safetyStock" 
                type="number" 
                value={section.safetyStock} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              <ReUsableInput_Fields 
                label="Reorder Required" 
                name="reorderRequired" 
                type="number" 
                value={section.reorderRequired} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              <ReUsableInput_Fields 
                label="Current Stock" 
                name="currentStock" 
                type="number" 
                value={section.currentStock} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              <ReUsableInput_Fields 
                label="Supplier Name" 
                name="supplierName" 
                value={section.supplierName} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              <ReUsableInput_Fields 
                label="Last Transaction Quantity" 
                name="lastTransactionQuantity" 
                type="number" 
                value={section.lastTransactionQuantity} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              <ReUsableInput_Fields 
                label="Last Transaction Date" 
                name="lastTransactionDate" 
                type="date" 
                value={section.lastTransactionDate} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              
              <ReUsableInput_Fields 
                label="Warehouse Status" 
                name="warehouseStatus" 
                type="select" 
                options={[
                  { label: 'Active', value: 1 }, 
                  { label: 'Inactive', value: 0 }
                ]} 
                value={section.warehouseStatus} 
                onChange={(e) => handleSectionChange(index, e)} 
              />
              
              {index === sections.length - 1 && (
                <div className='md:col-span-2 flex items-center justify-start mt-4'>
                  <Button variant="primary" onClick={addSection} size="sm">
                    + Add Section
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6">
          <ReUsableInput_Fields 
            label="Remarks" 
            name="remarks" 
            value={formData.remarks} 
            onChange={handleChange} 
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-6 justify-end mt-12">
          <Button 
            onClick={() => setConfirm(true)} 
            variant="primary" 
            disabled={loading || !formData.customerId || !formData.warehouseName}
          >
            {loading ? "Processing..." : isEdit ? "Update" : "Create"}
          </Button>
          <Button onClick={() => navigate(-1)} variant="secondary" disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>

      <Confirmation_Popup 
        isOpen={confirm} 
        onClose={() => setConfirm(false)} 
        onConfirm={handleFinalSubmit} 
        message={`Are you sure you want to ${isEdit ? 'Update' : 'Create'} Warehouse Details?`} 
      />
      
      <Success_Popup 
        isOpen={successPopup.open} 
        onClose={() => setSuccessPopup({ open: false, message: "" })} 
        message={successPopup.message} 
      />

      <ErrorMessage_Popup
        isOpen={errorPopup.open}
        onClose={() => setErrorPopup({ open: false, message: "" })}
        message={errorPopup.message}
      />
    </motion.div>
  );
};

export default Warehouse_Create;