import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Existing project components
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../../../component/button/Buttons";

// API Services
import {
  bin_dashboard_create,
  bin_dashboard_Edit,
  bin_dashboard_getById,
  bin_ProjectName_get,
  customer_id,
  get_warehouse_byCustomer,
  get_items_byWarehouse,
} from "../../../../service/Bin_Services/Bin_Services";

const SmartbinBadge = ({ value }) => {
  const isActive =
    value === true ||
    value === 1 ||
    value === "true" ||
    value === "1";

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  );
};

/* =========================================================
   HELPER
========================================================= */

const parseWeightStr = (weightStr) => {
  if (!weightStr) {
    return {
      value: "",
      unit: "kg",
    };
  }

  const str = String(weightStr).trim();

  const match = str.match(/^([\d.]+)\s*(kg|gm)$/i);

  if (match) {
    return {
      value: match[1],
      unit: match[2].toLowerCase(),
    };
  }

  return {
    value: str,
    unit: "kg",
  };
};

/* =========================================================
   GET ID HELPERS
========================================================= */

const getCustomerId = (customer) => {
  if (!customer) return "";

  if (typeof customer === "string") {
    return customer;
  }

  return customer._id || customer.customerId || "";
};

const getProjectId = (project) => {
  if (!project) return "";

  if (typeof project === "string") {
    return project;
  }

  return project._id || project.projectId || "";
};

/* =========================================================
   COMPONENT
========================================================= */

const Bin_Create = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================================
     MODE
  ========================================================= */

  const { mode, rowId } = location.state || {};

  const isEditMode = mode === "edit";

  /* =========================================================
     UI STATES
  ========================================================= */

  const [confirm, setConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [fetchingData, setFetchingData] =
    useState(false);

  const [isDescExpanded, setIsDescExpanded] =
    useState(false);

  /* =========================================================
     POPUP STATES
  ========================================================= */

  const [successModel, setSuccessModel] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorModel, setErrorModel] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  /* =========================================================
     CUSTOMER OPTIONS
  ========================================================= */

  const [customerOptions, setCustomerOptions] =
    useState([
      {
        label: "Loading...",
        value: "",
      },
    ]);

  /* =========================================================
     PROJECT OPTIONS
  ========================================================= */

  const [projectOptions, setProjectOptions] =
    useState([
      {
        label: "Select Project",
        value: "",
      },
    ]);

  /* =========================================================
     WAREHOUSE OPTIONS

     IMPORTANT:

     value = MongoDB warehouse _id

     label = warehouseName

     warehouseCode = ELEV-WH-001
     ========================================================= */

  const [warehouseOptions, setWarehouseOptions] =
    useState([
      {
        label: "Select Warehouse",
        value: "",
        warehouseCode: "",
      },
    ]);

  /* =========================================================
     ITEM OPTIONS
  ========================================================= */

  const [itemOptions, setItemOptions] =
    useState([
      {
        label: "Select Item",
        value: "",
      },
    ]);

  /* =========================================================
     WAREHOUSE ITEM DATA
  ========================================================= */

  const [allItemsData, setAllItemsData] =
    useState([]);

  /* =========================================================
     WEIGHT UNIT STATES
  ========================================================= */

  const [binWeightUnit, setBinWeightUnit] =
    useState("kg");

  const [
    customerWeightUnit,
    setCustomerWeightUnit,
  ] = useState("kg");

  /* =========================================================
     FORM DATA

     warehouseId:
       MongoDB _id

     warehouseCode:
       ELEV-WH-001
       used ONLY for items API
  ========================================================= */

  const [formData, setFormData] = useState({
  customerId: "",
  projectId: "",
  masterId: "",
  binId: "",
  supplierItemName: "",
  customerItemName: "",

  binAllowableWeight: "",
  binAllowableLimit: "",
  customerAllowableWeight: "",
  customerAllowableLimit: "",

  safetyStockQuantity: "",
  rol: "",
  itemPerPrice: "",

  weightPerUnit: "",
  weightPerPrice: "", // ADD THIS

  itemMasterId: "",
  warehouseId: "",
  warehouseCode: "",
  warehouseName: "",
  itemStatus: false,
});

  /* =========================================================
     1. FETCH CUSTOMER DATA
  ========================================================= */

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const customerRes = await customer_id();

        const customers =
          customerRes?.data?.data || [];

        setCustomerOptions([
  {
    label: "Select Customer",
    value: "",
  },

  ...customers.map((customer) => ({
    label: `${customer?.customerName}-(${customer?.companyName})` || "-",

    value: customer?._id || "",

    badge: {
      value: customer?.ishavesmartbin,
    },
  })),
]);
      } catch (error) {
        console.error(
          "Failed to fetch customer data:",
          error
        );

        setCustomerOptions([
          {
            label: "No Customer Found",
            value: "",
          },
        ]);
      }
    };

    fetchInitialData();
  }, []);

  /* =========================================================
     2. FETCH BIN DATA FOR EDIT MODE
  ========================================================= */

  useEffect(() => {
    const fetchBinForEdit = async () => {
      if (!isEditMode || !rowId) {
        return;
      }

      try {
        setFetchingData(true);

        const res =
          await bin_dashboard_getById(rowId);

        const data =
          res?.data?.data?.record ||
          res?.data?.data ||
          res?.data;

        if (!data) {
          return;
        }

        console.log(
          "========== EDIT BIN DATA =========="
        );

        console.log(data);

        /* =================================================
           CUSTOMER
        ================================================= */

        const customerId =
          typeof data.customerId === "object"
            ? data.customerId?._id || ""
            : data.customerId || "";

        /* =================================================
           PROJECT
        ================================================= */

        const projectId =
          typeof data.projectId === "object"
            ? data.projectId?._id || ""
            : data.projectId || "";

        /* =================================================
           WAREHOUSE

           Backend edit response:

           warehouseId:
             "ELEV-WH-001"

           warehouseName:
             "Elevators-warehouse"

           But payload requires:

           warehouseId:
             "65dfab12cd34567890123999"

           Therefore we initially store
           warehouseCode = ELEV-WH-001.

           The warehouse API will later resolve
           ELEV-WH-001 -> Mongo _id.
        ================================================= */

        let warehouseCode = "";

        let warehouseMongoId = "";

        let warehouseName = "";

        if (
          data.warehouseId &&
          typeof data.warehouseId === "object"
        ) {
          warehouseCode =
            data.warehouseId?.warehouseId ||
            data.warehouseId?.code ||
            "";

          warehouseMongoId =
            data.warehouseId?._id || "";

          warehouseName =
            data.warehouseId?.warehouseName ||
            data.warehouseId?.name ||
            "";
        } else {
          warehouseCode =
            data.warehouseId || "";

          warehouseName =
            data.warehouseName || "";
        }

        /* =================================================
           ITEM MASTER ID
        ================================================= */

        const itemMasterId =
          typeof data.itemMasterId === "object"
            ? data.itemMasterId?._id || ""
            : data.itemMasterId || "";

        /* =================================================
           WEIGHTS
        ================================================= */

        const bWeight = parseWeightStr(
          data.binAllowableWeight
        );

        const cWeight = parseWeightStr(
          data.customerAllowableWeight
        );

        setBinWeightUnit(
          bWeight.unit
        );

        setCustomerWeightUnit(
          cWeight.unit
        );

        console.log(
          "EDIT warehouseCode:",
          warehouseCode
        );

        console.log(
          "EDIT warehouseMongoId:",
          warehouseMongoId
        );

        console.log(
          "EDIT warehouseName:",
          warehouseName
        );

        console.log(
          "EDIT itemMasterId:",
          itemMasterId
        );

        /* =================================================
           SET FORM
        ================================================= */

        setFormData({
          customerId,

          projectId,

          masterId:
            data.masterId || "",

          binId:
            data.binId || "",

          supplierItemName:
            data.supplierItemName || "",

          customerItemName:
            data.customerItemName || "",

          binAllowableWeight:
            bWeight.value || "",

          binAllowableLimit:
            data.binAllowablelimit ??
            data.binAllowableLimit ??
            "",

          customerAllowableWeight:
            cWeight.value || "",

          customerAllowableLimit:
            data.customerAllowableLimit ?? "",

          safetyStockQuantity:
            data.safetyStockQuantity ?? "",

          rol:
            data.rol ?? "",

          itemPerPrice:
            data.itemPerPrice ?? "",

          /*
             Don't depend on old weight.

             It will be loaded from:
             /warehouse/ELEV-WH-001/items
          */
          weightPerUnit: "",

          itemMasterId,

          /*
             If backend already returned Mongo ID
             use it.

             Otherwise warehouse effect will resolve it.
          */
          warehouseId:
            warehouseMongoId,

          warehouseCode,

          warehouseName,

          itemStatus:
            data.itemStatus ??
            data.status ??
            false,
        });
      } catch (error) {
        console.error(
          "Error fetching bin details:",
          error
        );
      } finally {
        setFetchingData(false);
      }
    };

    fetchBinForEdit();
  }, [isEditMode, rowId]);

  /* =========================================================
     3. FETCH PROJECTS BY CUSTOMER
  ========================================================= */

  useEffect(() => {
    const fetchProjectsByCustomer = async () => {
      if (!formData.customerId) {
        setProjectOptions([
          {
            label: "Select Project",
            value: "",
          },
        ]);

        return;
      }

      try {
        const projectRes =
          await bin_ProjectName_get(
            formData.customerId
          );

        const projects =
          projectRes?.data?.data || [];

        setProjectOptions([
          {
            label: "Select Project",
            value: "",
          },

          ...projects.map((project) => ({
            label:
              project.projectName || "-",

            value:
              project._id || "",
          })),
        ]);
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error
        );

        setProjectOptions([
          {
            label: "No Project Found",
            value: "",
          },
        ]);
      }
    };

    fetchProjectsByCustomer();
  }, [formData.customerId]);

  /* =========================================================
     4. FETCH WAREHOUSES BY CUSTOMER

     Warehouse response is expected to contain:

     {
       _id: "65dfab12cd34567890123999",
       warehouseId: "ELEV-WH-001",
       warehouseName: "Elevators-warehouse"
     }

     IMPORTANT:

     dropdown value = _id
     API code = warehouseId
  ========================================================= */

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!formData.customerId) {
        setWarehouseOptions([
          {
            label: "Select Warehouse",
            value: "",
            warehouseCode: "",
          },
        ]);

        return;
      }

      try {
        setWarehouseOptions([
          {
            label: "Loading...",
            value: "",
            warehouseCode: "",
          },
        ]);

        const res =
          await get_warehouse_byCustomer(
            formData.customerId
          );

        const warehouses =
          res?.data?.data?.warehouses || [];

        console.log(
          "========== WAREHOUSE LIST =========="
        );

        console.log(warehouses);

        /* =================================================
           CREATE OPTIONS
        ================================================= */

        const options = warehouses.map(
          (warehouse) => ({
            label:
              warehouse.warehouseName ||
              warehouse.name ||
              warehouse.warehouseId ||
              "Unnamed Warehouse",

            /*
              THIS IS WHAT GETS STORED IN
              formData.warehouseId

              Example:
              65dfab12cd34567890123999
            */
            value:
              warehouse._id || "",

            /*
              THIS IS USED ONLY FOR:
              /warehouse/ELEV-WH-001/items
            */
            warehouseCode:
              warehouse.warehouseId || "",
          })
        );

        setWarehouseOptions([
          {
            label: "Select Warehouse",
            value: "",
            warehouseCode: "",
          },

          ...options,
        ]);

        /* =================================================
           EDIT MODE

           Existing bin has:

           warehouseCode:
           ELEV-WH-001

           Find matching warehouse and set
           Mongo _id.
        ================================================= */

        if (
          isEditMode &&
          formData.warehouseCode
        ) {
          const matchingWarehouse =
            warehouses.find(
              (warehouse) =>
                String(
                  warehouse.warehouseId
                ) ===
                String(
                  formData.warehouseCode
                ) ||
                String(
                  warehouse._id
                ) ===
                String(
                  formData.warehouseCode
                )
            );

          if (matchingWarehouse) {
            console.log(
              "EDIT MATCHED WAREHOUSE:",
              matchingWarehouse
            );

            setFormData((prev) => ({
              ...prev,

              /*
                Payload ID
              */
              warehouseId:
                matchingWarehouse._id,

              /*
                API ID
              */
              warehouseCode:
                matchingWarehouse.warehouseId,

              /*
                Display name
              */
              warehouseName:
                matchingWarehouse.warehouseName ||
                matchingWarehouse.name ||
                "",
            }));
          }
        }
      } catch (error) {
        console.error(
          "Failed to fetch warehouses:",
          error
        );

        setWarehouseOptions([
          {
            label: "No Warehouse Found",
            value: "",
            warehouseCode: "",
          },
        ]);
      }
    };

    fetchWarehouses();
  }, [
    formData.customerId,
    formData.warehouseCode,
    isEditMode,
  ]);

  /* =========================================================
     5. FETCH ITEMS BY WAREHOUSE

     IMPORTANT:

     DO NOT USE:

     formData.warehouseId

     here.

     formData.warehouseId =
       Mongo ObjectId

     Instead use:

     formData.warehouseCode =
       ELEV-WH-001

     API:

     /warehouse/ELEV-WH-001/items
  ========================================================= */

  useEffect(() => {
    const fetchWarehouseItems = async () => {
      const warehouseCode =
        formData.warehouseCode;

      if (!warehouseCode) {
        setItemOptions([
          {
            label: "Select Item",
            value: "",
          },
        ]);

        setAllItemsData([]);

        return;
      }

      try {
        setItemOptions([
          {
            label: "Loading...",
            value: "",
          },
        ]);

        console.log(
          "========== ITEMS API =========="
        );

        console.log(
          "Warehouse Code:",
          warehouseCode
        );

        /*
          IMPORTANT:

          This produces:

          /warehouse/ELEV-WH-001/items

          NOT:

          /warehouse/65df.../items
        */

        const res =
          await get_items_byWarehouse(
            warehouseCode
          );

        console.log(
          "WAREHOUSE ITEMS RESPONSE:",
          res?.data
        );

        const items =
          res?.data?.data?.items || [];

        setAllItemsData(items);

        setItemOptions([
          {
            label: "Select Item",
            value: "",
          },

          ...items.map((item) => ({
            label: `${item.itemMasterId?.itemName || "-"} (${item.itemMasterId?.partNumber || "-"})`,

            value:
              item.itemMasterId?._id || "",
          })),
        ]);
      } catch (error) {
        console.error(
          "Failed to fetch warehouse items:",
          error
        );

        console.error(
          "Items API error response:",
          error?.response?.data
        );

        setAllItemsData([]);

        setItemOptions([
          {
            label: "No Items Found",
            value: "",
          },
        ]);
      }
    };

    fetchWarehouseItems();
  }, [formData.warehouseCode]);

  /* =========================================================
     6. AUTO-FILL ITEM + WEIGHT

     API:

     {
       itemMasterId: {
         _id: "...",
         itemName: "GRIP Sealing Plug",
         partNumber: "...",
         weightPerUnit: 1.7
       }
     }
  ========================================================= */

  useEffect(() => {
    if (
      !formData.itemMasterId ||
      !allItemsData.length
    ) {
      return;
    }

    const selectedItem =
      allItemsData.find(
        (item) =>
          String(
            item.itemMasterId?._id
          ) ===
          String(
            formData.itemMasterId
          )
      );

    if (!selectedItem) {
      console.log(
        "Selected item not found:",
        formData.itemMasterId
      );

      return;
    }

    const masterItem =
      selectedItem.itemMasterId;

    console.log(
      "========== SELECTED ITEM =========="
    );

    console.log(selectedItem);

    console.log(
      "Item Name:",
      masterItem?.itemName
    );

    console.log(
      "Weight Per Unit:",
      masterItem?.weightPerUnit
    );

    setFormData((prev) => ({
      ...prev,

      /*
        Item Name
      */
      supplierItemName:
        masterItem?.itemName ||
        prev.supplierItemName,

      /*
        Weight per Unit
      */
      weightPerUnit:
        masterItem?.weightPerUnit ??
        prev.weightPerUnit,
    }));
  }, [
    formData.itemMasterId,
    allItemsData,
  ]);

  /* =========================================================
     7. AUTOMATIC QUANTITY CALCULATION
  ========================================================= */

  useEffect(() => {
    if (
      !formData.itemMasterId ||
      !allItemsData.length
    ) {
      return;
    }

    const unitWeight =
      parseFloat(
        formData.weightPerUnit
      ) || 1;

    const numericBinWeight =
      parseFloat(
        formData.binAllowableWeight
      );

    const numericCustWeight =
      parseFloat(
        formData.customerAllowableWeight
      );

    setFormData((prev) => ({
      ...prev,

      binAllowableLimit:
        !isNaN(numericBinWeight)
          ? Math.floor(
              (
                binWeightUnit === "kg"
                  ? numericBinWeight * 1000
                  : numericBinWeight
              ) / unitWeight
            ).toString()
          : prev.binAllowableLimit,

      customerAllowableLimit:
        !isNaN(numericCustWeight)
          ? Math.floor(
              (
                customerWeightUnit === "kg"
                  ? numericCustWeight * 1000
                  : numericCustWeight
              ) / unitWeight
            ).toString()
          : prev.customerAllowableLimit,
    }));
  }, [
    formData.binAllowableWeight,
    formData.customerAllowableWeight,
    binWeightUnit,
    customerWeightUnit,
    formData.weightPerUnit,
    formData.itemMasterId,
    allItemsData,
  ]);

  /* =========================================================
     8. HANDLE FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    /* =======================================================
       CUSTOMER CHANGE
    ======================================================= */

    if (name === "customerId") {
      setFormData((prev) => ({
        ...prev,

        customerId: value,

        projectId: "",

        warehouseId: "",

        warehouseCode: "",

        warehouseName: "",

        itemMasterId: "",

        supplierItemName: "",

        weightPerUnit: "",
      }));

      setWarehouseOptions([
        {
          label: "Loading...",
          value: "",
          warehouseCode: "",
        },
      ]);

      setItemOptions([
        {
          label: "Select Item",
          value: "",
        },
      ]);

      setAllItemsData([]);

      return;
    }

    /* =======================================================
       WAREHOUSE CHANGE
    ======================================================= */

    if (name === "warehouseId") {
      const selectedWarehouse =
        warehouseOptions.find(
          (warehouse) =>
            String(
              warehouse.value
            ) === String(value)
        );

      console.log(
        "SELECTED WAREHOUSE:",
        selectedWarehouse
      );

      setFormData((prev) => ({
        ...prev,

        /*
          Mongo ID

          Example:
          65dfab12cd34567890123999
        */
        warehouseId: value,

        /*
          Business ID

          Example:
          ELEV-WH-001
        */
        warehouseCode:
          selectedWarehouse
            ?.warehouseCode || "",

        /*
          Display name
        */
        warehouseName:
          selectedWarehouse
            ?.label || "",

        /*
          Reset item
        */
        itemMasterId: "",

        supplierItemName: "",

        weightPerUnit: "",
      }));

      setItemOptions([
        {
          label: "Loading...",
          value: "",
        },
      ]);

      setAllItemsData([]);

      return;
    }

    /* =======================================================
       ITEM CHANGE
    ======================================================= */

    if (name === "itemMasterId") {
      const selectedItem =
        allItemsData.find(
          (item) =>
            String(
              item.itemMasterId?._id
            ) === String(value)
        );

      setFormData((prev) => ({
        ...prev,

        itemMasterId: value,

        supplierItemName:
          selectedItem?.itemMasterId
            ?.itemName ||
          prev.supplierItemName,

        weightPerUnit:
          selectedItem?.itemMasterId
            ?.weightPerUnit ??
          "",
      }));

      return;
    }

    /* =======================================================
       NORMAL FIELD CHANGE
    ======================================================= */

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     9. SELECTED ITEM
  ========================================================= */

  const selectedItem =
    allItemsData.find(
      (item) =>
        String(
          item.itemMasterId?._id
        ) ===
        String(
          formData.itemMasterId
        )
    );

  const selectedItemDesc =
    selectedItem?.itemMasterId
      ?.itemDescription || "";

  /* =========================================================
     10. FINAL SUBMISSION
  ========================================================= */

  const handleFinalSubmit = async () => {
    if (
      !formData.customerId ||
      !formData.itemMasterId ||
      !formData.warehouseId
    ) {
      setErrorMessage(
        "Customer, Warehouse and Item are required."
      );

      setErrorModel(true);

      return;
    }

    setConfirm(false);

    setIsSubmitting(true);

    try {
      /* =====================================================
         FINAL PAYLOAD

         warehouseId:
           MongoDB ObjectId

         warehouseCode:
           ELEV-WH-001

         NOTE:
         If backend does not accept warehouseCode,
         remove it before sending.
      ===================================================== */

      const payload = {
  customerId: formData.customerId,
  projectId: formData.projectId,
  masterId: formData.masterId,
  binId: formData.binId,

  binAllowableWeight: formData.binAllowableWeight,
  binAllowableLimit: Number(formData.binAllowableLimit),

  customerAllowableWeight: formData.customerAllowableWeight,
  customerAllowableLimit: Number(formData.customerAllowableLimit),

  safetyStockQuantity: Number(formData.safetyStockQuantity),
  rol: Number(formData.rol),

  itemPerPrice: Number(formData.itemPerPrice),

  weightPerUnit: Number(formData.weightPerUnit),
  weightPerPrice: Number(formData.weightPerPrice), // ADD THIS

  itemMasterId: formData.itemMasterId,

  // MongoDB warehouse _id for create/edit payload
  warehouseId: formData.warehouseId,

  warehouseName: formData.warehouseName,

  itemStatus: formData.itemStatus,
};

      console.log(
        "========== FINAL PAYLOAD =========="
      );

      console.log(payload);

      console.log(
        "Payload warehouseId:",
        payload.warehouseId
      );

      console.log(
        "Payload warehouseName:",
        payload.warehouseName
      );

      console.log(
        "Payload warehouseCode:",
        formData.warehouseCode
      );

      console.log(
        "Payload weightPerUnit:",
        payload.weightPerUnit
      );

      const res = isEditMode
        ? await bin_dashboard_Edit(
            rowId,
            payload
          )
        : await bin_dashboard_create(
            payload
          );

      if (res?.data?.success) {
        const apiSuccessMessage =
          res?.data?.data?.message ||
          res?.data?.message ||
          `Bin Configuration ${
            isEditMode
              ? "Updated"
              : "Created"
          } Successfully!`;

        setSuccessMessage(
          apiSuccessMessage
        );

        setSuccessModel(true);

        setTimeout(() => {
          setSuccessModel(false);

          navigate(-1);
        }, 2000);
      } else {
        const apiErrorMessage =
          res?.data?.data?.message ||
          res?.data?.message ||
          "Something went wrong while saving.";

        setErrorMessage(
          apiErrorMessage
        );

        setErrorModel(true);
      }
    } catch (error) {
      console.error(
        "Submission failed:",
        error
      );

      console.error(
        "Server response:",
        error?.response?.data
      );

      const apiErrorMessage =
        error?.response?.data?.data
          ?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred.";

      setErrorMessage(
        apiErrorMessage
      );

      setErrorModel(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">

          <Loader2
            className="animate-spin text-[#0062a0]"
            size={48}
          />

          <p className="text-slate-500 font-medium">
            Loading Bin Details...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8"
    >
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center gap-4 mb-8">

          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-[#f0f9ff] text-[#0062a0] rounded-2xl transition-all cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            {isEditMode
              ? "Edit Bin Configuration"
              : "Create Bin Configuration"}
          </h1>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 items-start">

          {/* CUSTOMER */}

          <ReUsableInput_Fields
            label="Customer"
            name="customerId"
            type="select"
            options={customerOptions}
            value={formData.customerId}
            onChange={handleChange}
          />

          {/* PROJECT */}

          <ReUsableInput_Fields
            label="Project Name"
            name="projectId"
            type="select"
            options={projectOptions}
            value={formData.projectId}
            onChange={handleChange}
            disabled={!formData.customerId}
          />

          {/* WAREHOUSE */}

          <ReUsableInput_Fields
            label="Warehouse Name"
            name="warehouseId"
            type="select"
            options={warehouseOptions}
            value={formData.warehouseId}
            onChange={handleChange}
            disabled={!formData.customerId}
          />

          {/* ITEM */}

          <div className="flex flex-col w-full min-h-[90px]">

            <ReUsableInput_Fields
              label="Item Name"
              name="itemMasterId"
              type="select"
              options={itemOptions}
              value={formData.itemMasterId}
              onChange={handleChange}
              disabled={
                !formData.warehouseCode
              }
            />

            {selectedItemDesc && (
              <div className="flex items-start justify-between text-blue-600 bg-blue-50/50 px-2 py-1.5 rounded-lg border border-blue-100/50 mt-1">

                <span
                  className={`text-[13px] font-medium leading-tight transition-all duration-300 ${
                    isDescExpanded
                      ? "whitespace-normal"
                      : "line-clamp-1"
                  }`}
                >

                  <span className="font-bold mr-1">
                    Desc:
                  </span>

                  {selectedItemDesc}

                </span>

                {selectedItemDesc.length >
                  50 && (
                  <button
                    type="button"
                    onClick={() =>
                      setIsDescExpanded(
                        !isDescExpanded
                      )
                    }
                    className="ml-2 flex-shrink-0 cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-0.5 rounded-full transition-colors mt-[1px]"
                    title={
                      isDescExpanded
                        ? "Show less"
                        : "Show more"
                    }
                  >
                    {isDescExpanded ? (
                      <ChevronUp
                        size={16}
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                      />
                    )}
                  </button>
                )}

              </div>
            )}

          </div>

          {/* MASTER ID */}

          <ReUsableInput_Fields
            label="Master ID"
            name="masterId"
            value={formData.masterId}
            onChange={handleChange}
          />

          {/* BIN ID */}

          <ReUsableInput_Fields
            label="BIN ID"
            name="binId"
            value={formData.binId}
            onChange={handleChange}
          />

          {/* WEIGHT PER UNIT */}

          <ReUsableInput_Fields
            label="Weight per Unit"
            name="weightPerUnit"
            type="number"
            value={formData.weightPerUnit}
            onChange={handleChange}
            disabled={true}
          />

          {/* ITEM PRICE */}

          <ReUsableInput_Fields
            label="Item Price"
            name="itemPerPrice"
            type="number"
            value={formData.itemPerPrice}
            onChange={handleChange}
          />

          {/* CUSTOMER ITEM NAME */}

          <ReUsableInput_Fields
            label="Customer Item Name"
            name="customerItemName"
            value={formData.customerItemName}
            onChange={handleChange}
          />

          {/* BIN ALLOWABLE WEIGHT */}

          <div className="relative">

            <ReUsableInput_Fields
              label="BIN Allowable Weight"
              name="binAllowableWeight"
              type="number"
              value={
                formData.binAllowableWeight
              }
              onChange={handleChange}
            />

            <div className="absolute right-1 bottom-[8px] z-10">

              <select
                value={binWeightUnit}
                onChange={(e) =>
                  setBinWeightUnit(
                    e.target.value
                  )
                }
                className="bg-slate-100 text-slate-700 text-sm font-bold rounded-lg px-2 py-1.5 outline-none border border-slate-200 cursor-pointer shadow-sm"
              >

                <option value="kg">
                  kg
                </option>

                <option value="gm">
                  gm
                </option>

              </select>

            </div>

          </div>

          {/* BIN ALLOWABLE LIMIT */}

          <ReUsableInput_Fields
            label="BIN Allowable Limit"
            name="binAllowableLimit"
            value={
              formData.binAllowableLimit
            }
            disabled={true}
          />

          {/* CUSTOMER ALLOWABLE WEIGHT */}

          <div className="relative">

            <ReUsableInput_Fields
              label="Customer Allowable Weight"
              name="customerAllowableWeight"
              type="number"
              value={
                formData.customerAllowableWeight
              }
              onChange={handleChange}
            />

            <div className="absolute right-1 bottom-[8px] z-10">

              <select
                value={
                  customerWeightUnit
                }
                onChange={(e) =>
                  setCustomerWeightUnit(
                    e.target.value
                  )
                }
                className="bg-slate-100 text-slate-700 text-sm font-bold rounded-lg px-2 py-1.5 outline-none border border-slate-200 cursor-pointer shadow-sm"
              >

                <option value="kg">
                  kg
                </option>

                <option value="gm">
                  gm
                </option>

              </select>

            </div>

          </div>

          {/* CUSTOMER ALLOWABLE LIMIT */}

          <ReUsableInput_Fields
            label="Customer Allowable Limit"
            name="customerAllowableLimit"
            value={
              formData.customerAllowableLimit
            }
            disabled={true}
          />

          {/* SAFETY STOCK */}

          <ReUsableInput_Fields
            label="Safety Stock Quantity"
            name="safetyStockQuantity"
            type="number"
            value={
              formData.safetyStockQuantity
            }
            onChange={handleChange}
          />

          {/* ROL */}

          <ReUsableInput_Fields
            label="ROL (Re Order Level)"
            name="rol"
            type="number"
            value={formData.rol}
            onChange={handleChange}
          />

        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="flex items-center gap-6 justify-end mt-12 mb-4">

          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={() =>
              setConfirm(true)
            }
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : isEditMode
              ? "Update"
              : "Create"}
          </Button>

        </div>

      </div>

      {/* =================================================
          CONFIRMATION POPUP
      ================================================= */}

      <Confirmation_Popup
        isOpen={confirm}
        onClose={() =>
          setConfirm(false)
        }
        onConfirm={
          handleFinalSubmit
        }
        message={`Are you sure you want to ${
          isEditMode
            ? "Update"
            : "Create"
        } Bin Configuration?`}
      />

      {/* =================================================
          SUCCESS POPUP
      ================================================= */}

      <Success_Popup
        isOpen={successModel}
        onClose={() =>
          setSuccessModel(false)
        }
        message={successMessage}
      />

      {/* =================================================
          ERROR POPUP
      ================================================= */}

      <ErrorMessage_Popup
        isOpen={errorModel}
        onClose={() =>
          setErrorModel(false)
        }
        message={errorMessage}
      />

    </motion.div>
  );
};

export default Bin_Create;