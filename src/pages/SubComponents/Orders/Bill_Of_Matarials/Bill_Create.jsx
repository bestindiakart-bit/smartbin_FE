import { motion } from "framer-motion";
import { ArrowLeft, Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import { getAPI, postAPI, putAPI } from "../../../../service/Orders_Services/Oreder_Services";

const Bill_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, rowId, bomData: initialBomData, itemListData: initialItemListData } = location.state || {};
  
  const isEditMode = mode === "edit";

  // State for Customer and Item Data
  const [customerData, setCustomerData] = useState([]);
  const [itemData, setItemData] = useState([]);

  // Dropdown Options States
  const [customerOptions, setCustomerOptions] = useState([{ label: 'Loading...', value: '' }]);
  const [projectOptions, setProjectOptions] = useState([{ label: 'Select Project', value: '' }]);
  const [itemOptions, setItemOptions] = useState([{ label: 'Select Item', value: '' }]);
  const [successModel, setSuccessModel] = useState(false);
  const [confirmModel, setConfirmModel] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    bomName: "",
    customerId: "",
    projectId: "",
    itemId: ""
  });

  // Table Data State
  const [tableData, setTableData] = useState([]);

  // Editing State
  const [editingCell, setEditingCell] = useState({
    rowId: null,
    field: null,
    value: ''
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // Load initial data for edit mode
  useEffect(() => {
    if (isEditMode && initialBomData) {
      console.log("Loading edit data:", initialBomData);
      
      // Set form data from initialBomData
      setFormData({
        bomName: initialBomData.bomName || initialBomData.name || "",
        customerId: initialBomData.customerId?._id || initialBomData.customerId || "",
        projectId: initialBomData.projectId?._id || initialBomData.projectId || "",
        itemId: ""
      });

      // Set table data from initialItemListData
      if (initialItemListData && initialItemListData.length > 0) {
        setTableData(initialItemListData);
      }

      setInitialLoading(false);
    } else {
      setInitialLoading(false);
    }
  }, [isEditMode, initialBomData, initialItemListData]);

  // Auto-close success popup
  useEffect(() => {
    if (successModel) {
      const timer = setTimeout(() => {
        setSuccessModel(false);
        if (apiResponse?.success) {
          navigate(-1);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successModel, apiResponse, navigate]);

  // --- 1. FETCH INITIAL CUSTOMERS ON MOUNT ---
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getAPI('/customer-master/get/all/');
        const customers = res?.data?.data || res?.data || [];

        setCustomerOptions([
          { label: 'Select Customer', value: '' },
          ...customers.map(c => ({
            label: c.companyName || c.name,
            value: c._id
          }))
        ]);
      } catch (err) {
        console.error("Failed to fetch customers", err);
        setCustomerOptions([{ label: 'Error loading customers', value: '' }]);
      }
    };

    fetchCustomers();
  }, []);

  // --- 2. FETCH PROJECTS WHEN CUSTOMER IS SELECTED ---
  useEffect(() => {
    const fetchProjects = async () => {
      if (!formData.customerId) {
        setProjectOptions([{ label: 'Select Project', value: '' }]);
        setItemOptions([{ label: 'Select Item', value: '' }]);
        return;
      }

      try {
        setProjectOptions([{ label: 'Loading projects...', value: '' }]);

        const res = await getAPI(
          `/project/by-customer/${formData.customerId}`
        );

        const projects = res?.data?.data || res?.data || [];

        setProjectOptions([
          { label: 'Select Project', value: '' },
          ...projects.map(p => ({
            label: p.projectName,
            value: p._id
          }))
        ]);

        // Don't reset project if we're in edit mode and have a projectId
        if (!isEditMode || !formData.projectId) {
          setFormData(prev => ({
            ...prev,
            projectId: '',
            itemId: ''
          }));
          setItemOptions([{ label: 'Select Item', value: '' }]);
          setTableData([]);
        }

      } catch (err) {
        console.error("Failed to fetch projects", err);
        setProjectOptions([{ label: 'Error loading projects', value: '' }]);
      }
    };

    fetchProjects();
  }, [formData.customerId, isEditMode]);

  // --- 3. FETCH ITEMS WHEN PROJECT IS SELECTED ---
  useEffect(() => {
    const fetchItems = async () => {
      if (!formData.projectId) {
        if (!isEditMode) {
          setItemOptions([{ label: 'Select Item', value: '' }]);
          setTableData([]);
        }
        return;
      }

      try {
        setItemOptions([{ label: 'Loading items...', value: '' }]);

        const res = await getAPI(
          `/bin/items/by-project?customerId=${formData.customerId}&projectId=${formData.projectId}`
        );

        const items = res?.data?.data || res?.data || [];
        
        setItemData(items);
        
        // Only transform and set table data if we're not in edit mode or if tableData is empty
        if (!isEditMode || tableData.length === 0) {
          const transformedTableData = items.map((item, index) => ({
            id: index + 1,
            _id: item._id,
            supplierItem: item.itemName || "N/A",
            customerItem: item.customerItemName || item.itemName || "N/A",
            unit: 0 // Default unit value
          }));
          
          setTableData(transformedTableData);
        }

        setItemOptions([
          { label: 'Select Item', value: '' },
          ...items.map(i => ({
            label: i.itemName,
            value: i._id
          }))
        ]);

      } catch (err) {
        console.error("Failed to fetch items", err);
        setItemOptions([{ label: 'Error loading items', value: '' }]);
        if (!isEditMode) {
          setTableData([]);
        }
      }
    };

    fetchItems();
  }, [formData.projectId, formData.customerId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle editing start
  const handleEditStart = (rowId, field, currentValue) => {
    setEditingCell({
      rowId,
      field,
      value: currentValue.toString()
    });
  };

  // Handle edit change
  const handleEditChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setEditingCell(prev => ({
        ...prev,
        value
      }));
    }
  };

  // Handle edit save
  const handleEditSave = () => {
    if (editingCell.rowId && editingCell.field) {
      setTableData(prev => prev.map(item => {
        if (item.id === editingCell.rowId) {
          return {
            ...item,
            [editingCell.field]: editingCell.value === '' ? 0 : parseInt(editingCell.value, 10)
          };
        }
        return item;
      }));
    }
    setEditingCell({ rowId: null, field: null, value: '' });
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingCell({ rowId: null, field: null, value: '' });
  };

  // Handle key press (Enter to save, Escape to cancel)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // Calculate total units
  const calculateTotalUnits = () => {
    return tableData.reduce((total, item) => total + (item.unit || 0), 0);
  };

  const handleConfirmSubmit = async () => {
    setConfirmModel(false);
    setIsSubmitting(true);

    // Prepare data with correct payload structure
    const submissionData = {
      bomName: formData.bomName,
      customerId: formData.customerId,
      projectId: formData.projectId,
      overallQuantity: calculateTotalUnits(),
      items: tableData
        .filter(item => item.unit > 0)
        .map(item => ({
          itemId: item._id,
          quantity: item.unit
        }))
    };

    try {
      let res;
      
      if (isEditMode && rowId) {
        // PUT request for edit mode
        res = await putAPI(`/bom/${rowId}`, submissionData);
      } else {
        // POST request for create mode
        res = await postAPI("/bom/", submissionData);
      }
      
      // Store the API response
      setApiResponse(res.data);
      
      // Extract message from API response
      const message = res?.data?.message || 
                      res?.data?.msg || 
                      res?.message || 
                      (isEditMode ? "BOM updated successfully!" : "BOM created successfully!");
      
      setPopupMessage(message);
      setSuccessModel(true);
      
      console.log(isEditMode ? "BOM updated:" : "BOM created:", res.data);
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} BOM:`, error);
      
      // Extract error message from API response
      const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.msg || 
                           error?.message || 
                           `Failed to ${isEditMode ? 'update' : 'create'} BOM. Please try again.`;
      
      setPopupMessage(errorMessage);
      setSuccessModel(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModel(false);
    // Navigate back after successful operation
    if (apiResponse?.success) {
      navigate(-1);
    }
  };

  // Check if a cell is being edited
  const isEditing = (rowId, field) => {
    return editingCell.rowId === rowId && editingCell.field === field;
  };

  // Show loading state for edit mode
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-800 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading BOM data for editing...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8"
    >
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">

        {/* --- HEADER SECTION --- */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl transition-all active:scale-90 cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
              <span>{isEditMode ? "Edit" : "Create"}</span> Bill Of Materials
              {isEditMode && rowId && <span className="text-sm ml-2 text-slate-500">(ID: {rowId})</span>}
            </h1>
          </div>
        </motion.div>

        {/* --- INPUT FIELDS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-12">
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="BOM Name"
              name="bomName"
              value={formData.bomName}
              onChange={handleChange}
              required
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Customer Name"
              name="customerId"
              type="select"
              options={customerOptions}
              value={formData.customerId}
              onChange={handleChange}
              required
              disabled={isEditMode} // Disable in edit mode
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Project Name"
              name="projectId"
              type="select"
              options={projectOptions}
              value={formData.projectId}
              onChange={handleChange}
              disabled={!formData.customerId || isEditMode} // Disable in edit mode
              required
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Item Name"
              name="itemId"
              type="select"
              options={itemOptions}
              value={formData.itemId}
              onChange={handleChange}
              disabled={!formData.projectId}
            />
          </motion.div>
        </div>

        {/* --- ITEM LIST TABLE --- */}
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Item List</h2>
          
          {tableData.length > 0 ? (
            <div className="overflow-hidden border border-slate-300 rounded-sm shadow-sm overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-white border-b border-slate-300">
                    <th className="w-24 py-5 px-4 text-center text-sm font-bold border-r border-slate-300 uppercase tracking-wider">
                      s.no
                    </th>
                    <th className="py-5 px-6 text-center text-sm font-bold border-r border-slate-300 uppercase tracking-wider">
                      Supplier's Item List
                    </th>
                    <th className="py-5 px-6 text-center text-sm font-bold border-r border-slate-300 uppercase tracking-wider">
                      Customer's Item List
                    </th>
                    <th className="w-72 py-5 px-4 text-center text-sm font-bold uppercase tracking-wider">
                      Items/Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-6 px-4 text-center text-sm font-medium border-r border-slate-300">
                        {item.id}
                      </td>
                      <td className="py-6 px-6 text-center text-sm font-medium border-r border-slate-300 text-slate-700">
                        {item.supplierItem}
                      </td>
                      <td className="py-6 px-6 text-center text-sm font-medium border-r border-slate-300 text-slate-700">
                        {item.customerItem}
                      </td>
                      <td className="py-6 px-4 text-center text-sm font-bold text-slate-900">
                        {isEditing(item.id, 'unit') ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              value={editingCell.value}
                              onChange={handleEditChange}
                              onKeyDown={handleKeyDown}
                              className="w-24 px-2 py-1 text-center border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                              autoFocus
                            />
                            <button
                              onClick={handleEditSave}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            {item.unit}
                            <button
                              onClick={() => handleEditStart(item.id, 'unit', item.unit)}
                              className="p-1 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Pencil
                                size={16}
                                className="text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                              />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* TABLE FOOTER / TOTAL ROW */}
                  {tableData.length > 0 && (
                    <tr className="bg-white font-bold text-slate-900">
                      <td className="py-6 px-4 text-center text-sm border-r border-slate-300">
                        Total
                      </td>
                      <td className="py-6 px-6 text-center text-sm border-r border-slate-300">
                        {tableData.length}
                      </td>
                      <td className="py-6 px-6 text-center text-sm border-r border-slate-300">
                        {tableData.length}
                      </td>
                      <td className="py-6 px-4 text-center text-sm tracking-widest">
                        {calculateTotalUnits().toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-slate-200 rounded-lg bg-slate-50">
              <p className="text-slate-500 text-lg">
                {formData.projectId 
                  ? "No items found for this project" 
                  : "Select a project to view items"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Display total overall quantity for confirmation */}
        {tableData.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">
              Total Overall Quantity: <span className="font-bold">{calculateTotalUnits().toLocaleString()}</span>
            </p>
          </motion.div>
        )}

        {/* --- ACTION BUTTONS --- */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-6 justify-end mt-6 mb-4"
        >
          <Button 
            onClick={() => setConfirmModel(true)} 
            variant="primary"
            disabled={!formData.bomName || !formData.customerId || !formData.projectId || tableData.length === 0 || isSubmitting}
          >
            {isSubmitting 
              ? (isEditMode ? 'Updating...' : 'Creating...') 
              : (isEditMode ? 'Update BOM' : 'Create BOM')}
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
        </motion.div>

        {/* Confirmation Popup */}
        <Confirmation_Popup
          isOpen={confirmModel}
          onClose={() => setConfirmModel(false)}
          onConfirm={handleConfirmSubmit}
          message={`Are you sure you want to ${isEditMode ? 'update' : 'create'} this Bill of Materials?`}
          title={isEditMode ? "Confirm Update" : "Confirm Creation"}
        />

        {/* Success/Error Popup */}
        <Success_Popup
          isOpen={successModel}
          onClose={handleSuccessClose}
          message={popupMessage}
          title={apiResponse?.success ? "Success" : "Error"}
          type={apiResponse?.success ? "success" : "error"}
        />
      </div>
    </motion.div>
  );
};

export default Bill_Create;