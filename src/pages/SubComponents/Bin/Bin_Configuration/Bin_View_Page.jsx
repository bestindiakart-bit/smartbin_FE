import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import { bin_dashboard_getById } from "../../../../service/Bin_Services/Bin_Services";

const Bin_View_Page = ({ isOpen, onClose, rowId }) => {
  const navigate = useNavigate();
  const [binData, setBinData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data when modal opens and rowId is provided
  useEffect(() => {
    const fetchBinDetails = async () => {
      if (!isOpen || !rowId) return;

      setLoading(true);
      try {
        const res = await bin_dashboard_getById(rowId);
        const fetchedData = res?.data?.data?.record || res?.data;
        setBinData(fetchedData);
      } catch (error) {
        console.error("Error fetching bin details:", error);
        setBinData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBinDetails();
  }, [isOpen, rowId]);

  // Helper functions
  const getStatusText = (status) => (status === 1 || status === true ? "Active" : "Inactive");
  const getStatusColor = (status) => (status === 1 || status === true ? "text-emerald-500" : "text-red-500");

  // Build info fields – adjust keys to match your backend response
  const infoFields = binData ? [
    { label: "Bin ID", value: binData.binId },
    { label: "Customer Name", value: binData.customerId?.customerName || binData.customerName },
    { label: "Project Name", value: binData.projectId?.projectName || binData.projectName },
    { label: "Item Name", value: binData.itemMasterId?.itemName || binData.itemName },
    { label: "Warehouse", value: binData.warehouseId?.warehouseName || binData.warehouseId },
    { label: "Max Weight", value: binData.binAllowableWeight },
    { label: "Max Quantity", value: binData.binAllowablelimit || binData.binMaxQuantity },
    { label: "ROL", value: binData.rol },
    { label: "Safety Stock", value: binData.safetyStockQuantity },
    { label: "Price", value: binData.itemPerPrice ? `₹${binData.itemPerPrice}` : "N/A" },
  ] : [];

  // FIXED: use 'rowId' (lowercase d) instead of 'rowID'
  const handleEditNavigate = () => {
    navigate("bin-create", { state: { mode: "edit", rowId: rowId } });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-[101]"
          >
            {loading ? (
              <div className="h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 animate-pulse">Loading Bin Details...</p>
              </div>
            ) : binData ? (
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Configuration Details
                    </h2>
                    <p className={`font-semibold ${getStatusColor(binData.status || binData.itemStatus)}`}>
                      ● {getStatusText(binData.status || binData.itemStatus)}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-500" />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {infoFields.map((field, idx) => (
                    <div key={idx} className="border-b border-slate-50 pb-3">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        {field.label}
                      </p>
                      <p className="text-base font-semibold text-slate-700">
                        {field.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-10 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <Button onClick={handleEditNavigate} variant="primary">
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <p className="text-slate-500">No data found for this ID.</p>
                <button onClick={onClose} className="mt-4 text-blue-600 underline">Close</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Bin_View_Page;