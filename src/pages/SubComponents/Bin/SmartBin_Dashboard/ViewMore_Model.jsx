import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Calendar,
  FileText,
  Hash,
  Image as ImageIcon,
  Info,
  Loader2,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../../component/button/Buttons";
import { bindashboard_moreView } from "../../../../service/Bin_Services/Bin_Services";

const ViewMore_Modal = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState("Transaction");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemImages, setItemImages] = useState([]); // Changed to Array for multiple images
  const [specifications, setSpecifications] = useState([]);
  const VITE_BASE_IMAGE_URL =
    import.meta.env.VITE_BASE_IMAGE_URL || "http://localhost:5000/"; // Base URL for images

  // --- FETCH DATA LOGIC ---
  useEffect(() => {
    const fetchData = async () => {
      const customerMasterId = data?.customerMasterId;
      const itemMasterID = data?.itemMasterID || data?.itemMasterId;

      if (!isOpen || !customerMasterId || !itemMasterID) return;

      setLoading(true);

      try {
        const res = await bindashboard_moreView(customerMasterId, itemMasterID);
        const responseData = res?.data?.data; // Targeting the nested "data" object from your JSON

        if (responseData) {
          // 1. SET TRANSACTIONS
          setTableData(responseData.transactions || []);

          // 2. SET ITEM DETAILS (Images & Specifications)
          const itemDetails = responseData.itemDetails;
          if (itemDetails) {
            // Set Images
            setItemImages(itemDetails.itemImages || []);

            // Set Specs (Transforming string into the expected {label, value} object)
            if (itemDetails.itemDescription) {
              setSpecifications([
                { label: "Description", value: itemDetails.itemDescription },
              ]);
            } else {
              setSpecifications([]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching more view data:", err);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && data) {
      fetchData();
    } else {
      // Reset state when modal closes
      setTableData([]);
      setSpecifications([]);
      setItemImages([]);
      setActiveTab("Transaction");
    }
  }, [data, isOpen]);

  // Formatter for transaction date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Animation Variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      filter: "blur(10px)",
      transition: { duration: 0.2 },
    },
  };

  const panelVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const containerVariants = {
    animate: { transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const tabs = [
    { id: "Transaction", icon: <FileText size={18} /> },
    { id: "Image", icon: <ImageIcon size={18} /> },
    { id: "Specifications", icon: <Settings size={18} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="px-8 py-4 bg-gradient-to-r from-[#0062a0] to-[#0088cc] text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">Item Details</h2>
                  <p className="text-sm text-white/80">
                    {data?.itemName || "Unknown Item"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Customer ID: {data?.customerMasterId?.substring(0, 8)}...
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Item ID: {data?.itemMasterID?.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-50 p-2 gap-1">
              <LayoutGroup>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[15px] font-bold transition-colors z-10 cursor-pointer ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.icon}
                    {tab.id}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-[#0062a0] rounded-2xl -z-10"
                        transition={{
                          type: "spring",
                          duration: 0.5,
                          bounce: 0.2,
                        }}
                      />
                    )}
                  </button>
                ))}
              </LayoutGroup>
            </div>

            {/* Content Area */}
            <div className="p-8 min-h-[450px] max-h-[500px] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + (loading ? "-loading" : "-ready")}
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={40} />
                      </motion.div>
                      <p className="mt-4 font-medium animate-pulse tracking-wide">
                        Fetching Details...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* TRANSACTION TAB */}
                      {activeTab === "Transaction" && (
                        <div className="border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-sm">
                          <table className="w-full text-center border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50">
                                <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                  <div className="flex items-center justify-center gap-2">
                                    <Info size={14} /> Type / Name
                                  </div>
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                  <div className="flex items-center justify-center gap-2">
                                    <Hash size={14} /> Qty
                                  </div>
                                </th>
                                <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                  <div className="flex items-center justify-center gap-2">
                                    <Calendar size={14} /> Date
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <motion.tbody
                              variants={containerVariants}
                              initial="initial"
                              animate="animate"
                            >
                              {tableData.length > 0 ? (
                                tableData.map((item, index) => (
                                  <motion.tr
                                    key={item._id || index}
                                    variants={itemVariants}
                                    className="hover:bg-blue-50/30 transition-colors border-t border-slate-50"
                                  >
                                    <td className="py-4 px-6 text-slate-700 font-semibold">
                                      {/* Shows "RELOAD_TO_BIN" properly */}
                                      <div className="text-sm">
                                        {item.transactionType?.replace(
                                          /_/g,
                                          " ",
                                        ) || "N/A"}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-normal">
                                        {data?.itemName}
                                      </div>
                                    </td>
                                    <td className="py-4 px-6">
                                      <span className="bg-blue-50 text-[#0062a0] px-4 py-1.5 rounded-xl text-xs font-bold">
                                        {item.quantity ||
                                          item.qty ||
                                          item.total_qty ||
                                          0}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-500 text-sm font-medium">
                                      {formatDate(item.transactionDate)}
                                    </td>
                                  </motion.tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="py-20 text-slate-400 font-medium text-center italic"
                                  >
                                    No transaction records found for this item
                                  </td>
                                </tr>
                              )}
                            </motion.tbody>
                          </table>
                        </div>
                      )}

                      {/* IMAGE TAB */}
                      {activeTab === "Image" && (
                        <div className="w-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[32px] p-8 bg-slate-50/50">
                          {itemImages.length > 0 ? (
                            <motion.div
                              variants={containerVariants}
                              initial="initial"
                              animate="animate"
                              className="grid grid-cols-2 md:grid-cols-3 gap-6"
                            >
                              {itemImages.map((imgPath, index) => (
                                <motion.div
                                  key={index}
                                  variants={itemVariants}
                                  className="relative group"
                                >
                                  <img
                                    src={`${VITE_BASE_IMAGE_URL}${imgPath}`} // Ensure Base URL is appended
                                    alt={`Product Image ${index + 1}`}
                                    className="w-full h-40 object-cover rounded-2xl shadow-md border-4 border-white transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/300?text=No+Image+Found";
                                    }}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-12">
                              <ImageIcon
                                size={48}
                                className="mx-auto mb-4 opacity-20"
                              />
                              <p className="text-lg font-semibold">
                                No Images Available
                              </p>
                              <p className="text-sm text-slate-300 mt-1">
                                No preview found for this item
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SPECIFICATIONS TAB */}
                      {activeTab === "Specifications" && (
                        <motion.div
                          variants={containerVariants}
                          initial="initial"
                          animate="animate"
                          className="grid grid-cols-1 md:grid-cols-1 gap-4"
                        >
                          {specifications.length > 0 ? (
                            specifications.map((spec, i) => (
                              <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -2, backgroundColor: "#fff" }}
                                className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all"
                              >
                                <span className="font-bold text-slate-400 uppercase text-[11px] tracking-widest min-w-[120px]">
                                  {spec.label}
                                </span>
                                <span className="font-bold text-slate-800 text-right">
                                  {spec.value}
                                </span>
                              </motion.div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-20 text-slate-400 font-medium italic">
                              No specifications available
                            </div>
                          )}
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-8 pt-0 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="!rounded-2xl !px-8 !py-4 shadow-lg active:scale-95 transition-all"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                className="!rounded-2xl !px-12 !py-4 shadow-lg active:scale-95 transition-all"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ViewMore_Modal;
