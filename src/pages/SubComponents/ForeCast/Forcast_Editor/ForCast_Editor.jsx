import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Package,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  useLocation,
  useNavigate,
  useMatches,
} from "react-router-dom";

import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../../../component/button/Buttons";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchCustomerId,
  fetchBomApi,
  fetchProjectApi,
  fetchSingleBomApi,
  clearBomData,
  clearProjectData,
  clearSingleBomData,

  // Forecast
  ForcastPost,
  ForcastGet,
  ForcastUpdate,

  // Consumption
  ProjectConsumptionPost,
  ProjectConsumptionGet,
  ProjectConsumptionEntryUpdate,
} from "../../../../store/Api_slice/Forecast_Slice";


/* =========================================================
   VIEWER CONFIG
========================================================= */

const VIEWER_CONFIG = {
  forecast: {
    viewerType: "forecast",

    title: "Forecast",
    description: "Manage and monitor forecasts",

    apiEndpoint: "/forecast/",

    idLabel: "Forecast Id",

    createLabel: "Create Forecast",
    editorTitle: "Forecast Editor",
    editTitle: "Edit Forecast",

    monthLabel: "Forecast Month",
    quantityLabel: "Production Quantity",

    updateLabel: "Update Forecast",

    entityName: "forecast",
  },

  consumption: {
    viewerType: "consumption",

    title: "Consumption",
    description: "Manage and monitor consumption",

    apiEndpoint: "/project-consumption/",

    idLabel: "Consumption Id",

    createLabel: "Create Consumption",
    editorTitle: "Consumption Editor",
    editTitle: "Edit Consumption",

    monthLabel: "Consumption Month",
    quantityLabel: "Consumption Quantity",

    updateLabel: "Update Consumption",

    entityName: "consumption",
  },
};


/* =========================================================
   GET VIEWER TYPE
========================================================= */

const getViewerType = (matches, pathname) => {
  // First preference: route handle
  const routeViewerType = matches
    .map((match) => match.handle?.viewerType)
    .find(Boolean);

  if (
    routeViewerType &&
    VIEWER_CONFIG[routeViewerType]
  ) {
    return routeViewerType;
  }

  // Fallback
  if (
    pathname.startsWith("/consumption-viewer") ||
    pathname.includes("/consumption-viewer")
  ) {
    return "consumption";
  }

  return "forecast";
};


/* =========================================================
   MONTH NAME HELPERS
========================================================= */

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];


const formatMonth = (rawMonth) => {
  if (!rawMonth) return "";

  const date = new Date(`${rawMonth}-01`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
};


const convertMonthToInputValue = (monthString) => {
  if (!monthString) return "";

  const parts = monthString.trim().split(" ");

  if (parts.length !== 2) {
    return "";
  }

  const monthIndex =
    MONTH_NAMES.indexOf(parts[0]);

  const year = parts[1];

  if (
    monthIndex < 0 ||
    !year
  ) {
    return "";
  }

  return `${year}-${String(monthIndex + 1).padStart(
    2,
    "0"
  )}`;
};


/* =========================================================
   COMPONENT
========================================================= */

const ForCast_Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const dispatch = useDispatch();


  /* =========================================================
     DYNAMIC VIEWER CONFIG
  ========================================================= */

  const viewerType = getViewerType(
    matches,
    location.pathname
  );

  const viewerConfig =
    VIEWER_CONFIG[viewerType];


  const isConsumption =
    viewerType === "consumption";

  const isForecast =
    viewerType === "forecast";


  /* =========================================================
     ROUTE STATE
  ========================================================= */

  const {
    rowId,
    mode,
    edit,
    _id,
  } = location.state || {};

  const recordId =
    rowId || _id;

  const isEdit =
    mode === "edit" ||
    edit === true ||
    !!recordId;


  /* =========================================================
     MODAL STATES
  ========================================================= */

  const [confirm, setConfirm] =
    useState(false);

  const [successModel, setSuccessModel] =
    useState(false);

  const [errorModel, setErrorModel] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  /* =========================================================
     REDUX STATES
  ========================================================= */

  const {
    forcastEdit,
    bomData,
    projectData,
    singleBomData,

    postLoading,
    updateLoading,

    forecastGet,
  } = useSelector(
    (state) => state.forecast
  );


  /* =========================================================
     DATA
  ========================================================= */

  const forcastData =
    forcastEdit?.data || [];

  const projectList =
    projectData?.data ||
    projectData?.projects ||
    [];

  const bomList =
    Array.isArray(bomData?.data)
      ? bomData.data
      : Array.isArray(bomData?.boms)
        ? bomData.boms
        : [];

  const bomDetails =
    singleBomData?.data ||
    singleBomData?.bom ||
    null;


  /* =========================================================
     LOCAL EDIT DATA
     
     Consumption is fetched separately because the existing
     forecast Redux state is not guaranteed to contain
     consumption records.
  ========================================================= */

  const [consumptionEditData, setConsumptionEditData] =
    useState(null);

  const [consumptionLoading, setConsumptionLoading] =
    useState(false);


  /* =========================================================
     LOADING
  ========================================================= */

  const isLoading =
    postLoading ||
    updateLoading ||
    consumptionLoading;


  /* =========================================================
     FORM STATE
  ========================================================= */

  const [formData, setFormData] =
    useState({
      customerId: "",
      projectId: "",
      bomId: "",
    });


  /* =========================================================
     MONTH ROWS
  ========================================================= */

  const [forecastRows, setForecastRows] = useState([
    {
      id: Date.now(),
      month: "",
      quantity: "",
      rawMonth: "",
      itemId: "",
    },
  ]);

  console.log(forecastRows)


  /* =========================================================
     INITIAL FETCH
  ========================================================= */

  useEffect(() => {
    dispatch(fetchCustomerId(isConsumption));
  }, [dispatch, isConsumption]);


  /* =========================================================
     FETCH EDIT DATA
  ========================================================= */

  useEffect(() => {
    if (!isEdit || !recordId) {
      return;
    }


    /* -------------------------------------------------------
       FORECAST EDIT
    ------------------------------------------------------- */

    if (isForecast) {
      if (!forecastGet?.data) {
        dispatch(
          ForcastGet({
            endpoint:
              viewerConfig.apiEndpoint,
          })
        );
      }

      return;
    }


    /* -------------------------------------------------------
       CONSUMPTION EDIT
    ------------------------------------------------------- */

    if (isConsumption) {
      let cancelled = false;

      const loadConsumption = async () => {
        try {
          setConsumptionLoading(true);

          const response =
            await dispatch(
              ProjectConsumptionGet()
            ).unwrap();

          if (cancelled) {
            return;
          }

          const list =
            Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response)
                ? response
                : [];
                console.log("consumption list", list)

          const found =
            list.find(
              (item) =>
                item?._id === recordId
            );

          if (found) {
            setConsumptionEditData(found);
          }

        } catch (error) {
          if (!cancelled) {
            setErrorMessage(
              error?.message ||
              "Failed to fetch consumption"
            );

            setErrorModel(true);
          }
        } finally {
          if (!cancelled) {
            setConsumptionLoading(false);
          }
        }
      };

      loadConsumption();

      return () => {
        cancelled = true;
      };
    }

  }, [
    dispatch,
    isEdit,
    recordId,
    isForecast,
    isConsumption,
    forecastGet,
    viewerConfig.apiEndpoint,
  ]);


  /* =========================================================
     GET FORECAST EDIT DATA
  ========================================================= */

  useEffect(() => {
    if (
      !isEdit ||
      !recordId ||
      !isForecast ||
      !forecastGet?.data
    ) {
      return;
    }

    const editData =
      forecastGet.data.find(
        (item) =>
          item?._id === recordId
      );

    if (!editData) {
      return;
    }


    /* -------------------------------------------------------
       FORM DATA
    ------------------------------------------------------- */

    setFormData({
      customerId:
        editData.customerId?._id ||
        editData.customerId ||
        "",

      projectId:
        editData.projectId?._id ||
        editData.projectId ||
        "",

      bomId:
        editData.bomId?._id ||
        editData.bomId ||
        "",
    });


    /* -------------------------------------------------------
       PROJECT
    ------------------------------------------------------- */

    const customerId =
      editData.customerId?._id ||
      editData.customerId;

    const projectId =
      editData.projectId?._id ||
      editData.projectId;

    const bomId =
      editData.bomId?._id ||
      editData.bomId;


    if (customerId) {
      dispatch(
        fetchProjectApi(
          customerId
        )
      );
    }


    /* -------------------------------------------------------
       BOM
    ------------------------------------------------------- */

    if (
      customerId &&
      projectId
    ) {
      dispatch(
        fetchBomApi({
          customerId,
          projectId,
        })
      );
    }


    /* -------------------------------------------------------
       SINGLE BOM
    ------------------------------------------------------- */

    if (bomId) {
      dispatch(
        fetchSingleBomApi(
          bomId
        )
      );
    }


    /* -------------------------------------------------------
       FORECAST MONTH DATA
    ------------------------------------------------------- */

    if (
      Array.isArray(
        editData.projectForecast
      ) &&
      editData.projectForecast.length > 0
    ) {
      const prefilledRows =
        editData.projectForecast.map(
          (item, index) => {

            const rawMonthValue =
              convertMonthToInputValue(
                item?.forecastMonth
              );

            return {
              id:
                Date.now() + index,

              month:
                item?.forecastMonth || "",

              rawMonth:
                rawMonthValue,

              quantity:
                item?.productionQuantity ?? "",
            };
          }
        );

      setForecastRows(
        prefilledRows
      );
    }

  }, [
    isEdit,
    recordId,
    isForecast,
    forecastGet,
    dispatch,
  ]);


  /* =========================================================
     GET CONSUMPTION EDIT DATA
  ========================================================= */

  useEffect(() => {
    if (
      !isEdit ||
      !isConsumption ||
      !consumptionEditData
    ) {
      return;
    }

    const editData =
      consumptionEditData;


    /* -------------------------------------------------------
       FORM DATA
    ------------------------------------------------------- */

    const customerId =
      editData.customerId?._id ||
      editData.customerId ||
      "";

    const projectId =
      editData.projectId?._id ||
      editData.projectId ||
      "";

    const bomId =
      editData.bomId?._id ||
      editData.bomId ||
      "";


    setFormData({
      customerId,
      projectId,
      bomId,
    });


    /* -------------------------------------------------------
       PROJECT
    ------------------------------------------------------- */

    if (customerId) {
      dispatch(
        fetchProjectApi(
          customerId
        )
      );
    }


    /* -------------------------------------------------------
       BOM
    ------------------------------------------------------- */

    if (
      customerId &&
      projectId
    ) {
      dispatch(
        fetchBomApi({
          customerId,
          projectId,
        })
      );
    }


    /* -------------------------------------------------------
       SINGLE BOM
    ------------------------------------------------------- */

    if (bomId) {
      dispatch(
        fetchSingleBomApi(
          bomId
        )
      );
    }


    /* -------------------------------------------------------
       CONSUMPTION MONTH DATA
       
       Supports:
       projectConsumption
       consumption
       consumptionEntries
    ------------------------------------------------------- */

    /* =========================================================
   CONSUMPTION MONTH DATA
========================================================= */

const consumptionRows =
  editData.projectConsumption ||
  editData.consumption ||
  editData.consumptionEntries ||
  [];

console.log("consumptionRows", consumptionRows);

if (
  Array.isArray(consumptionRows) &&
  consumptionRows.length > 0
) {
  const prefilledRows =
    consumptionRows.map((item, index) => {
      const month =
        item?.consumptionMonth ||
        item?.month ||
        "";

      /*
       * API already returns YYYY-MM.
       * Do NOT call convertMonthToInputValue()
       * because that function expects "Aug 2026".
       */
      const rawMonth =
        /^\d{4}-\d{2}$/.test(month)
          ? month
          : convertMonthToInputValue(month);

      /*
       * Consumption API uses productionQuantity
       */
      const quantity =
        item?.productionQuantity ??
        item?.consumptionQuantity ??
        item?.quantity ??
        "";

      return {
        id: Date.now() + index,

        month,

        rawMonth,

        quantity,
      };
    });

  console.log(
    "prefilled consumption rows",
    prefilledRows
  );

  setForecastRows(prefilledRows);
}

  }, [
    isEdit,
    isConsumption,
    consumptionEditData,
    dispatch,
  ]);


  /* =========================================================
     SUCCESS MODAL
  ========================================================= */

  useEffect(() => {
    if (!successModel) {
      return;
    }

    const timer =
      setTimeout(() => {

        setSuccessModel(false);

        if (!isEdit) {
          resetForm();
        }

        navigate(-1);

      }, 2000);

    return () =>
      clearTimeout(timer);

  }, [
    successModel,
    isEdit,
    navigate,
  ]);


  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {

    setFormData({
      customerId: "",
      projectId: "",
      bomId: "",
    });

    setForecastRows([
      {
        id: Date.now(),
        month: "",
        quantity: "",
        rawMonth: "",
        itemId: "",
      },
    ]);

    setConsumptionEditData(null);

    dispatch(
      clearBomData()
    );

    dispatch(
      clearProjectData()
    );

    dispatch(
      clearSingleBomData()
    );
  };


  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,

      [name]: value,

      ...(name === "customerId" && {
        projectId: "",
        bomId: "",
      }),

      ...(name === "projectId" && {
        bomId: "",
      }),
    }));


    /* -------------------------------------------------------
       CUSTOMER
    ------------------------------------------------------- */

    if (
      name === "customerId" &&
      value
    ) {

      dispatch(
        fetchProjectApi(
          value
        )
      );

      dispatch(
        clearBomData()
      );

      dispatch(
        clearSingleBomData()
      );
    }


    /* -------------------------------------------------------
       PROJECT
    ------------------------------------------------------- */

    if (
      name === "projectId" &&
      value &&
      formData.customerId
    ) {

      dispatch(
        fetchBomApi({
          customerId:
            formData.customerId,

          projectId:
            value,
        })
      );

      dispatch(
        clearSingleBomData()
      );
    }


    /* -------------------------------------------------------
       BOM
    ------------------------------------------------------- */

    if (
      name === "bomId" &&
      value
    ) {

      dispatch(
        fetchSingleBomApi(
          value
        )
      );
    }
  };


  /* =========================================================
     MONTH CHANGE
  ========================================================= */

  const handleMonthChange = (
    id,
    value
  ) => {

    if (value) {

      const formattedMonth =
        formatMonth(value);


      handleRowChange(
        id,
        "month",
        formattedMonth
      );


      handleRowChange(
        id,
        "rawMonth",
        value
      );

    } else {

      handleRowChange(
        id,
        "month",
        ""
      );

      handleRowChange(
        id,
        "rawMonth",
        ""
      );
    }
  };


  /* =========================================================
     ADD ROW
  ========================================================= */

  const handleAddRow = () => {

    if (
      forecastRows.length < 6
    ) {

      setForecastRows([
        ...forecastRows,

        {
          id: Date.now(),
          month: "",
          quantity: "",
          rawMonth: "",
          itemId: "",
        },
      ]);
    }
  };


  /* =========================================================
     REMOVE ROW
  ========================================================= */

  const handleRemoveRow = (
    id
  ) => {

    if (
      forecastRows.length > 1
    ) {

      setForecastRows(
        forecastRows.filter(
          (row) =>
            row.id !== id
        )
      );
    }
  };


  /* =========================================================
     ROW CHANGE
  ========================================================= */

  const handleRowChange = (
    id,
    field,
    value
  ) => {

    setForecastRows(
      (previousRows) =>
        previousRows.map(
          (row) =>
            row.id === id
              ? {
                ...row,
                [field]: value,
              }
              : row
        )
    );
  };


  /* =========================================================
     PREPARE FORECAST PAYLOAD
  ========================================================= */

  const prepareForecastPayload = () => {

    const projectForecast =
      forecastRows
        .filter(
          (row) =>
            row.rawMonth &&
            row.quantity &&
            Number(row.quantity) > 0
        )
        .map((row) => {

          const date =
            new Date(
              `${row.rawMonth}-01`
            );

          return {

            forecastMonth:
              `${MONTH_NAMES[
              date.getMonth()
              ]} ${date.getFullYear()}`,

            productionQuantity:
              Number(
                row.quantity
              ),
          };
        });


    return {

      customerId:
        formData.customerId ||
        undefined,

      projectId:
        formData.projectId,

      bomId:
        formData.bomId,

      projectForecast,
    };
  };


  /* =========================================================
     PREPARE CONSUMPTION PAYLOAD
     
     NOTE:
     These property names must match the backend API:
     
     projectConsumption
     consumptionMonth
     consumptionMonth
  ========================================================= */

  const prepareConsumptionPayload = () => {
    const validRows = forecastRows.filter(
      (row) => row.rawMonth
    );

    const projectConsumption = validRows.map(
      (row) => ({
        consumptionMonth: row.rawMonth,
        
        productionQuantity:
              Number(
                row.quantity
              ),
      })
    );
  //    "projectConsumption": [
  //   { "consumptionMonth": "2026-06", "productionQuantity": 200 },
  //   { "consumptionMonth": "2026-07", "productionQuantity": 140 },
  //   { "consumptionMonth": "2026-08", "productionQuantity": 180 }
  // ]


    return {
      customerId:
        formData.customerId || undefined,
      projectId: formData.projectId,
      bomId: formData.bomId,
      projectConsumption,
    };
  };


  /* =========================================================
     PREPARE PAYLOAD
  ========================================================= */

  const preparePayload = () => {

    if (isConsumption) {
      return prepareConsumptionPayload();
    }

    return prepareForecastPayload();
  };


  /* =========================================================
     VALIDATE FORM
  ========================================================= */

  const handleSubmitInit = () => {
    /* =========================================================
       COMMON VALIDATION
    ========================================================= */

    if (!formData.projectId) {
      setErrorMessage("Please select a project");
      setErrorModel(true);
      return;
    }

    if (!formData.bomId) {
      setErrorMessage("Please select a BOM");
      setErrorModel(true);
      return;
    }

    /* =========================================================
       CONSUMPTION VALIDATION
    ========================================================= */

    if (isConsumption) {
      const enteredRows = forecastRows.filter(
        (row) => row.rawMonth
      );

      if (enteredRows.length === 0) {
        setErrorMessage(
          "Please add at least one consumption month"
        );
        setErrorModel(true);
        return;
      }

      const months = enteredRows.map(
        (row) => row.rawMonth
      );

      if (
        new Set(months).size !== months.length
      ) {
        setErrorMessage(
          "Duplicate consumption months found. Please select unique months."
        );
        setErrorModel(true);
        return;
      }

      setConfirm(true);
      return;
    }

    /* =========================================================
       FORECAST VALIDATION
    ========================================================= */

    const hasValidRows = forecastRows.some(
      (row) =>
        row.rawMonth &&
        row.quantity &&
        Number(row.quantity) > 0
    );

    if (!hasValidRows) {
      setErrorMessage(
        `Please add at least one ${viewerConfig.entityName} month with quantity`
      );
      setErrorModel(true);
      return;
    }

    const months = forecastRows
      .filter((row) => row.month)
      .map((row) => row.month);

    if (new Set(months).size !== months.length) {
      setErrorMessage(
        `Duplicate months found. Please select unique months for each ${viewerConfig.entityName} row.`
      );
      setErrorModel(true);
      return;
    }

    if (
      forecastRows.some(
        (row) =>
          row.quantity &&
          Number(row.quantity) <= 0
      )
    ) {
      setErrorMessage(
        `${viewerConfig.quantityLabel} must be greater than 0`
      );
      setErrorModel(true);
      return;
    }

    setConfirm(true);
  };


  /* =========================================================
     FORECAST CREATE
  ========================================================= */

  const createForecast = async () => {

    const payload =
      prepareForecastPayload();

    try {

      const res =
        await dispatch(
          ForcastPost(
            payload
          )
        ).unwrap();


      setSuccessMessage(
        res?.message ||
        "Forecast Created Successfully!"
      );

      setSuccessModel(true);

    } catch (error) {

      setErrorMessage(
        error?.message ||
        "Failed to create forecast"
      );

      setErrorModel(true);
    }
  };


  /* =========================================================
     FORECAST UPDATE
  ========================================================= */

  const updateForecast = async () => {

    const payload =
      prepareForecastPayload();

    try {

      const res =
        await dispatch(
          ForcastUpdate({
            id: recordId,
            payload,
          })
        ).unwrap();


      setSuccessMessage(
        res?.message ||
        "Forecast Updated Successfully!"
      );

      setSuccessModel(true);

    } catch (error) {

      setErrorMessage(
        error?.message ||
        "Failed to update forecast"
      );

      setErrorModel(true);
    }
  };


  /* =========================================================
     CONSUMPTION CREATE
  ========================================================= */

  const createConsumption = async () => {

    const payload =
      prepareConsumptionPayload();

    try {

      const res =
        await dispatch(
          ProjectConsumptionPost(
            payload
          )
        ).unwrap();


      setSuccessMessage(
        res?.message ||
        "Consumption Created Successfully!"
      );

      setSuccessModel(true);

    } catch (error) {

      setErrorMessage(
        error?.message ||
        "Failed to create consumption"
      );

      setErrorModel(true);
    }
  };


  /* =========================================================
     CONSUMPTION UPDATE
     
     API:
     PUT /project-consumption/:id/entry
     
     We send the complete selected entries.
  ========================================================= */

  const updateConsumption = async () => {

    const payload =
      prepareConsumptionPayload();


    try {

      const res =
        await dispatch(
          ProjectConsumptionEntryUpdate({
            id: recordId,
            payload,
          })
        ).unwrap();


      setSuccessMessage(
        res?.message ||
        "Consumption Updated Successfully!"
      );

      setSuccessModel(true);

    } catch (error) {

      setErrorMessage(
        error?.message ||
        "Failed to update consumption"
      );

      setErrorModel(true);
    }
  };


  /* =========================================================
     CONFIRM ACTION
     
     IMPORTANT:
     This is where the old code was hardcoded to Forecast.
     
     Now:
     
     Forecast Create    -> ForcastPost
     Forecast Update    -> ForcastUpdate
     Consumption Create -> ProjectConsumptionPost
     Consumption Update -> ProjectConsumptionEntryUpdate
  ========================================================= */

  const handleConfirmAction = async () => {

    setConfirm(false);


    /* =======================================================
       CONSUMPTION
    ======================================================= */

    if (isConsumption) {

      if (isEdit) {

        await updateConsumption();

      } else {

        await createConsumption();
      }

      return;
    }


    /* =======================================================
       FORECAST
    ======================================================= */

    if (isForecast) {

      if (isEdit) {

        await updateForecast();

      } else {

        await createForecast();
      }

      return;
    }
  };


  /* =========================================================
     FRAMER MOTION
  ========================================================= */

  const containerVariants = {

    hidden: {
      opacity: 0,
    },

    visible: {

      opacity: 1,

      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };


  const itemVariants = {

    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {

      opacity: 1,
      y: 0,

      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };


  /* =========================================================
     UI
  ========================================================= */

  return (

    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8"
    >

      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">


        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-8"
        >

          <div className="flex flex-col">

            <div className="flex items-center gap-5">

              <button
                onClick={() =>
                  navigate(-1)
                }
                className="p-3 text-[#0062a0] hover:bg-blue-50 rounded-2xl transition-all cursor-pointer"
              >
                <ArrowLeft
                  size={24}
                />
              </button>


              <h1 className="text-2xl font-bold text-slate-800">

                {isEdit
                  ? viewerConfig.editTitle
                  : viewerConfig.editorTitle}

              </h1>

            </div>

          </div>

        </motion.div>


        {/* =================================================
            MAIN FORM
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">


          {/* CUSTOMER */}

          <motion.div
            variants={itemVariants}
          >

            <ReUsableInput_Fields

              label="Customer Name"

              name="customerId"

              type="select"

              options={[
                {
                  label:
                    "Select Customer",
                  value: "",
                },

                ...forcastData.map(
                  (item) => ({
                    label:
                      item?.companyName ||
                      item?.customerName ||
                      item?.customerId ||
                      "Customer",

                    value:
                      item?._id,
                  })
                ),
              ]}

              value={
                formData.customerId
              }

              onChange={
                handleChange
              }

              disabled={isEdit}

            />

          </motion.div>


          {/* PROJECT */}

          <motion.div
            variants={itemVariants}
          >

            <ReUsableInput_Fields

              label="Project Name"

              name="projectId"

              type="select"

              options={[
                {
                  label:
                    "Select Project",
                  value: "",
                },

                ...projectList.map(
                  (item) => ({
                    label:
                      item?.projectName ||
                      item?.projectId ||
                      "Project",

                    value:
                      item?._id,
                  })
                ),
              ]}

              value={
                formData.projectId
              }

              onChange={
                handleChange
              }

              disabled={
                !formData.customerId ||
                isEdit
              }

            />

          </motion.div>


          {/* BOM */}

          <motion.div
            variants={itemVariants}
          >

            <ReUsableInput_Fields

              label="BOM ID"

              name="bomId"

              type="select"

              options={[
                {
                  label:
                    "Select Bom",
                  value: "",
                },

                ...bomList.map(
                  (item) => ({
                    label:
                      item?.bomName ||
                      item?.bomId ||
                      "BOM",

                    value:
                      item?._id,
                  })
                ),
              ]}

              value={
                formData.bomId
              }

              onChange={
                handleChange
              }

              disabled={
                !formData.customerId ||
                !formData.projectId ||
                isEdit
              }

            />

          </motion.div>

        </div>


        {/* =================================================
            BOM DETAILS
        ================================================= */}

        {
          bomDetails &&
          bomDetails.items &&
          bomDetails.items.length > 0 && (

            <motion.div
              variants={itemVariants}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
            >

              <div className="flex items-center gap-2 mb-4">

                <Package
                  className="w-5 h-5 text-[#0062a0]"
                />

                <h3 className="text-lg font-semibold text-[#0062a0]">
                  BOM Item List
                </h3>

              </div>


              <div className="overflow-x-auto">

                <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-sm">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Item Name
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-200">

                    {bomDetails.items.map(
                      (item, index) => (

                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >

                          <td className="px-4 py-3 text-sm text-gray-800">

                            {
                              typeof item.itemId ===
                                "object"

                                ? item.itemId?.itemName ||
                                item.itemId?.partNumber ||
                                "-"

                                : item.itemId ||
                                "-"
                            }

                          </td>


                          <td className="px-4 py-3 text-sm text-gray-800">

                            {item.quantity}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </motion.div>
          )
        }


        {/* =================================================
            MONTH SECTION
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="mt-12"
        >

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-2xl font-bold text-[#0062a0]">

              {viewerConfig.title} Month

            </h2>


            <div className="text-sm text-gray-500">

              {
                forecastRows.filter(
                  (row) =>
                    row.month &&
                    row.quantity
                ).length
              }

              /

              {forecastRows.length}

              {" "}

              Months filled

            </div>

          </div>


          <div className="space-y-4">

            <AnimatePresence
              mode="popLayout"
            >

              {forecastRows.map(
                (row, index) => (

                  <motion.div
                    key={row.id}
                    layout
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full"
                  >


                    {/* MONTH */}

                    <div className="flex-1 w-full">

                      <div className="relative">

                        <label className="block text-sm font-medium text-gray-700 pb-2">

                          {viewerConfig.monthLabel}

                          {" "}

                          {index + 1}

                        </label>


                        <input

                          type="month"

                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0062a0] focus:border-transparent transition-all"

                          value={
                            row.rawMonth ||
                            ""
                          }

                          onChange={(e) =>
                            handleMonthChange(
                              row.id,
                              e.target.value
                            )
                          }

                        />

                      </div>

                    </div>


                    {/* QUANTITY */}

                    <div className="flex-1 w-full">

                      <ReUsableInput_Fields

                        label={
                          viewerConfig.quantityLabel
                        }

                        type="number"

                        placeholder="Enter quantity"

                        value={
                          row.quantity
                        }

                        onChange={(e) =>
                          handleRowChange(
                            row.id,
                            "quantity",
                            e.target.value
                          )
                        }

                        min="1"

                      />

                    </div>


                    {/* ROW BUTTONS */}

                    <div className="flex items-center gap-3 pb-1.5 h-full">

                      {
                        index ===
                          forecastRows.length - 1 &&
                          forecastRows.length < 6 ? (

                          <button

                            type="button"

                            onClick={
                              handleAddRow
                            }

                            className="p-3 bg-[#e6f4ff] text-[#0062a0] rounded-xl hover:bg-blue-100 transition-all active:scale-90"

                            title="Add more month"
                          >

                            <Plus
                              size={24}
                              strokeWidth={3}
                            />

                          </button>

                        ) : (

                          index ===
                          forecastRows.length - 1 && (

                            <div className="w-[52px]" />

                          )
                        )
                      }


                      {
                        forecastRows.length > 1 && (

                          <button

                            type="button"

                            onClick={() =>
                              handleRemoveRow(
                                row.id
                              )
                            }

                            className="p-3 bg-[#e6f4ff] text-slate-800 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"

                            title="Remove month"
                          >

                            <Trash2
                              size={24}
                            />

                          </button>
                        )
                      }

                    </div>

                  </motion.div>

                )
              )}

            </AnimatePresence>

          </div>

        </motion.div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-6 justify-end mt-16 mb-4"
        >

          <Button

            onClick={
              handleSubmitInit
            }

            variant="primary"

            disabled={
              !formData.projectId ||
              !formData.bomId ||
              isLoading
            }

          >

            {isLoading ? (

              <div className="flex items-center gap-2">

                <Loader
                  className="w-4 h-4 animate-spin"
                />

                {
                  isEdit
                    ? "Updating..."
                    : "Creating..."
                }

              </div>

            ) : (

              isEdit
                ? viewerConfig.updateLabel
                : viewerConfig.createLabel

            )}

          </Button>

        </motion.div>

      </div>


      {/* =================================================
          CONFIRMATION POPUP
      ================================================= */}

      <Confirmation_Popup

        isOpen={
          confirm
        }

        onClose={() =>
          setConfirm(false)
        }

        onConfirm={
          handleConfirmAction
        }

        message={
          `Are you sure you want to ${isEdit
            ? "Update"
            : "Create"
          } ${viewerConfig.title}?`
        }

      />


      {/* =================================================
          SUCCESS POPUP
      ================================================= */}

      <Success_Popup

        isOpen={
          successModel
        }

        onClose={() =>
          setSuccessModel(false)
        }

        message={
          successMessage
        }

      />


      {/* =================================================
          ERROR POPUP
      ================================================= */}

      <ErrorMessage_Popup

        isOpen={
          errorModel
        }

        onClose={() =>
          setErrorModel(false)
        }

        message={
          errorMessage
        }

      />

    </motion.div>
  );
};


export default ForCast_Editor;