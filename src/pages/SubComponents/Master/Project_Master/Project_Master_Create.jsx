import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Components
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";

// API Services
import {
  customer_id,
  get_customer_byUser,
  project_create,
  project_create_edit,
  project_master_getID,
} from "../../../../service/Master_Services/Master_Services";

const Project_Master_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, rowId } = location.state || {};
  const isEditMode = mode === "edit";

  const [successPopup, setSuccessPopup] = useState({
    open: false,
    message: "",
  });
  const [errorPopup, setErrorPopup] = useState({ open: false, message: "" });
  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    message: "",
  });

  const [userOptions, setUserOptions] = useState([
    { label: "Select User", value: "" },
  ]);
  const [customerOptions, setCustomerOptions] = useState([
    { label: "Select Customer", value: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // --- 1. FORM STATE ---
  const [formData, setFormData] = useState({
    customerId: "",
    projectName: "",
    slug: "",
    projectHead: "",
    projectManager: "",
    startDate: "",
    endDate: "",
    projectDescription: "",
  });

  useEffect(() => {
    if (successPopup.open) {
      const timer = setTimeout(() => {
        setSuccessPopup({ open: false, message: "" });
        navigate(-1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successPopup.open, navigate]);

  // --- 2. FETCH CUSTOMERS (Always needed) ---
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerRes = await customer_id();
        let customersData = customerRes?.data?.data;

        // Normalize to array
        let customers = [];
        if (Array.isArray(customersData)) {
          customers = customersData;
        } else if (customersData && typeof customersData === "object") {
          customers = [customersData];
        }

        // Build customer options (with placeholder)
        const newCustomerOptions = [
          { label: "Select Customer", value: "" },
          ...customers.map((c) => ({
            label: c.companyName || c.name || "Unknown",
            value: c._id,
          })),
        ];
        setCustomerOptions(newCustomerOptions);

        // If in create mode and exactly one customer, auto-select it
        if (!isEditMode && customers.length === 1) {
          const singleCustomer = customers[0];
          setFormData((prev) => ({
            ...prev,
            customerId: singleCustomer._id,
          }));
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setErrorPopup({ open: true, message: "Failed to load customers" });
      }
    };

    fetchCustomers();
  }, [isEditMode]);

  // --- 3. FETCH PROJECT DATA FOR EDIT MODE ---
  useEffect(() => {
    const fetchProjectForEdit = async () => {
      if (!isEditMode || !rowId) return;

      setFetchingData(true);
      try {
        const res = await project_master_getID(rowId);
        console.log("Edit project data:", res);

        const projectData = res?.data?.data;
        if (!projectData) {
          throw new Error("No project data found");
        }

        // Extract IDs and names
        const customerId =
          projectData.customerId?._id || projectData.customerId || "";
        const projectHeadId =
          projectData.projectHead?._id || projectData.projectHead || "";
        const projectManagerId =
          projectData.projectManager?._id || projectData.projectManager || "";

        const projectHeadName =
          projectData.projectHead?.userName ||
          projectData.projectHead?.name ||
          "";
        const projectManagerName =
          projectData.projectManager?.userName ||
          projectData.projectManager?.name ||
          "";

        // Set form data first
        setFormData({
          customerId: customerId,
          projectName: projectData.projectName || "",
          slug: projectData.slug || "",
          projectHead: projectHeadId,
          projectManager: projectManagerId,
          startDate: projectData.startDate
            ? projectData.startDate.split("T")[0]
            : "",
          endDate: projectData.endDate ? projectData.endDate.split("T")[0] : "",
          projectDescription: projectData.projectDescription || "",
        });

        // If we have a customer ID, fetch users for that customer
        if (customerId) {
          setFetchingUsers(true);
          try {
            const userRes = await get_customer_byUser(customerId);
            console.log("Users for customer:", userRes);

            const users =
              userRes?.data?.data?.users ||
              userRes?.data?.data ||
              userRes?.data?.records ||
              [];

            // Build user options
            const newUserOptions = [{ label: "Select User", value: "" }];

            users.forEach((u) => {
              newUserOptions.push({
                label: u.userName || u.name || "Unknown",
                value: u._id,
              });
            });

            // Ensure selected project head is in options
            if (
              projectHeadId &&
              !newUserOptions.some((opt) => opt.value === projectHeadId)
            ) {
              newUserOptions.push({
                label: projectHeadName || `${projectHeadId}`,
                value: projectHeadId,
              });
            }

            // Ensure selected project manager is in options
            if (
              projectManagerId &&
              !newUserOptions.some((opt) => opt.value === projectManagerId)
            ) {
              newUserOptions.push({
                label: projectManagerName || `${projectManagerId}`,
                value: projectManagerId,
              });
            }

            setUserOptions(newUserOptions);
          } catch (err) {
            console.error("Failed to fetch users for edit mode", err);

            // Even if user fetch fails, create basic options with selected values
            const basicOptions = [{ label: "Select User", value: "" }];

            if (projectHeadId) {
              basicOptions.push({
                label: projectHeadName || `User (${projectHeadId})`,
                value: projectHeadId,
              });
            }

            if (projectManagerId && projectManagerId !== projectHeadId) {
              basicOptions.push({
                label: projectManagerName || `User (${projectManagerId})`,
                value: projectManagerId,
              });
            }

            setUserOptions(basicOptions);
          } finally {
            setFetchingUsers(false);
          }
        }
      } catch (err) {
        console.error("Error fetching project for edit:", err);
        setErrorPopup({
          open: true,
          message: err.message || "Failed to load project data for editing",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchProjectForEdit();
  }, [isEditMode, rowId]);

  // --- 4. DEPENDENT API CALL (Fetch Users when Customer changes) ---
  useEffect(() => {
    const fetchUsersForCustomer = async () => {
      // Skip if in edit mode and we already have user data (prevents overwriting)
      if (isEditMode && formData.customerId && userOptions.length > 1) {
        return;
      }

      if (!formData.customerId) {
        setUserOptions([{ label: "Select Customer First", value: "" }]);
        return;
      }

      setFetchingUsers(true);
      try {
        const userRes = await get_customer_byUser(formData.customerId);

        // Safely extract users
        const users =
          userRes?.data?.data?.users ||
          userRes?.data?.data ||
          userRes?.data?.records ||
          [];

        const newOptions = [{ label: "Select User", value: "" }];

        if (users.length > 0) {
          users.forEach((u) => {
            newOptions.push({
              label: u.userName || u.name || "Unknown",
              value: u._id,
            });
          });
        } else {
          newOptions.push({ label: "No users found", value: "" });
        }

        setUserOptions(newOptions);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUserOptions([{ label: "Error loading users", value: "" }]);
      } finally {
        setFetchingUsers(false);
      }
    };

    // Only fetch if we have a customer ID and not in edit mode with existing data
    if (formData.customerId && !(isEditMode && userOptions.length > 1)) {
      fetchUsersForCustomer();
    }
  }, [formData.customerId, isEditMode, userOptions.length]);

  // --- 5. HANDLE INPUT CHANGES ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customerId") {
      setFormData((prev) => ({
        ...prev,
        customerId: value,
        projectHead: "", // Reset dependent fields
        projectManager: "",
      }));
      // Reset user options when customer changes
      setUserOptions([{ label: "Select User", value: "" }]);
    } else if (name === "projectName") {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");

      setFormData((prev) => ({
        ...prev,
        projectName: value,
        slug: generatedSlug,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // --- 6. FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    setConfirmPopup({ ...confirmPopup, open: false });
    try {
      setLoading(true);

      const finalPayload = {
        customerId: formData.customerId,
        projectName: formData.projectName,
        slug: formData.slug,
        projectHead: formData.projectHead,
        projectManager: formData.projectManager,
        startDate: formData.startDate,
        endDate: formData.endDate,
        projectDescription: formData.projectDescription,
      };

      console.log("Submitting payload:", finalPayload);

      let res;
      if (isEditMode) {
        res = await project_create_edit(rowId, finalPayload);
      } else {
        res = await project_create(finalPayload);
      }

      if (res?.data?.success) {
        setSuccessPopup({
          open: true,
          message:
            res?.data?.message ||
            `Project ${isEditMode ? "updated" : "created"} successfully!`,
        });
      } else {
        throw new Error(res?.data?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errMsg =
        error.response?.data?.data?.message ||
        error.response?.data?.message ||
        error.message ||
        "Operation Failed";
      setErrorPopup({ open: true, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (fetchingData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#0062a0] mx-auto" size={40} />
          <p className="mt-4 text-slate-600">Loading project data...</p>
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50/30 p-4"
    >
      <div className="max-w-[1300px] mx-auto bg-white rounded-[24px] shadow-xl p-5 md:p-10 border border-slate-100">
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl cursor-pointer transition-all active:scale-90"
            disabled={loading}
          >
            <ArrowLeft size={26} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            {isEditMode ? "Edit Project" : "Create Project"}
          </h1>
        </header>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Customer Name"
              name="customerId"
              type="select"
              options={customerOptions}
              value={formData.customerId}
              onChange={handleChange}
              required
              disabled={isEditMode} // Disable customer change in edit mode
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Project Name"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </motion.div>

          {/* PROJECT HEAD DROPDOWN */}
          <motion.div variants={itemVariants} className="relative">
            <ReUsableInput_Fields
              label="Project Head"
              name="projectHead"
              type="select"
              options={userOptions}
              value={formData.projectHead}
              onChange={handleChange}
              disabled={!formData.customerId || fetchingUsers}
              required
            />
            {fetchingUsers && (
              <Loader2
                className="absolute right-8 top-[38px] animate-spin text-slate-400"
                size={16}
              />
            )}
          </motion.div>

          {/* PROJECT MANAGER DROPDOWN */}
          <motion.div variants={itemVariants} className="relative">
            <ReUsableInput_Fields
              label="Project Manager"
              name="projectManager"
              type="select"
              options={userOptions}
              value={formData.projectManager}
              onChange={handleChange}
              disabled={!formData.customerId || fetchingUsers}
              required
            />
            {fetchingUsers && (
              <Loader2
                className="absolute right-8 top-[38px] animate-spin text-slate-400"
                size={16}
              />
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ReUsableInput_Fields
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-1 md:col-span-2"
          >
            <ReUsableInput_Fields
              label="Description"
              name="projectDescription"
              type="textarea"
              value={formData.projectDescription}
              onChange={handleChange}
              rows={4}
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-5 justify-end mt-12">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              setConfirmPopup({
                open: true,
                message: `Are you sure you want to ${isEditMode ? "update" : "create"} this project?`,
              })
            }
            variant="primary"
            disabled={
              loading ||
              !formData.customerId ||
              !formData.projectName ||
              !formData.projectHead ||
              !formData.projectManager
            }
            className="px-10"
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
          navigate(-1);
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

export default Project_Master_Create;
