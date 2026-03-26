import { motion } from "framer-motion";
import { ArrowLeft, FileText, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
// Imported custom Image component to handle existing Ngrok/Backend URLs
import Image from "../../../../component/image/Image";

// Import your APIs
import {
  item_category_gets,
  Item_create,
  item_create_edit,
  item_master_getID,
} from "../../../../service/Master_Services/Master_Services";

const Item_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const drawingInputRef = useRef(null); // Ref for itemDrawing PDFs/Images

  const isEdit = location.state?.mode === "edit";
  const editId = location.state?.id;

  const [confirm, setConfirm] = useState(false);
  const [successModel, setSuccessModel] = useState(false);
  const[errorModel, setErrorModel] = useState(false);
  const [apiError, setApiError] = useState("");
  const[loading, setLoading] = useState(isEdit);
  const [message,setMessage] = useState({});

  // State for the Category Dropdown list
  const[itemType, setItemType] = useState([]);

  const [formData, setFormData] = useState({
    itemName: "",
    partNumber: "",
    itemDescription: "",
    weightPerUnit: "",
    costPerUnit: "",
    remarks: "",
    manufacturingTime: "",
    itemCategory: "", // This will hold the ID or Name of the selected category
    itemSBQ: "",
    outerBoxQuantity: "",
    itemHSNCode: "",
    warehouseStock: "",
    warehouseSafetyStock: "",
    warehouseROL: "",
    itemStatus: true,
    isLocal: "No",
  });

  const [images, setImages] = useState([]);
  const [drawings, setDrawings] = useState([]); // State for itemDrawing (PDFs/Images)

  // ================= FETCH CATEGORIES AND EDIT DATA =================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const categoryRes = await item_category_gets();

        // Correct path based on your API response
        const categories = categoryRes?.data?.data?.records ||[];

        // Format for dropdown (recommended structure)
        const formattedCategories = categories.map((cat) => ({
          label: cat.categoryName,
          value: cat._id,
          status: cat.status,
        }));

        setItemType(formattedCategories);

        if (isEdit && editId) {
          const res = await item_master_getID(editId);
          const item = res?.data?.data;

          if (item) {
            const { status, ...rest } = item; // Remove status from spread

            setFormData({
              ...rest,
              itemStatus: status === 1,
              isLocal: item.isLocal ? "Yes" : "No",
              warehouseSafetyStock: item.warehouseSafetyStock || "",
              itemCategory: item.itemCategory?._id || item.itemCategory || "",
            });

            // Populate existing images into the state array
            if (item.itemImages && Array.isArray(item.itemImages)) {
              const loadedImages = item.itemImages.map((imgPath) => ({
                file: null, // No file object for existing DB images
                preview: imgPath, // The URL used to display it on screen
                isExisting: true, // Flag so we don't upload it as a new file
                originalPath: imgPath, // Sent back to API so backend knows it's kept
              }));
              setImages(loadedImages);
            }

            // Populate existing drawings/PDFs into the state array
            if (item.itemDrawing) {
              const drawingsArray = Array.isArray(item.itemDrawing)
                ? item.itemDrawing
                : [item.itemDrawing];

              const loadedDrawings = drawingsArray.map((docPath) => ({
                file: null,
                preview: docPath,
                isExisting: true,
                originalPath: docPath,
                name: docPath.split("/").pop() || "Existing Document", // Extract filename from URL
              }));
              setDrawings(loadedDrawings);
            }
          }
        }
      } catch (err) {
        console.error("Data Fetching Error:", err);
        setApiError("Failed to fetch initial data.");
        setErrorModel(true);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  },[isEdit, editId]);

  // ================= FILE HANDLING =================
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = null;
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      const filtered = prev.filter((_, index) => index !== indexToRemove);
      if (!prev[indexToRemove].isExisting)
        URL.revokeObjectURL(prev[indexToRemove].preview);
      return filtered;
    });
  };

  const handleDrawingChange = (e) => {
    const files = Array.from(e.target.files);
    const newDrawings = files.map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
      isExisting: false,
      name: file.name,
    }));
    setDrawings((prev) => [...prev, ...newDrawings]);
    e.target.value = null;
  };

  const removeDrawing = (indexToRemove) => {
    setDrawings((prev) => {
      const filtered = prev.filter((_, index) => index !== indexToRemove);
      if (!prev[indexToRemove].isExisting)
        URL.revokeObjectURL(prev[indexToRemove].preview);
      return filtered;
    });
  };

  // ================= HANDLE SUBMISSION =================
  const handleFinalSubmit = async () => {
  setConfirm(false);

  try {
    const data = new FormData();

    // Append form fields
    Object.keys(formData).forEach((key) => {
      if (key === "itemStatus") return;
      if (key === "status") return;

      if (key === "isLocal") {
        data.append("isLocal", formData.isLocal === "Yes");
      } else if ([
          "weightPerUnit",
          "costPerUnit",
          "manufacturingTime",
          "itemSBQ",
          "warehouseStock",
          "warehouseSafetyStock",
          "warehouseROL",
        ].includes(key)
      ) {
        data.append(key, Number(formData[key]) || 0);
      } else if (key === "price") {
        const cleanPrice = Number(
          String(formData.price).replace(/[^0-9.-]+/g, "")
        );
        data.append("price", cleanPrice || 0);
      } else {
        data.append(key, formData[key] ?? "");
      }
    });

    // Append status ONLY ONCE
    data.append("status", formData.itemStatus ? 1 : 0);

    // Append Images
    images.forEach((imgObj) => {
      if (!imgObj.isExisting && imgObj.file) {
        data.append("itemImages", imgObj.file);
      }
    });
    const existingImagePaths = images
      .filter((img) => img.isExisting)
      .map((img) => img.originalPath);
    data.append("existingImages", JSON.stringify(existingImagePaths));

    // Append Drawings (itemDrawing)
    drawings.forEach((drawObj) => {
      if (!drawObj.isExisting && drawObj.file) {
        data.append("itemDrawing", drawObj.file);
      }
    });
    const existingDrawingPaths = drawings
      .filter((draw) => draw.isExisting)
      .map((draw) => draw.originalPath);
    data.append("existingDrawings", JSON.stringify(existingDrawingPaths));

    // API CALL
    let response;
    if (isEdit) {
      response = await item_create_edit(editId, data);
    } else {
      response = await Item_create(data);
    }

    // Check if response exists
    if (response?.data?.success === true) {
      // Success case - extract message from response
      const successMessage = response?.data?.data?.message || 
                            response?.data?.message || 
                            (isEdit ? "Item updated successfully!" : "Item created successfully!");
      
      setMessage({ message: successMessage, type: "success" });
      setSuccessModel(true);
      
      setTimeout(() => navigate("/item-master"), 2000);
    } else {
      // Error case - extract error message from response
      // Your response structure: {"success":false,"data":{"message":"Item already exists"},"statusCode":409}
      const errorMessage = response?.data?.data?.message || 
                          response?.data?.message || 
                          response?.message || 
                          "Operation failed.";
      
      setMessage({ message: errorMessage, type: "error" });
      setApiError(errorMessage);
      setErrorModel(true);
    }
  } catch (err) {
    console.error("Submit Error:", err);
    
    // Handle error from catch block
    let errorMessage = "Internal Server Error.";
    
    // Check if error response has the same structure
    if (err.response?.data?.data?.message) {
      errorMessage = err.response.data.data.message;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setMessage({ message: errorMessage, type: "error" });
    setApiError(errorMessage);
    setErrorModel(true);
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-[#0062a0]">
        Loading...
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50/30 p-4"
    >
      <div className="max-w-[1300px] mx-auto bg-white rounded-3xl shadow-xl p-5 md:p-10 border border-slate-100">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl cursor-pointer"
          >
            <ArrowLeft size={26} />
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight flex-1">
            {isEdit ? "Edit Item" : "Create Item"}
          </h1>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          {[
            { label: "Item Name", name: "itemName" },
            { label: "Part Number", name: "partNumber" },
            { label: "Item Description", name: "itemDescription" },
            { label: "Weight Per Unit in grams", name: "weightPerUnit" },
            { label: "Cost Per Unit in rupees", name: "costPerUnit" },
          ].map((field, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <ReUsableInput_Fields
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            </motion.div>
          ))}

          <div className="col-span-1 md:col-span-2 mt-4 md:mt-0">
            <ReUsableInput_Fields
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Manufacturing time in days"
              name="manufacturingTime"
              value={formData.manufacturingTime}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Product Category"
              name="itemCategory"
              type="select"
              value={formData.itemCategory}
              onChange={handleChange}
              options={itemType}
            />
          </motion.div>

          {[
            { label: "Item SBQ", name: "itemSBQ" },
            { label: "Outer Box Quantity", name: "outerBoxQuantity" },
            { label: "Item HSN Code", name: "itemHSNCode" },
            { label: "Warehouse Stock", name: "warehouseStock" },
            { label: "Warehouse Safety Stock", name: "warehouseSafetyStock" },
            { label: "Warehouse Stock ROL", name: "warehouseROL" },
          ].map((field, idx) => (
            <motion.div key={idx + 20} variants={itemVariants}>
              <ReUsableInput_Fields
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            </motion.div>
          ))}
        </div>

        {/* TOGGLES */}
        <div className="flex flex-wrap items-center gap-16 mt-8 px-2">
          <div className="flex items-center gap-4">
            <span className="text-[15px] font-medium text-slate-700">
              Item Status ?
            </span>
            <button
              onClick={() =>
                setFormData({ ...formData, itemStatus: !formData.itemStatus })
              }
              className={`w-11 h-5 rounded-full relative transition-colors ${formData.itemStatus ? "bg-[#0062a0]" : "bg-slate-300"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.itemStatus ? "left-6" : "left-1"}`}
              />
            </button>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-[15px] font-bold text-slate-800">
              Is Local ?
            </span>
            <div className="flex items-center gap-6">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.isLocal === opt ? "border-[#0062a0]" : "border-slate-300"}`}
                  >
                    {formData.isLocal === opt && (
                      <div className="w-2.5 h-2.5 bg-[#0062a0] rounded-full" />
                    )}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    name="isLocal"
                    checked={formData.isLocal === opt}
                    onChange={() => setFormData({ ...formData, isLocal: opt })}
                  />
                  <span className="text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* COMBINED UPLOAD SECTION */}
        <div className="mt-14 pt-10 border-t border-slate-100">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 px-2">
            Media & Drawings
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
            
            {/* LEFT: PRODUCT IMAGES */}
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 cursor-pointer group transition-colors h-48"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Upload className="text-[#0062a0] mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="text-lg font-bold text-slate-800 mb-1">
                  Product Images
                </h4>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  JPEG, PNG up to 50MB
                </p>
              </div>

              {/* IMAGE PREVIEWS */}
              <div className="flex flex-wrap gap-3 mt-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-1.5 group"
                  >
                    {img.isExisting ? (
                      <Image
                        src={img.preview}
                        alt="item"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <img
                        src={img.preview}
                        alt="item"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(i);
                      }}
                      className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: DRAWINGS & PDFs */}
            <div>
              <div
                onClick={() => drawingInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 cursor-pointer group transition-colors h-48"
              >
                <input
                  type="file"
                  ref={drawingInputRef}
                  hidden
                  multiple
                  accept="application/pdf, image/*"
                  onChange={handleDrawingChange}
                />
                <FileText className="text-[#0062a0] mb-3 group-hover:scale-110 transition-transform" size={28} />
                <h4 className="text-lg font-bold text-slate-800 mb-1">
                  import File
                </h4>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  PDF, JPEG, PNG up to 50MB
                </p>
              </div>

              {/* DRAWING PREVIEWS */}
              <div className="flex flex-col gap-2 mt-4">
                {drawings.map((doc, i) => (
                  <div key={i} className="relative flex items-center gap-3 bg-white border border-slate-200 py-2.5 px-4 rounded-xl group shadow-sm hover:shadow transition-all">
                    <FileText className="text-[#0062a0] flex-shrink-0" size={18} />
                    <span className="text-sm font-medium text-slate-700 truncate flex-1" title={doc.name}>
                      {doc.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeDrawing(i); }}
                      className="flex-shrink-0 bg-red-50 hover:bg-red-100 border border-red-100 rounded-full p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove File"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex items-center gap-5 justify-end mt-16 pt-6 border-t border-slate-100">
          <Button onClick={() => setConfirm(true)} variant="primary" className="px-10 py-3 shadow-md hover:shadow-lg">
            {isEdit ? "Update Item" : "Create Item"}
          </Button>
          <Button onClick={() => navigate(-1)} variant="secondary" className="px-8 py-3">
            Cancel
          </Button>
        </div>
      </div>

      {/* POPUPS */}
      <Confirmation_Popup
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleFinalSubmit}
        message={`Confirm ${isEdit ? "update" : "creation"}?`}
      />
      <Success_Popup
  isOpen={successModel}
  onClose={() => setSuccessModel(false)}
  message={message?.message || (isEdit ? "Item updated successfully!" : "Item created successfully!")}
/>

<ErrorMessage_Popup
  isOpen={errorModel}
  onClose={() => setErrorModel(false)}
  message={message?.message || apiError || "An error occurred"}
/>
    </motion.div>
  );
};

export default Item_Create;