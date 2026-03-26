import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Edit3, Eye, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import { item_master_getID } from "../../../../service/Master_Services/Master_Services";

const InfoField = ({ label, value, centered = false }) => (
  <div className={`flex flex-col gap-1.5 group ${centered ? "items-center md:items-start" : ""}`}>
    <span className="text-sm text-gray-400 font-bold tracking-wider uppercase group-hover:text-[#0062a0] transition-colors duration-300">
      {label}
    </span>
    <span className="text-[17px] font-bold text-gray-900">
      {value || "N/A"}
    </span>
  </div>
);

const Card = ({ children, title, className = "", variants }) => (
  <motion.div 
    variants={variants}
    className={`bg-white border border-slate-100 rounded-[32px] p-6 md:p-10 shadow-sm ${className}`}
  >
    {title && (
      <h3 className="text-xl font-bold text-[#0062a0] mb-8 pb-3 border-b border-slate-50 tracking-tight">
        {title}
      </h3>
    )}
    {children}
  </motion.div>
);

const Item_View_Page = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  
  const [itemData, setItemData] = useState(null);
  const[loading, setLoading] = useState(true);
  
  // States for Full Screen Viewers
  const[fullScreenImg, setFullScreenImg] = useState(null);
  const[fullScreenPdf, setFullScreenPdf] = useState(null); 

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await item_master_getID(id);
        if (res?.data?.success) {
          setItemData(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  },[id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Helper to check if a file is an image based on extension
  const isImageFile = (filePath) => {
    if (!filePath) return false;
    const ext = filePath.split('.').pop().toLowerCase();
    return['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  // =========================================================================
  // HELPER: Safely attaches the backend Base URL to the file path
  // so images and PDFs load correctly across localhost & Ngrok.
  // =========================================================================
  const getFullFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath; 
    
    let baseUrl = import.meta.env.VITE_BASE_IMAGE_URL?.replace(/\/+$/, '') || "http://localhost:5000"; 
    baseUrl = baseUrl.replace(/\/api\/?$/, ''); 
    
    const cleanPath = filePath.replace(/^\/+/, ''); 
    
    return `${baseUrl}/${cleanPath}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#0062a0]">Loading Item Details...</div>;
  
  if (!itemData) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-bold text-xl">Item Not Found</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const drawingsArray = itemData.itemDrawing 
    ? (Array.isArray(itemData.itemDrawing) ? itemData.itemDrawing : [itemData.itemDrawing])
    :[];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-6 md:p-10 relative"
    >
      {/* HEADER */}
      <div className="max-w-[1400px] mx-auto flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 text-[#0062a0] hover:bg-blue-50 rounded-2xl transition-all cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-slate-800">Item Details</h1>
        </div>
        <Button
            onClick={() => navigate('../item-create', { state: { mode: 'edit', id: itemData._id } })}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Edit3 size={18} /> Edit Item
        </Button>
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* SUMMARY CARD */}
        <Card variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoField label="Item ID" value={itemData.itemId} centered />
          <InfoField label="Item Name" value={itemData.itemName} centered />
          <InfoField label="Part Number" value={itemData.partNumber} centered />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Card variants={itemVariants} title="General Information">
              <div className="space-y-6">
                <InfoField label="Category ID" value={itemData.itemCategory} />
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-400 font-bold uppercase">Description</span>
                  <p className="text-gray-700 font-medium">{itemData.itemDescription || "No description available"}</p>
                </div>
                <InfoField label="Remarks" value={itemData.remarks} />
              </div>
            </Card>

            <Card variants={itemVariants} title="Pricing & Logistics">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6">
                <InfoField label="Cost Per Unit" value={`₹${itemData.costPerUnit}`} />
                <InfoField label="Average selling price" value={`₹${itemData.price}`} />
                <InfoField label="Weight" value={`${itemData.weightPerUnit} kg`} />
                <InfoField label="HSN Code" value={itemData.itemHSNCode} />
                <InfoField label="Manufacturing Days" value={`${itemData.manufacturingTime} days`} />
                <InfoField label="Is Local?" value={itemData.isLocal ? "Yes" : "No"} />
              </div>
            </Card>
          </div>

          {/* PRODUCT MEDIA & DRAWINGS SECTION */}
          <Card variants={itemVariants} title="Media & Documents" className="h-fit">
            
            {/* PRODUCT IMAGES */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Product Images</h4>
              <div className="grid grid-cols-2 gap-4">
                {itemData.itemImages && itemData.itemImages.length > 0 ? (
                  itemData.itemImages.map((img, idx) => {
                    const fullImgUrl = getFullFileUrl(img);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setFullScreenImg(fullImgUrl)}
                        className="relative aspect-square border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-center p-2 overflow-hidden group cursor-pointer"
                      >
                        <img 
                          src={fullImgUrl} 
                          alt={`Product ${idx + 1}`} 
                          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <Eye className="text-white drop-shadow-md" size={32} />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-gray-400 text-sm italic">No images available</p>
                  </div>
                )}
              </div>
            </div>

            {/* ITEM DRAWINGS / PDFS */}
            {drawingsArray.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Item Drawings</h4>
                <div className="flex flex-col gap-3">
                  {drawingsArray.map((doc, idx) => {
                    const fullDocUrl = getFullFileUrl(doc);
                    const isImg = isImageFile(doc);
                    const fileName = doc.split('/').pop() || `Document ${idx + 1}`;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="text-[#0062a0] flex-shrink-0" size={20} />
                          <span className="text-sm font-semibold text-slate-700 truncate" title={fileName}>
                            {fileName}
                          </span>
                        </div>
                        <button
                          onClick={() => isImg ? setFullScreenImg(fullDocUrl) : setFullScreenPdf(fullDocUrl)}
                          className="p-2 text-[#0062a0] hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                          title="View Document"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Empty State for Drawings */}
            {drawingsArray.length === 0 && (
              <div className="pt-6 border-t border-slate-100">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Item Drawings & PDFs</h4>
                 <div className="py-6 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-gray-400 text-sm italic">No drawings available</p>
                  </div>
              </div>
            )}
            
          </Card>
        </div>

        {/* INVENTORY SECTION */}
        <Card variants={itemVariants} title="Warehouse & Stock">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <InfoField label="Available Stock" value={`${itemData.warehouseStock} Units`} />
            
            <InfoField label="Stock ROL" value={`${itemData.warehouseROL || itemData.stockROL || 0} Units`} />
            <InfoField label="Safety Stock" value={`${itemData.warehouseSafetyStock} Units`} />
            <div className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-400 font-bold uppercase">Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border w-fit ${itemData.status === 1 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {itemData.status === 1 ? "ACTIVE" : "INACTIVE"}
                </span>
            </div>
          </div>
        </Card>
      </div>

      {/* FULL SCREEN IMAGE VIEWER MODAL */}
      <AnimatePresence>
        {fullScreenImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
            onClick={() => setFullScreenImg(null)}
          >
            <button 
              onClick={() => setFullScreenImg(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
            >
              <X size={28} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none"
            >
              <div className="pointer-events-auto bg-white/5 p-2 rounded-3xl overflow-hidden max-h-full">
                <img 
                  src={fullScreenImg} 
                  alt="Full Screen Preview" 
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN PDF VIEWER MODAL */}
      <AnimatePresence>
        {fullScreenPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
            onClick={() => setFullScreenPdf(null)}
          >
            <button 
              onClick={() => setFullScreenPdf(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
            >
              <X size={28} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 z-10">
                <div className="flex items-center gap-2 text-[#0062a0]">
                  <FileText size={20} />
                  <h3 className="font-bold text-slate-800">Document Viewer</h3>
                </div>
                <Button 
                  onClick={() => window.open(fullScreenPdf, '_blank')}
                  variant="secondary"
                  className="py-1.5 px-4 text-sm"
                >
                  Open in New Tab
                </Button>
              </div>
              
              {/* Used standard <object> for better PDF rendering with a strong fallback */}
              <div className="w-full flex-1 relative bg-slate-100">
                <object 
                  data={fullScreenPdf} 
                  type="application/pdf" 
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Fallback layout if browser does not support embedded PDFs */}
                  <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center bg-white">
                    <FileText size={64} className="text-slate-300" />
                    <p className="text-lg font-medium text-slate-600">
                      Your browser does not support inline PDF viewing.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                      Click the button below to view the document securely.
                    </p>
                    <Button 
                      onClick={() => window.open(fullScreenPdf, '_blank')}
                      variant="primary"
                    >
                      View PDF in New Tab
                    </Button>
                  </div>
                </object>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Item_View_Page;