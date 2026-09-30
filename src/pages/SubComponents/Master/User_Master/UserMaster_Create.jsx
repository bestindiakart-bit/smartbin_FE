import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Wand2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Phone Input Package
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Components
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Overall_Permissions from "../../Overall_Permissions/OverAll_Permissions/Overall_Permissions";

// API Services
import {
  customer_id,
  user_create,
  user_create_edit,
  user_master_getID,
  user_type_get,
  user_type_post,
} from "../../../../service/Master_Services/Master_Services";

// Default template in case a user type has no permissions set
const defaultPermissionsList = [
  {
    module: "dashboard",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "customer_master",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "user_master",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "project_master",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "item_master",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "user_type_permission_master",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "warehouse_creation",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "warehouse_order_details",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "bin_configuration",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "bill_of_materials",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "forecast_viewer",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "smart_bin_dashboard",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
  {
    module: "overall_report",
    create: false,
    view: false,
    edit: false,
    delete: false,
  },
];

const UserMaster_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, rowId } = location.state || {};
  const isEditMode = mode === "edit";

  // --- POPUP STATES ---
  const [successPopup, setSuccessPopup] = useState({
    open: false,
    message: "",
    shouldNavigate: false,
  });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    message: "",
  });

  // --- MODAL STATES ---
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // --- UI STATES ---
  const [userTypes, setUserTypes] = useState([
    { label: "Loading...", value: "", permissions: [] },
  ]);
  const [customerOptions, setCustomerOptions] = useState([
    { label: "Loading...", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Helper to extract nested backend messages
  const getErrorMessage = (err) => {
    return (
      err.response?.data?.data?.message ||
      err.response?.data?.message ||
      err.message ||
      "Operation failed."
    );
  };

  // --- PERMISSIONS STATE ---
  const [permissions, setPermissions] = useState(
    JSON.parse(JSON.stringify(defaultPermissionsList)),
  );

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    userName: "",
    loginEmail: "",
    password: "",
    userType: "",
    customerId: "",
    position: "",
    department: "",
    mobileNumber: "",
    mobileNumberFull: "", // State for react-phone-input-2
  });

  // --- 1. FETCH CUSTOMERS ---
  const fetchcustomerID = useCallback(async () => {
    try {
      const res = await customer_id();
      const rawData = res?.data?.data;
      const customerArray = Array.isArray(rawData)
        ? rawData
        : rawData
          ? [rawData]
          : [];

      const formattedData = customerArray.map((item) => ({
        label: item.companyName || item.customerName || item.customerId,
        value: item._id,
      }));

      setCustomerOptions(formattedData);
      return formattedData;
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomerOptions([{ label: "Error loading customers", value: "" }]);
      return [];
    }
  }, []);

  // --- 2. FETCH USER TYPES (Including Permissions) ---
  const fetchUserTypes = useCallback(async () => {
    try {
      const res = await user_type_get();
      const rawData = res?.data?.data || [];
      const formattedData = rawData.map((item) => ({
        label: item.userTypeName,
        value: item._id,
        permissions: item.permissions || [], // Capture the template permissions here
      }));

      setUserTypes(formattedData);
      return formattedData;
    } catch (err) {
      console.error("Failed to fetch user types:", err);
      setUserTypes([
        { label: "Error loading types", value: "", permissions: [] },
      ]);
      return [];
    }
  }, []);

  // --- FETCH INITIAL DATA ON MOUNT ---
  useEffect(() => {
    const initializePage = async () => {
      setFetchingData(true);
      try {
        const [fetchedTypes, fetchedCustomers] = await Promise.all([
          fetchUserTypes(),
          fetchcustomerID(),
        ]);

        let initialData = {};
        let initialPerms = defaultPermissionsList;

        // Auto-select if there is exactly one user type and extract its base permissions
        if (fetchedTypes?.length === 1) {
          initialData.userType = fetchedTypes[0].value;
          if (fetchedTypes[0].permissions?.length > 0) {
            initialPerms = fetchedTypes[0].permissions;
          }
        }

        // Auto-select if there is exactly one customer
        if (fetchedCustomers?.length === 1) {
          initialData.customerId = fetchedCustomers[0].value;
        }

        // If in edit mode, fetch user data and override permissions with user's saved permissions
        if (isEditMode && rowId) {
          const res = await user_master_getID(rowId);
          const data = res?.data?.data?.users || res?.data?.data;

          if (data) {
            initialData = {
              ...initialData,
              userName: data.userName || "",
              loginEmail: data.loginEmail || "",
              password: "",
              userType:
                data.userTypeId?._id ||
                data.userTypeId ||
                initialData.userType ||
                "",
              customerId:
                data.customerId?._id ||
                data.customerId ||
                initialData.customerId ||
                "",
              position: data.position || "",
              department: data.department || "",
              mobileNumber: data.mobile || "",
              mobileNumberFull: data.mobile ? `91${data.mobile}` : "",
            };

            // Use explicitly saved user permissions if available
            if (data.permissions?.length > 0) {
              initialPerms = data.permissions;
            }
          }
        }

        setFormData((prev) => ({ ...prev, ...initialData }));
        // Deep clone the array to prevent accidental mutations across components
        setPermissions(JSON.parse(JSON.stringify(initialPerms)));
      } catch (err) {
        setErrorPopup({ open: true, message: getErrorMessage(err) });
      } finally {
        setFetchingData(false);
      }
    };
    initializePage();
  }, [isEditMode, rowId, fetchUserTypes, fetchcustomerID]);

  // Success Redirect Logic
  useEffect(() => {
    let timer;
    if (successPopup.open && successPopup.shouldNavigate) {
      timer = setTimeout(() => {
        setSuccessPopup((prev) => ({ ...prev, open: false }));
        navigate(-1);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [successPopup.open, successPopup.shouldNavigate, navigate]);

  const handleAddUserType = async () => {
    if (!newTypeName.trim()) return;
    try {
      setIsAddingType(true);
      const res = await user_type_post({ userTypeName: newTypeName });
      if (res.data.success) {
        const msg =
          res.data?.data?.message ||
          res.data?.message ||
          "User Type added successfully";
        setNewTypeName("");
        setIsTypeModalOpen(false);
        const fetched = await fetchUserTypes();

        // If there's exactly one after adding, auto-select it and populate permissions
        if (fetched.length === 1) {
          setFormData((prev) => ({ ...prev, userType: fetched[0].value }));
          if (fetched[0].permissions?.length > 0) {
            setPermissions(JSON.parse(JSON.stringify(fetched[0].permissions)));
          }
        }
        setSuccessPopup({ open: true, message: msg, shouldNavigate: false });
      }
    } catch (err) {
      setErrorPopup({ open: true, message: getErrorMessage(err) });
    } finally {
      setIsAddingType(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If the User Type changes dynamically, map its permissions into the grid
    if (name === "userType") {
      const selectedType = userTypes.find((type) => type.value === value);
      if (selectedType && selectedType.permissions?.length > 0) {
        // Deep copy the template so modifications only affect this user
        setPermissions(JSON.parse(JSON.stringify(selectedType.permissions)));
      } else {
        // Reset to default empty template if no permissions found
        setPermissions(JSON.parse(JSON.stringify(defaultPermissionsList)));
      }
    }
  };

  // Phone Change Handler
  const handlePhoneChange = (value, country) => {
    const dialCode = country.dialCode;
    let nationalNumber = value;
    if (value.startsWith(dialCode)) {
      nationalNumber = value.slice(dialCode.length);
    }
    nationalNumber = nationalNumber.replace(/\D/g, ""); // Extract exact numbers

    setFormData((prev) => ({
      ...prev,
      mobileNumberFull: value,
      mobileNumber: nationalNumber,
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
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  // Pre-Submission Validations
  const triggerSubmitConfirm = () => {
    if (
      !formData.userName ||
      !formData.loginEmail ||
      !formData.userType ||
      !formData.customerId
    ) {
      setErrorPopup({
        open: true,
        message:
          "Required fields (Name, Email, Type, Linked Customer) are missing.",
      });
      return;
    }

    // Password Validation
    if (formData.password) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setErrorPopup({
          open: true,
          message:
            "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.",
        });
        return;
      }
    }

    // Mobile validation
    if (formData.mobileNumber && formData.mobileNumber.length > 10) {
      setErrorPopup({
        open: true,
        message: "Mobile Number cannot exceed 10 digits.",
      });
      return;
    }

    setConfirmPopup({
      open: true,
      message: `Are you sure you want to ${isEditMode ? "update" : "create"} this user?`,
    });
  };

  // --- FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    setConfirmPopup((prev) => ({ ...prev, open: false }));
    try {
      setLoading(true);

      const finalPayload = {
        userName: formData.userName,
        loginEmail: formData.loginEmail,
        userTypeId: formData.userType,
        customerId: formData.customerId,
        position: formData.position,
        department: formData.department,
        mobile: formData.mobileNumber,
        permissions: permissions, // Saves the customized permissions layout
      };

      if (formData.password) {
        finalPayload.loginPassword = formData.password;
      }

      let res;
      if (isEditMode) {
        res = await user_create_edit(rowId, finalPayload);
      } else {
        if (!formData.password) {
          setErrorPopup({
            open: true,
            message: "Password is required for new users.",
          });
          setLoading(false);
          return;
        }
        res = await user_create(finalPayload);
      }

      if (res?.data?.success) {
        const msg =
          res.data?.data?.message ||
          res.data?.message ||
          `User ${isEditMode ? "updated" : "created"} successfully!`;
        setSuccessPopup({ open: true, message: msg, shouldNavigate: true });
      }
    } catch (error) {
      setErrorPopup({ open: true, message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
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
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50/30"
    >
      <div className="max-w-[1300px] mx-auto bg-white rounded-3xl shadow-xl p-5 md:p-10 border border-slate-100">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            {isEditMode ? "Edit User" : "Create User"}
          </h1>
        </motion.div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          <motion.div variants={itemVariants}>
            {customerOptions.length === 1 && customerOptions[0].value !== "" ? (
              <ReUsableInput_Fields
                label="Linked Customer"
                value={customerOptions[0].label}
                disabled
                onChange={() => {}}
              />
            ) : (
              <ReUsableInput_Fields
                label="Select Customer"
                name="customerId"
                type="select"
                options={customerOptions}
                value={formData.customerId}
                onChange={handleChange}
                required
              />
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            {/* Only show ADD TYPE and Select if we have more than 1 option */}
            {userTypes.length === 1 && userTypes[0].value !== "" ? (
              <ReUsableInput_Fields
                label="User Type"
                value={userTypes[0].label}
                disabled
                onChange={() => {}}
              />
            ) : (
              <>
                <ReUsableInput_Fields
                  label="User Type"
                  name="userType"
                  type="select"
                  options={userTypes}
                  value={formData.userType}
                  onChange={handleChange}
                  required
                />
              </>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="User Name"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Login Email"
              name="loginEmail"
              type="email"
              value={formData.loginEmail}
              onChange={handleChange}
              required
            />
          </motion.div>

          {/* Password Input with Generate Button */}
          {!isEditMode && (
            <motion.div
              variants={itemVariants}
              className="flex flex-col relative mt-2"
            >
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
                label="Password"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter or generate password"
              />
              <span className="text-[10px] text-slate-400 mt-1">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
              </span>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className={!isEditMode ? "mt-2" : ""}
          >
            <ReUsableInput_Fields
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </motion.div>

          {/* Primary Phone Number with Country Flag */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-1 w-full relative z-10"
          >
            <label className="text-[13px] font-semibold text-slate-700">
              Mobile Number
            </label>
            <PhoneInput
              country={"in"}
              value={formData.mobileNumberFull}
              onChange={(value, country) => handlePhoneChange(value, country)}
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
          </motion.div>
        </div>

        {/* Permissions Table */}
        <motion.div variants={itemVariants} className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Security Config
            </span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>

          <Overall_Permissions
            permissions={permissions}
            setPermissions={setPermissions}
          />

          <div className="flex items-center gap-4 justify-end mt-10 pb-4">
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
        </motion.div>
      </div>

      {/* --- ADD USER TYPE MODAL --- */}
      <AnimatePresence>
        {isTypeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add User Type</h3>
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
                  onClick={handleAddUserType}
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
        onClose={() => setConfirmPopup((prev) => ({ ...prev, open: false }))}
        onConfirm={handleFinalSubmit}
        message={confirmPopup.message}
      />

      <Success_Popup
        isOpen={successPopup.open}
        onClose={() => setSuccessPopup((prev) => ({ ...prev, open: false }))}
        message={successPopup.message}
      />

      <ErrorMessage_Popup
        isOpen={errorPopup.open}
        onClose={() => setErrorPopup((prev) => ({ ...prev, open: false }))}
        message={errorPopup.message}
      />
    </motion.div>
  );
};

export default UserMaster_Create;
