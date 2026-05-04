import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API Service
import { warehouse_get } from "../../../../service/Orders_Services/Oreder_Services";
import { useDispatch, useSelector } from 'react-redux';
import { fetchPermissions } from '../../../../store/Permission_Store/Permission_Slice';

/**
 * Reusable component for label-value pairs with formatting
 */
const InfoField = ({ label, value, isNumber = false }) => {
  const displayValue = isNumber && typeof value === 'number' 
    ? value.toLocaleString() 
    : value;

  return (
    <div className="flex flex-col gap-1 mb-6">
      <span className="text-[14px] text-gray-400 font-medium">{label}</span>
      <span className="text-[16px] font-bold text-slate-900">
        {displayValue !== undefined && displayValue !== null && displayValue !== "" ? displayValue : "N/A"}
      </span>
    </div>
  );
};

const Warehouse_View = ({ isOpen, onClose, id }) => {
  const navigate = useNavigate();

    const { permissions } = useSelector((state) => state.permissions);
  const dispatch = useDispatch();
  const userPermissions = permissions[7] || {};
  
  // Define permission checks
  const canEdit = userPermissions?.edit || false;
  
  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);
  
  const [loading, setLoading] = useState(false);
  const [displayData, setDisplayData] = useState(null);

  const fetchWarehouseDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const res = await warehouse_get(id); 

      const rawData = res?.data?.data;
      
      // Locate the exact item whether the API returns an array or single object
      const item = Array.isArray(rawData) 
        ? (rawData.find(w => w._id === id || w.warehouseId === id) || rawData[0]) 
        : rawData;

      if (item) {
        setDisplayData({
          warehouseId: item.warehouseId,
          status: item.status === 1 ? "Active" : "Inactive",
          
          // Warehouse Details (Safely extracting customer name)
          companyName: item.customerId?.companyName || item.customerId?.companyName || "N/A",
          customerName: item.customerId?.customerName || item.customerId?.companyName || "N/A",
          warehouseName: item.warehouseName,
          location: item.warehouseLocation,
          remarks: item.remarks || "No additional remarks provided for this warehouse.",
          
          // Pass the entire items array to display in the table
          itemsList: item.items ||[] 
        });
      }
    } catch (err) {
      console.error("Error fetching warehouse view:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isOpen) {
       setDisplayData(null);
    }
    if (isOpen && id) {
      fetchWarehouseDetails();
    }
  }, [isOpen, id, fetchWarehouseDetails]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[1000px] bg-white rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-4">
              <h2 className="text-[28px] md:text-[32px] font-bold">
                {loading ? (
                  <span className="text-gray-300">Loading...</span>
                ) : (
                  <>
                    <span className="text-[#0062a0]">View {displayData?.warehouseId}</span>{" "}
                    <span className={displayData?.status === 'Active' ? "text-[#10b981]" : "text-red-500"}>
                      ({displayData?.status})
                    </span>
                  </>
                )}
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full text-slate-900 transition-colors"
              >
                <X size={32} />
              </button>
            </div>

            <div className="w-full px-8">
                <hr className="border-gray-100" />
            </div>

            {/* Body */}
            <div className="p-8 pt-6 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="animate-spin text-[#0062a0] mb-4" size={48} />
                  <p className="text-gray-500 font-medium">Fetching details...</p>
                </div>
              ) : displayData ? (
                <>
                  {/* WAREHOUSE DETAILS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                    <InfoField label="Company Name" value={displayData.companyName} />
                    <InfoField label="Customer Name" value={displayData.customerName} />
                    <InfoField label="Warehouse Name" value={displayData.warehouseName} />
                    <InfoField label="Warehouse Location" value={displayData.location} />
                  </div>

                  {/* ITEMS TABLE */}
                  <div className="mt-2">
                    <h3 className="text-[18px] font-bold text-slate-800 mb-4">Warehouse Items</h3>
                    
                    {displayData.itemsList && displayData.itemsList.length > 0 ? (
                      <div className="overflow-x-auto border border-gray-200 rounded-[8px]">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-[#f8fafc] border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-gray-600">Item Name</th>
                              <th className="px-4 py-3 font-semibold text-gray-600">Max Limit</th>
                              <th className="px-4 py-3 font-semibold text-gray-600">Safety Stock</th>
                              <th className="px-4 py-3 font-semibold text-gray-600">Reorder Level</th>
                              <th className="px-4 py-3 font-semibold text-gray-600">Supplier Name</th>
                              <th className="px-4 py-3 font-semibold text-gray-600">Last Trans. Qty</th>
                              <th className="px-4 py-3 font-semibold text-gray-600">Last Trans. Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {displayData.itemsList.map((item, index) => {
                              // Safely extract the item name and part number from the populated object
                              const itemName = item.itemMasterId?.itemName || "Unknown Item";
                              const partNumber = item.itemMasterId?.partNumber || "";

                              return (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3">
                                    <span className="text-[#0062a0] font-medium">{itemName}</span>
                                    {partNumber && (
                                      <span className="block text-xs text-gray-500 font-normal">
                                        {partNumber}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-slate-700 font-medium">{item.warehouseLimit?.toLocaleString() || "0"}</td>
                                  <td className="px-4 py-3 text-slate-700 font-medium">{item.warehouseSafeStock?.toLocaleString() || "0"}</td>
                                  <td className="px-4 py-3 text-slate-700 font-medium">{item.warehouseReorderLevel?.toLocaleString() || "0"}</td>
                                  <td className="px-4 py-3 text-slate-700">{item.supplerName || item.supplierName || "N/A"}</td>
                                  <td className="px-4 py-3 text-slate-700 font-medium">
                                    {item.lastTransationQuantity?.toLocaleString() || item.lastTransactionQuantity?.toLocaleString() || "0"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-700">
                                    {item.lastTransactionDate ? new Date(item.lastTransactionDate).toLocaleDateString('en-GB') : "N/A"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-6 text-center text-gray-500 font-medium">
                        No items found in this warehouse.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  Data could not be retrieved.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 flex justify-end bg-gray-50 border-t border-gray-100">
              <button disabled={!canEdit}
                onClick={() => {
                    onClose();
                    navigate('warehouse-create', { state: { mode: 'edit', id: id } });
                }}
                className="bg-[#005a92] hover:bg-[#004d7c] text-white px-10 py-2.5 rounded-[8px] text-[16px] font-bold transition-all shadow-md"
              >
                Edit Warehouse
              </button>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Warehouse_View;