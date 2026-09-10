import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Map as MapIcon,
  MapPin,
  Plus,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Phone Input Package
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Map Packages (Leaflet)
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Components
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Overall_Permissions from "../../Overall_Permissions/OverAll_Permissions/Overall_Permissions";

// API Services
import {
  customer_create,
  customer_create_edit,
  customer_get_Type,
  customer_post_Type,
  customer_view,
} from "../../../../service/Master_Services/Master_Services";

// --- CONSTANTS ---
const SMARTBIN_OPTIONS = [
  { label: "active", value: true },
  { label: "inactive", value: false },
];

// --- Fix for Leaflet Icons in React ---
const mapIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- Map Click Handler Component ---
const MapClickHandler = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={mapIcon} /> : null;
};

// ==========================================
// COMPONENT: Customer Details Section
// ==========================================
const CustomerDetails = ({
  formData,
  handleChange,
  handlePhoneChange,
  handleGeneratePassword,
}) => {
  const location = useLocation();
  const { mode } = location.state || {};
  const isEditMode = mode === "edit";
  return (
    <div className="mt-8 mb-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-slate-100"></div>
        <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
          Customer Login & Contact Details
        </span>
        <div className="h-[1px] flex-1 bg-slate-100"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <ReUsableInput_Fields
          label="Admin Email"
          name="adminEmail"
          type="email"
          value={formData.adminEmail}
          onChange={handleChange}
        />

        {/* Password Input with Generate Button */}
        {!isEditMode && (
          <div className="flex flex-col relative">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[#0062a0] text-[11px] font-bold hover:underline cursor-pointer bg-white px-1 flex items-center gap-1"
              >
                <Wand2 size={12} /> GENERATE
              </button>
            </div>
            <ReUsableInput_Fields
              label="Admin Password"
              name="adminPassword"
              type="text"
              value={formData.adminPassword}
              onChange={handleChange}
            />
            <span className="text-[10px] text-slate-400 mt-1">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
            </span>
          </div>
        )}

        {/* Position & Department */}
        <ReUsableInput_Fields
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="e.g. Operations Manager"
        />
        <ReUsableInput_Fields
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g. Logistics"
        />

        {/* Primary Phone Number with Country Flag */}
        <div className="flex flex-col gap-1 w-full relative z-10">
          <label className="text-[13px] font-semibold text-slate-700">
            Primary Number
          </label>
          <PhoneInput
            country={"in"}
            value={formData.primaryNumberFull}
            onChange={(value, country) =>
              handlePhoneChange("primaryNumber", value, country)
            }
            inputStyle={{
              width: "100%",
              height: "42px",
              borderRadius: "0.5rem",
              borderColor: "#e2e8f0",
            }}
            buttonStyle={{
              borderRadius: "0.5rem 0 0 0.5rem",
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          />
        </div>

        {/* Secondary Phone Number with Country Flag */}
        <div className="flex flex-col gap-1 w-full relative z-0">
          <label className="text-[13px] font-semibold text-slate-700">
            Secondary Number
          </label>
          <PhoneInput
            country={"in"}
            value={formData.secondaryNumberFull}
            onChange={(value, country) =>
              handlePhoneChange("secondaryNumber", value, country)
            }
            inputStyle={{
              width: "100%",
              height: "42px",
              borderRadius: "0.5rem",
              borderColor: "#e2e8f0",
            }}
            buttonStyle={{
              borderRadius: "0.5rem 0 0 0.5rem",
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// --- DEFAULT PERMISSIONS TEMPLATE ---
const defaultPermissionsList = [
  { module: "dashboard", create: true, view: true, edit: true, delete: true },
  {
    module: "customer_master",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  { module: "user_master", create: true, view: true, edit: true, delete: true },
  {
    module: "project_master",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  { module: "item_master", create: true, view: true, edit: true, delete: true },
  {
    module: "user_type_permission_master",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "warehouse_creation",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "warehouse_order_details",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "bin_configuration",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "bill_of_materials",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "forecast_viewer",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "smart_bin_dashboard",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
  {
    module: "overall_report",
    create: true,
    view: true,
    edit: true,
    delete: true,
  },
];

// ==========================================
// MAIN COMPONENT: Customer Master Create
// ==========================================
const Customer_Master_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, rowId } = location.state || {};
  const isEditMode = mode === "edit";

  // --- POPUP STATES ---
  const [successPopup, setSuccessPopup] = useState({
    open: false,
    message: "",
  });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    message: "",
  });

  const [customType, setCustomType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Modal States
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // Map States
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapPosition, setMapPosition] = useState([20.5937, 78.9629]); // Default: Center of India

  // --- 1. PERMISSIONS STATE ---
  const [permissions, setPermissions] = useState(defaultPermissionsList);

  // --- 2. FORM STATE ---
  const [formData, setFormData] = useState({
    companyName: "",
    customerName: "",
    customerType: "",
    ishavesmartbin: false,
    transitDays: "",
    gstNumber: "",
    adminEmail: "",
    adminPassword: "",
    position: "",
    department: "",
    primaryNumber: "",
    primaryNumberFull: "",
    secondaryNumber: "",
    secondaryNumberFull: "",
    shippingAddress1: "",
    shippingAddress2: "",
    billingAddress: "",
    localityMap: "",
  });

  // --- 3. FETCH INITIAL DATA ---
  useEffect(() => {
    const initializePage = async () => {
      await fetchTypes();

      if (isEditMode && rowId) {
        try {
          setFetchingData(true);
          const res = await customer_view(rowId);
          const data = res?.data?.data;

          if (data) {
            setFormData({
              companyName: data.companyName || "",
              customerName: data.customerName || "",
              // -> Updated here to map object ID or string directly
              customerType: data.customerType?._id || data.customerType || "",
              ishavesmartbin: Boolean(data.ishavesmartbin) || false,
              transitDays: data.transitDays || "",
              gstNumber: data.gstNumber || "",
              adminEmail: data.adminEmail || "",
              adminPassword: data.adminPassword || "",
              position: data.position || "",
              department: data.department || "",
              primaryNumber: data.mobileNumber?.[0] || "",
              primaryNumberFull: data.mobileNumber?.[0]
                ? `91${data.mobileNumber[0]}`
                : "",
              secondaryNumber: data.mobileNumber?.[1] || "",
              secondaryNumberFull: data.mobileNumber?.[1]
                ? `91${data.mobileNumber[1]}`
                : "",
              shippingAddress1: data.shippingAddress1 || "",
              shippingAddress2: data.shippingAddress2 || "",
              billingAddress: data.billingAddress || "",
              localityMap: data.geoLocation?.coordinates
                ? `${data.geoLocation.coordinates[0]}, ${data.geoLocation.coordinates[1]}`
                : "",
            });

            // Update Map Position if data exists
            if (data.geoLocation?.coordinates) {
              setMapPosition([
                data.geoLocation.coordinates[1],
                data.geoLocation.coordinates[0],
              ]); // Leaflet uses [Lat, Lng]
            }

            // -> Updated here to map permissions from data.superAdmin.permissions fallback to data.permissions
            const fetchedPermissions =
              data.superAdmin?.permissions || data.permissions;
            if (fetchedPermissions && fetchedPermissions.length > 0) {
              const updatedPermissions = defaultPermissionsList.map(
                (defaultPerm) => {
                  const fetchedPerm = fetchedPermissions.find(
                    (p) => p.module === defaultPerm.module,
                  );
                  return fetchedPerm
                    ? { ...defaultPerm, ...fetchedPerm }
                    : defaultPerm;
                },
              );
              setPermissions(updatedPermissions);
            }
          }
        } // In the edit mode data fetch (around line 200)
catch (err) {
          console.error("Error fetching customer details:", err);

          let errMsg = "Error fetching customer details";

          if (err.response?.data) {
            if (err.response.data.data?.message) {
              errMsg = err.response.data.data.message;
            } else if (err.response.data.message) {
              errMsg = err.response.data.message;
            } else if (err.response.data.msg) {
              errMsg = err.response.data.msg;
            }
          } else if (err.message) {
            errMsg = err.message;
          }

          setErrorPopup({ open: true, message: errMsg });
        } finally {
          setFetchingData(false);
        }
      }
    };

    initializePage();
  }, [isEditMode, rowId]);

// In fetchTypes function (around line 250)
  const fetchTypes = async () => {
    try {
      const res = await customer_get_Type();
      const rawData = res?.data?.data || [];
      const formattedData = rawData.map((item) => ({
        label: item.customerTypeName,
        value: item._id,
      }));
      setCustomType(formattedData);
    } catch (err) {
      console.error("Error fetching customer types:", err);

      let errMsg = "Failed to fetch customer types";

      if (err.response?.data) {
        if (err.response.data.data?.message) {
          errMsg = err.response.data.data.message;
        } else if (err.response.data.message) {
          errMsg = err.response.data.message;
        } else if (err.response.data.msg) {
          errMsg = err.response.data.msg;
        }
      } else if (err.message) {
        errMsg = err.message;
      }

      setErrorPopup({ open: true, message: errMsg });
    }
  };

  useEffect(() => {
    let timer;
    if (successPopup.open) {
      timer = setTimeout(() => {
        setSuccessPopup((prev) => ({ ...prev, open: false }));
        // Only navigate back if it was a final submit, not just fetching location
        if (
          successPopup.message.includes("successfully") &&
          !successPopup.message.includes("Location")
        ) {
          navigate(-1);
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [successPopup.open, navigate, successPopup.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "ishavesmartbin") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true" || value === true,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Dedicated handler for PhoneInput package
  const handlePhoneChange = (name, value, country) => {
    const dialCode = country.dialCode;
    let nationalNumber = value;
    if (value.startsWith(dialCode)) {
      nationalNumber = value.slice(dialCode.length);
    }
    // Remove any formatting characters (spaces, dashes) to get exact digits
    nationalNumber = nationalNumber.replace(/\D/g, "");

    setFormData((prev) => ({
      ...prev,
      [`${name}Full`]: value,
      [name]: nationalNumber,
    }));
  };

  // Password Generator Handler
  const handleGeneratePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@$!%*?&";
    const all = upper + lower + numbers + special;

    let pass = "";
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += lower[Math.floor(Math.random() * lower.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += special[Math.floor(Math.random() * special.length)];

    for (let i = 0; i < 6; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    pass = pass
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
    setFormData((prev) => ({ ...prev, adminPassword: pass }));
  };

  // Get Geolocation Coordinates Handler (Browser Native)
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setFormData((prev) => ({ ...prev, localityMap: `${lng}, ${lat}` }));
          setMapPosition([position.coords.latitude, position.coords.longitude]);
          setSuccessPopup({
            open: true,
            message: "Location fetched successfully!",
          });
        },
        (error) => {
          let errorMsg = "Please allow location access in your browser.";
          if (error.code === error.PERMISSION_DENIED)
            errorMsg = "Location permission denied.";
          setErrorPopup({ open: true, message: errorMsg });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setErrorPopup({
        open: true,
        message: "Geolocation is not supported by your browser.",
      });
    }
  };

  const handleConfirmMapLocation = () => {
    if (mapPosition) {
      // Format: Lng, Lat
      setFormData((prev) => ({
        ...prev,
        localityMap: `${mapPosition[1].toFixed(6)}, ${mapPosition[0].toFixed(6)}`,
      }));
    }
    setIsMapModalOpen(false);
  };

  // In handleAddCustomerType function
  const handleAddCustomerType = async () => {
    if (!newTypeName.trim()) return;
    try {
      setIsAddingType(true);
      const res = await customer_post_Type({ customerTypeName: newTypeName });

    // Get message from API response
    const successMessage = res?.data?.message || 
        res?.data?.msg ||
        "Customer type added successfully!";

      setSuccessPopup({ open: true, message: successMessage });
      setNewTypeName("");
      setIsTypeModalOpen(false);
      await fetchTypes();
    } catch (err) {
      console.error("Error adding customer type:", err);

      let errMsg = "Error adding customer type";

      if (err.response?.data) {
        if (err.response.data.data?.message) {
          errMsg = err.response.data.data.message;
        } else if (err.response.data.message) {
          errMsg = err.response.data.message;
        } else if (err.response.data.msg) {
          errMsg = err.response.data.msg;
        }
      } else if (err.message) {
        errMsg = err.message;
      }

      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setIsAddingType(false);
    }
  };

  // Validation rules before Submitting
  const triggerSubmitConfirm = () => {
    if (!formData.companyName || !formData.customerName) {
      setErrorPopup({
        open: true,
        message: "Please fill in the required fields.",
      });
      return;
    }

    if (formData.adminPassword) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.adminPassword)) {
        setErrorPopup({
          open: true,
          message:
            "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.",
        });
        return;
      }
    }

    if (formData.primaryNumber && formData.primaryNumber.length > 10) {
      setErrorPopup({
        open: true,
        message: "Primary Number cannot exceed 10 digits.",
      });
      return;
    }

    if (formData.secondaryNumber && formData.secondaryNumber.length > 10) {
      setErrorPopup({
        open: true,
        message: "Secondary Number cannot exceed 10 digits.",
      });
      return;
    }

    setConfirmPopup({
      open: true,
      message: `Are you sure you want to ${isEditMode ? "update" : "create"} this customer?`,
    });
  };

  // --- 4. FINAL SUBMISSION ---
  // --- 4. FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    setConfirmPopup({ ...confirmPopup, open: false });
    try {
      setLoading(true);

      const coords = formData.localityMap
        .split(",")
        .map((num) => parseFloat(num.trim()))
        .filter((num) => !isNaN(num));

      const mobileNumberArray = [];
      if (formData.primaryNumber && formData.primaryNumber.trim() !== "") {
        mobileNumberArray.push(formData.primaryNumber);
      }
      if (formData.secondaryNumber && formData.secondaryNumber.trim() !== "") {
        mobileNumberArray.push(formData.secondaryNumber);
      }

      const finalPayload = {
        companyName: formData.companyName,
        customerName: formData.customerName,
        transitDays: parseInt(formData.transitDays, 10) || 0,
        gstNumber: formData.gstNumber,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        position: formData.position,
        department: formData.department,
        mobileNumber: mobileNumberArray,
        shippingAddress1: formData.shippingAddress1,
        shippingAddress2: formData.shippingAddress2,
        billingAddress: formData.billingAddress,
        customerType: formData.customerType,
        ishavesmartbin: formData.ishavesmartbin,
        geoLocation: {
          type: "Point",
        coordinates: coords.length === 2 ? coords : [80.2707, 13.0827], // Default coordinates if empty
        },
        permissions: permissions,
      };

      let res;
      if (isEditMode) {
        res = await customer_create_edit(rowId, finalPayload);
      } else {
        res = await customer_create(finalPayload);
      }

    // Get message from API response
    const successMessage = res?.data?.message || 
        res?.data?.msg ||
                           (isEditMode ? "Customer updated successfully!" : "Customer created successfully!");

      setSuccessPopup({
        open: true,
        message: successMessage,
      });
    
    } catch (error) {
      console.error("Submission error:", error);

    // Extract error message from the 409 response structure
      let errMsg = "An unexpected error occurred";

      if (error.response) {
      // The request was made and the server responded with a status code
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);

      // Handle the specific error structure: { success: false, data: { message: "..." }, statusCode: 409 }
        if (error.response.data) {
        // Check if data has the structure with success and data.message
          if (error.response.data.data && error.response.data.data.message) {
            errMsg = error.response.data.data.message;
        } 
        // Check if data directly has message property
        else if (error.response.data.message) {
            errMsg = error.response.data.message;
        }
        // Check if data has msg property
        else if (error.response.data.msg) {
            errMsg = error.response.data.msg;
        }
        // If it's a string, use it directly
        else if (typeof error.response.data === 'string') {
            errMsg = error.response.data;
          }
        }
      } else if (error.request) {
      // The request was made but no response was received
        errMsg = "No response from server. Please check your connection.";
      } else {
      // Something happened in setting up the request
        errMsg = error.message || "Failed to process request";
      }

    // Add status code information if available and relevant
      if (error.response?.status === 409) {
        errMsg = errMsg || "Duplicate entry: Company name already exists";
      }

      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#0062a0]" size={40} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50/30"
    >
      <div className="max-w-[1300px] mx-auto bg-white rounded-3xl shadow-xl p-5 md:p-10 border border-slate-100">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            {isEditMode ? "Edit Customer" : "Create Customer"}
          </h1>
        </div>

        {/* Main Form Grid */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Company Details
            </span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
            <ReUsableInput_Fields
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
            />
            <ReUsableInput_Fields
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTypeModalOpen(true)}
                className="absolute right-0 top-0 z-20 text-[#0062a0] text-[11px] font-bold hover:underline cursor-pointer bg-white px-1"
              >
                <Plus size={12} className="inline mb-1" /> ADD TYPE
              </button>
              <ReUsableInput_Fields
                label="Industry Type"
                name="customerType"
                type="select"
                options={customType}
                value={formData.customerType}
                onChange={handleChange}
              />
            </div>

            <ReUsableInput_Fields
              label="Has SmartBin"
              name="ishavesmartbin"
              type="select"
              options={SMARTBIN_OPTIONS}
              value={formData.ishavesmartbin}
              onChange={handleChange}
            />

            <ReUsableInput_Fields
              label="Transit Days"
              name="transitDays"
              type="number"
              value={formData.transitDays}
              onChange={handleChange}
            />
            <ReUsableInput_Fields
              label="Gst Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
            />

            <div className="relative">
              <div className="absolute right-0 top-0 z-20 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-[#0062a0] text-[11px] font-bold hover:underline cursor-pointer bg-white px-1 flex items-center gap-1"
                >
                  <MapPin size={12} /> CURRENT
                </button>
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-[#0062a0] text-[11px] font-bold hover:underline cursor-pointer bg-white px-1 flex items-center gap-1"
                >
                  <MapIcon size={12} /> MAP
                </button>
              </div>
              <ReUsableInput_Fields
                label="Location (Lng, Lat)"
                type="text"
                name="localityMap"
                placeholder="e.g. 80.2707, 13.0827"
                value={formData.localityMap}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Render Extracted Customer Details Component */}
        <CustomerDetails
          formData={formData}
          handleChange={handleChange}
          handlePhoneChange={handlePhoneChange}
          handleGeneratePassword={handleGeneratePassword}
        />

        {/* Address Section */}
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Address Information
            </span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>
          <div className="space-y-2">
            <ReUsableInput_Fields
              label="Shipping Address 1"
              name="shippingAddress1"
              value={formData.shippingAddress1}
              onChange={handleChange}
            />
            <ReUsableInput_Fields
              label="Shipping Address 2"
              name="shippingAddress2"
              value={formData.shippingAddress2}
              onChange={handleChange}
            />
            <ReUsableInput_Fields
              label="Billing Address"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Permissions Component */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Security Config
            </span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <Overall_Permissions
            permissions={permissions}
            setPermissions={setPermissions}
          />

          <div className="flex items-center gap-4 justify-end mt-10">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={triggerSubmitConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEditMode ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Map Interactive Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  Select Location
                </h3>
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="text-slate-500 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Click anywhere on the map to drop a pin and capture coordinates.
              </p>

              <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200">
                <MapContainer
                  center={mapPosition}
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <MapClickHandler
                    position={mapPosition}
                    setPosition={setMapPosition}
                  />
                </MapContainer>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm font-semibold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
                  Selected:{" "}
                  <span className="text-[#0062a0]">
                    {mapPosition
                      ? `${mapPosition[1].toFixed(6)}, ${mapPosition[0].toFixed(6)}`
                      : "None"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setIsMapModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleConfirmMapLocation}>
                    Confirm Location
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Type Modal */}
      <AnimatePresence>
        {isTypeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-white rounded-3xl p-8"
            >
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-bold">Add Customer Type</h3>
                <button onClick={() => setIsTypeModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <ReUsableInput_Fields
                label="Type Name"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
              <div className="flex gap-3 justify-end mt-8">
                <Button
                  variant="secondary"
                  onClick={() => setIsTypeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddCustomerType}
                  disabled={isAddingType}
                >
                  {isAddingType ? "Saving..." : "Save"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Popups */}
      <Confirmation_Popup
        isOpen={confirmPopup.open}
        onClose={() => setConfirmPopup({ ...confirmPopup, open: false })}
        onConfirm={handleFinalSubmit}
        message={confirmPopup.message}
      />

      <Success_Popup
        isOpen={successPopup.open}
        onClose={() => {
          setSuccessPopup({ ...successPopup, open: false });
        }}
        message={successPopup.message}
      />

      <ErrorMessage_Popup
        isOpen={errorPopup.open}
        onClose={() => setErrorPopup({ ...errorPopup, open: false })}
        message={errorPopup.message}
      />
    </motion.div>
  );
};

export default Customer_Master_Create;
