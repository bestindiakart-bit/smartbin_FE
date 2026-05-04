import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../../component/button/Buttons';
import { getAPI } from '../../../../service/Orders_Services/Oreder_Services';

const Bill_View_page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rowId = location.state?.rowId || location.state?.rowID;

  const [bomData, setBomData] = useState(null);
  const [itemListData, setItemListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch BOM Detail API
  useEffect(() => {
    if (rowId) {
      const fetchBomDetails = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const res = await getAPI(`/bom/${rowId}`);
          
          // Log the entire response for debugging
          console.log("Full API Response:", res);
          
          // Extract data from the response structure { success: true, statusCode: 200, data: {...} }
          const data = res?.data?.data || res?.data || res;
          
          console.log("Extracted Data:", data);
          
          if (data) {
            setBomData(data);

            // Find items array - check different possible locations
            let itemsArray = [];
            
            if (data?.items && Array.isArray(data.items)) {
              itemsArray = data.items;
            } else if (data?.itemList && Array.isArray(data.itemList)) {
              itemsArray = data.itemList;
            } else if (data?.bomItems && Array.isArray(data.bomItems)) {
              itemsArray = data.bomItems;
            } else if (data?.lineItems && Array.isArray(data.lineItems)) {
              itemsArray = data.lineItems;
            } else if (data?.products && Array.isArray(data.products)) {
              itemsArray = data.products;
            }
            
            console.log("Found items array:", itemsArray);
            
            if (itemsArray.length > 0) {
              // Map the items with comprehensive field checking
              const mappedItems = itemsArray.map((item, index) => {
                console.log(`Processing item ${index}:`, item);
                
                // Helper function to get nested property safely
                const getNestedValue = (obj, path) => {
                  return path.split('.').reduce((current, key) => {
                    return current && current[key] !== undefined ? current[key] : undefined;
                  }, obj);
                };

                // Try to find supplier item name from various possible paths
                const supplierItem = 
                  item.supplierItemName ||
                  item.supplierName ||
                  item.supplierItem ||
                  item.itemName ||
                  item.name ||
                  getNestedValue(item, 'itemId.itemName') ||
                  getNestedValue(item, 'supplierId.name') ||
                  getNestedValue(item, 'item.name') ||
                  `Item ${index + 1}`;

                // Try to find customer item name from various possible paths
                const customerItem = 
                  item.customerItemName ||
                  item.customerName ||
                  item.customerItem ||
                  item.itemName ||
                  item.name ||
                  getNestedValue(item, 'customerId.itemName') ||
                  getNestedValue(item, 'customer.name') ||
                  supplierItem; // Fallback to supplier item

                // Try to find quantity/unit from various possible paths
                const unit = 
                  item.quantity ||
                  item.qty ||
                  item.unit ||
                  item.units ||
                  item.quantityValue ||
                  item.quantityPerUnit ||
                  getNestedValue(item, 'quantity.value') ||
                  0;
                  const overallQuantity =
                  item.overallQuantity ||
                  item.totalQuantity ||
                  getNestedValue(item, 'overallQuantity') ||
                  getNestedValue(item, 'totalQuantity') ||
                  0;

                return {
                  id: index + 1,
                  _id: item._id || item.itemId?._id || item.id,
                  supplierItem: String(supplierItem),
                  customerItem: String(customerItem),
                  unit: unit,
                  // Store original item data for debugging if needed
                  originalData: item
                };
              });
              
              setItemListData(mappedItems);
            } else {
              setItemListData([]);
            }
          } else {
            setError("No data received from API");
          }
        } catch (error) {
          console.error("Error fetching BOM details:", error);
          setError(error.message || "Failed to fetch BOM details");
        } finally {
          setLoading(false);
        }
      };
      
      fetchBomDetails();
    } else {
      setLoading(false);
      setError("No row ID provided");
    }
  }, [rowId]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  // Handle Edit button click
  const handleEditClick = () => {
    navigate('../bill-create', { 
      state: { 
        mode: 'edit', 
        rowId: rowId,
        bomData: bomData,
        itemListData: itemListData
      } 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-800 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading BOM details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-10">
        <div className="max-w-full mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
            <h3 className="font-bold text-lg mb-2">Error Loading Data</h3>
            <p>{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-white p-4 md:p-10 font-sans text-slate-800"
    >
      <div className="max-w-full mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: '#e0f2fe' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-2 text-slate-800 rounded-full transition-all cursor-pointer hover:bg-slate-100"
            >
              <ArrowLeft size={28} />
            </motion.button>
            <h1 className="text-[32px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
              View {bomData?.bomId || bomData?.bomNumber || 'BOM Details'}
            </h1>
          </div>
        </div>

        <hr className="border-slate-200 mb-12" />

        {/* --- TOP SUMMARY INFO --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8 mb-16 px-2">
          <InfoField 
            label="Customer" 
            value={bomData?.customerId?.companyName || 
                   bomData?.customerName || 
                   bomData?.customer || 
                   'N/A'} 
          />
          <InfoField 
            label="Project" 
            value={bomData?.projectId?.projectName || 
                   bomData?.projectName || 
                   bomData?.project || 
                   'N/A'} 
          />
          <InfoField 
            label="BOM Name" 
            value={bomData?.bomName || 
                   bomData?.name || 
                   bomData?.title || 
                   'N/A'} 
          />
        </div>

        {/* --- ITEM LIST SECTION --- */}
        <div className="px-2">
          <h2 className="text-[28px] font-bold text-slate-900 mb-8">Item List</h2>
          
          <div className="overflow-hidden border border-slate-300 rounded-sm shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <th className="w-24 py-5 px-4 text-center text-[15px] font-semibold border-r border-slate-300">
                      S.No
                    </th>
                    <th className="py-5 px-6 text-center text-[15px] font-semibold border-r border-slate-300">
                      Supplier's Item List
                    </th>
                    <th className="py-5 px-6 text-center text-[15px] font-semibold border-r border-slate-300">
                      Customer's Item List
                    </th>
                    <th className="w-64 py-5 px-4 text-center text-[15px] font-semibold">
                      Items/Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemListData.length > 0 ? (
                    itemListData.map((item) => (
                      <motion.tr 
                        key={item.id}
                        variants={itemVariants}
                        className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-6 px-4 text-center text-[15px] font-medium border-r border-slate-200 text-slate-700">
                          {item.id}
                        </td>
                        <td className="py-6 px-6 text-center text-[15px] font-medium border-r border-slate-200 text-slate-700">
                          {item.supplierItem}
                        </td>
                        <td className="py-6 px-6 text-center text-[15px] font-medium border-r border-slate-200 text-slate-700">
                          {item.customerItem}
                        </td>
                        <td className="py-6 px-4 text-center text-[15px] font-medium text-slate-900">
                          <div className="flex items-center justify-center gap-3">
                            <span className="font-semibold">{item.unit}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-slate-400 text-4xl">📋</span>
                          <p className="text-slate-500 font-medium text-lg">
                            No items available for this BOM
                          </p>
                          <p className="text-slate-400 text-sm">
                            Items will appear here once added to the bill of materials
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Display item count if items exist */}
          {itemListData.length > 0 && (
            <div className="mt-4 text-sm text-slate-500">
              Total Items: {itemListData.length} | Total Units: {itemListData.reduce((sum, item) => sum + (item.unit || 0), 0)}
            </div>
          )}
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="flex justify-end mt-10 pb-12">
          <Button
            variant="primary"
            children="Edit"
            className="px-10 py-3 text-lg rounded-md hover:shadow-lg transition-shadow"
            onClick={handleEditClick}
          />
        </div>

      </div>
    </motion.div>
  );
};

/**
 * Helper component for the Summary Info items
 */
const InfoField = ({ label, value }) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 }
    }}
    className="flex flex-col gap-2"
  >
    <span className="text-[15px] font-medium text-slate-500 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-xl font-bold text-slate-900 break-words">
      {value}
    </span>
  </motion.div>
);

export default Bill_View_page;