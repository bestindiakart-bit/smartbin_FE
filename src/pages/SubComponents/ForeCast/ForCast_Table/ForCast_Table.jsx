// import { motion } from 'framer-motion';
// import { ChevronDown } from 'lucide-react';
// import { useEffect, useState, useMemo } from 'react';
// import Download_Button from '../../../../component/button/Download_Button';
// import Success_Popup from '../../../../component/Popup_Models/Success_Popup';
// import ErrorMessage_Popup from '../../../../component/Popup_Models/ErrorMessage_Popup';
// import Confirmation_Popup from '../../../../component/Popup_Models/Confirmation_Popup';
// import SearchBar from '../../../../component/SearchBar/SearchBar';
// import ReUsable_Table from '../../../../component/Table/ReUsable_Table';
// import Button from '../../../../component/button/Buttons';
// import { useNavigate } from 'react-router-dom';
// import {fetchPermissions} from "../../../../store/Permission_Store/Permission_Slice"
// import { 
//   ForcastGet, 
//   ForcastDelete, 
//   clearForecastDeleteResult 
// } from '../../../../store/Api_slice/Forecast_Slice';
// import { useDispatch, useSelector } from 'react-redux';
// import ForCast_FullViewModel from './ForCast_FullViewModel';

// const ForCast_Table = () => {
//   const [successModel, setSuccessModel] = useState(false);
//   const [errorModel, setErrorModel] = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);
//   const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [isOpenSmartModel, setIsOpenSmartModel] = useState(false);

//   const { permissions } = useSelector((state) => state.permissions);
//   const userPermissions = permissions[10] || {};

//   // Define permission checks
//   const canView = userPermissions?.view || false;
//   const canEdit = userPermissions?.edit || false;
//   const canDelete = userPermissions?.delete || false;
//   const canCreate = userPermissions?.create || false;

//   useEffect(() => {
//     dispatch(fetchPermissions());
//   }, [dispatch]);

//   const { 
//     forecastGet, 
//     forecastDeleteResult, 
//     forecastDeleteError, 
//     deleteLoading 
//   } = useSelector((state) => state.forecast);

//   // Maps API data to the 4 columns for the table
//   const ForcastData = forecastGet?.data?.map((item) => ({
//     id: item._id, 
//     forecastId: item.forecastId,
//     companyName: item.customerId?.companyName || "-",
//     projectName: item.projectId?.projectName || "-",
//     bomName: item.bomId?.bomName || "-",
//     projectId: item.projectId?._id || item.projectId,
//   })) || [];

//   // Client-side filtering based on search query
//   const filteredData = useMemo(() => {
//     if (!searchQuery.trim()) return ForcastData;
//     const query = searchQuery.toLowerCase();
//     return ForcastData.filter(
//       (item) =>
//         item.forecastId?.toLowerCase().includes(query) ||
//         item.companyName?.toLowerCase().includes(query) ||
//         item.projectName?.toLowerCase().includes(query) ||
//         item.bomName?.toLowerCase().includes(query)
//     );
//   }, [searchQuery, ForcastData]);

//   // Fetch forecasts on component mount
//   useEffect(() => {
//     dispatch(ForcastGet());
//   }, [dispatch]);

//   // Handle delete response
//   useEffect(() => {
//     if (forecastDeleteResult?.success === true) {
//       setDeleteSuccessMessage(forecastDeleteResult?.message || "Forecast deleted successfully!");
//       setSuccessModel(true);
//       dispatch(clearForecastDeleteResult());
//       // Refresh the table data
//       dispatch(ForcastGet());
//       // Clear selected row for delete
//       setSelectedRowForDelete(null);
//       setConfirmDelete(false);
//       // Clear selected rows
//       setSelectedRows([]);
//     }
//   }, [forecastDeleteResult, dispatch]);

//   // Handle delete error
//   useEffect(() => {
//     if (forecastDeleteError) {
//       setErrorMessage(forecastDeleteError?.message || "Failed to delete forecast");
//       setErrorModel(true);
//       dispatch(clearForecastDeleteResult());
//       setSelectedRowForDelete(null);
//       setConfirmDelete(false);
//     }
//   }, [forecastDeleteError, dispatch]);

//   // Auto-close success popup
//   useEffect(() => {
//     if (successModel) {
//       const timer = setTimeout(() => {
//         setSuccessModel(false);
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [successModel]);

//   // Auto-close error popup
//   useEffect(() => {
//     if (errorModel) {
//       const timer = setTimeout(() => {
//         setErrorModel(false);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [errorModel]);

//   const columns = [
//     { header: 'Forecast Id', key: 'forecastId' },
//     { header: 'Customer', key: 'companyName' },
//     { header: 'Project', key: 'projectName' },
//     { header: 'BOM', key: 'bomName' },
//   ];

//   const handleSelectionChange = (selectedIds) => {
//     setSelectedRows(selectedIds);
//   };

//   const handleSearchChange = (value) => {
//     setSearchQuery(value);
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, scale: 0.98 },
//     visible: { opacity: 1, scale: 1 }
//   };

//   const handleDelete = (row) => {
//     console.log("Delete target:", row);
//     setSelectedRowForDelete(row);
//     setConfirmDelete(true);
//   };

//   const handleConfirmDelete = () => {
//     if (selectedRowForDelete) {
//       dispatch(ForcastDelete(selectedRowForDelete.id));
//     }
//   };

//   const handleEdit = (row) => {
//     navigate("/forecast-viewer/forecast-editor", { 
//       state: { rowId: row.id, mode: "edit", projectId: row.projectId } 
//     });
//   };

//   // Navigates to view page with Row ID to fetch full data (including projectForecast)
//   const handleView = (row) => {
//     navigate("/forecast-viewer/view", { state: { rowId: row.id } });
//   };

//   // Handle bulk delete
//   const handleBulkDelete = () => {
//     if (!canDelete) {
//       setErrorMessage("You don't have permission to delete forecasts");
//       setErrorModel(true);
//       return;
//     }
//     if (selectedRows.length === 0) {
//       setErrorMessage("Please select forecasts to delete");
//       setErrorModel(true);
//       return;
//     }
//     setConfirmDelete(true);
//     // For bulk delete, we'll handle it differently
//     setSelectedRowForDelete({ id: selectedRows, isBulk: true });
//   };

//   const handleConfirmBulkDelete = async () => {
//     if (selectedRowForDelete?.isBulk) {
//       try {
//         // Delete each selected forecast
//         for (const id of selectedRowForDelete.id) {
//           await dispatch(ForcastDelete(id)).unwrap();
//         }
//         setDeleteSuccessMessage(`${selectedRowForDelete.id.length} forecast(s) deleted successfully!`);
//         setSuccessModel(true);
//         dispatch(ForcastGet());
//         setSelectedRows([]);
//         setSelectedRowForDelete(null);
//         setConfirmDelete(false);
//       } catch (err) {
//         setErrorMessage("Failed to delete some forecasts");
//         setErrorModel(true);
//         setSelectedRowForDelete(null);
//         setConfirmDelete(false);
//       }
//     }
//   };

//   return (
//     <motion.div 
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//       className="min-h-screen bg-[#fcfdfe] font-sans text-slate-800"
//     >
//       <div className="">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Forecast <span className='text-2xl font-bold text-[#0062a0]'>Viewer</span></h1>
//             <p className="text-[#0062a0] font-medium mt-1">
//               Manage and monitor forecasts
//             </p>
//           </div>
//           <Button
//             disabled={!canView}
//             variant="secondary"
//             onClick={() => setIsOpenSmartModel(true)}
//           >
//             Full View
//           </Button>
//           <Button 
//             disabled={!canCreate}
//             variant="primary"
//             onClick={() => navigate('/forecast-viewer/forecast-editor')}
//           >
//             + Create Forecast
//           </Button>
//         </div>

//         <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-end gap-3 mb-6">
//           <FilterDropdown label="Customer" options={[]} />
//           <FilterDropdown label="Project" options={[]} />
//           <FilterDropdown label="Item Name" options={[]} />
//           <Download_Button disabled={!canView} onClick={() => setSuccessModel(true)} />
//         </motion.div>

//         <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="max-w-md w-full">
//               <SearchBar 
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 placeholder="Search by Forecast ID, Customer, Project, or BOM..."
//               />
//             </div>
//             <div className="flex items-center gap-3">
//               {selectedRows.length > 0 && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   className="flex items-center gap-3"
//                 >
//                   <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">
//                     {selectedRows.length} Item(s) Selected
//                   </span>
//                   {canDelete && (
//                     <button
//                       onClick={handleBulkDelete}
//                       className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
//                     >
//                       Delete Selected
//                     </button>
//                   )}
//                 </motion.div>
//               )}
//             </div>
//           </div>
//           <div className="p-0">
//             <ReUsable_Table
//               columns={columns} 
//               data={filteredData}
//               showToggle={false}
//               showActions={true}
//               selectedRows={selectedRows}
//               onSelectionChange={handleSelectionChange}
//               onEdit={canEdit ? handleEdit : undefined}
//               onDelete={canDelete ? handleDelete : undefined}
//               onView={canView ? handleView : undefined}
//               ActionChildren="Actions"
//               onRowClick={(row) => canView && handleView(row)}
//             />
//           </div>
//         </motion.div>
//       </div>

//       {/* Confirmation Popup for Delete */}
//       <Confirmation_Popup
//         isOpen={confirmDelete}
//         onClose={() => {
//           setConfirmDelete(false);
//           setSelectedRowForDelete(null);
//         }}
//         onConfirm={selectedRowForDelete?.isBulk ? handleConfirmBulkDelete : handleConfirmDelete}
//         message={
//           selectedRowForDelete?.isBulk
//             ? `Are you sure you want to delete ${selectedRowForDelete.id.length} selected forecast(s)?`
//             : `Are you sure you want to delete forecast ${selectedRowForDelete?.forecastId || ''}?`
//         }
//         title="Confirm Delete"
//         loading={deleteLoading}
//       />

//       {/* Success Popup */}
//       <Success_Popup
//         isOpen={successModel}
//         onClose={() => setSuccessModel(false)}
//         message={deleteSuccessMessage}
//       />

//       {/* Error Popup */}
//       <ErrorMessage_Popup
//         isOpen={errorModel}
//         onClose={() => setErrorModel(false)}
//         message={errorMessage}
//         title="Operation Failed"
//         btnText="Close"
//       />

//       {/* Full View Modal - Moved outside FilterDropdown */}
//       <ForCast_FullViewModel 
//         isOpen={isOpenSmartModel} 
//         onClose={() => setIsOpenSmartModel(false)} 
//       />

//       {/* <ForCast_FullViewModel 
//   isOpen={isOpenSmartModel} 
//   onClose={() => setIsOpenSmartModel(false)}
//   showRequiredColumn={true}  // Set to false to hide Required column
//   enableCustomerGrouping={true}  // Set to false to show flat table without grouping
//   customLabels={{
//     title: "Forecast",
//     subtitle: "Viewer",
//     requiredColumn: "Required (Monthly Breakdown)",
//     m1: "M1",
//     m2: "M2",
//     m3: "M3",
//     m4: "M4",
//     m5: "M5",
//     m6: "M6"
//   }}
//   onRowClick={(row) => {
//     console.log("Row clicked:", row);
//     // Handle row click
//   }}
// /> */}
//     </motion.div>
//   );
// };

// const FilterDropdown = ({ label, options }) => {
//   return (
//     <div className="relative group min-w-[130px]">
//       <button className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-[#0062a0] hover:border-[#0062a0] transition-all">
//         {label}
//         <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
//       </button>

//       <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
//         {options && options.length > 0 ? (
//           options.map((opt, i) => (
//             <div key={i} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-[#e6f4ff] hover:text-[#0062a0] cursor-pointer transition-colors border-b last:border-0 border-slate-50">
//               {opt}
//             </div>
//           ))
//         ) : (
//           <div className="px-4 py-2.5 text-sm text-slate-400 text-center">
//             No options
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ForCast_Table;

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import Download_Button from "../../../../component/button/Download_Button";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import Button from "../../../../component/button/Buttons";

import {
    useMatches,
    useNavigate,
} from "react-router-dom";

import {
    ForcastGet,
    ForcastDelete,

    ProjectConsumptionGet,
    ProjectConsumptionDelete,

    clearForecastDeleteResult,
    clearProjectConsumptionDeleteResult,
} from "../../../../store/Api_slice/Forecast_Slice";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";

import ForCast_FullViewModel from "./ForCast_FullViewModel";

/*
|--------------------------------------------------------------------------
| Viewer Configuration
|--------------------------------------------------------------------------
*/

const VIEWER_CONFIG = {
    forecast: {
        viewerType: "forecast",

        title: "Forecast",

        description:
            "Manage and monitor forecasts",

        apiEndpoint: "/forecast",

        idLabel: "Forecast Id",

        createLabel:
            "Create Forecast",

        searchPlaceholder:
            "Search by Forecast ID, Customer, Project, or BOM...",

        deletedMessage:
            "Forecast deleted successfully!",

        deleteErrorMessage:
            "Failed to delete forecast",

        bulkDeleteConfirm:
            "Are you sure you want to delete {count} selected forecast(s)?",

        deleteConfirm:
            "Are you sure you want to delete forecast {id}?",
    },

    consumption: {
        viewerType: "consumption",

        title: "Consumption",

        description:
            "Manage and monitor consumption",

        apiEndpoint:
            "/project-consumption",

        idLabel:
            "Consumption Id",

        createLabel:
            "Create Consumption",

        searchPlaceholder:
            "Search by Consumption ID, Customer, Project, or BOM...",

        deletedMessage:
            "Consumption deleted successfully!",

        deleteErrorMessage:
            "Failed to delete consumption",

        bulkDeleteConfirm:
            "Are you sure you want to delete {count} selected consumption(s)?",

        deleteConfirm:
            "Are you sure you want to delete consumption {id}?",
    },
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

const ForCast_Table = () => {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const matches = useMatches();

    /*
     * ---------------------------------------------------------------
     * Local State
     * ---------------------------------------------------------------
     */

    const [successModel, setSuccessModel] =
        useState(false);

    const [errorModel, setErrorModel] =
        useState(false);

    const [confirmDelete, setConfirmDelete] =
        useState(false);

    const [selectedRowForDelete, setSelectedRowForDelete] =
        useState(null);

    const [deleteSuccessMessage, setDeleteSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [selectedRows, setSelectedRows] =
        useState([]);

    const [searchQuery, setSearchQuery] =
        useState("");

    const [isOpenSmartModel, setIsOpenSmartModel] =
        useState(false);

    /*
     * ---------------------------------------------------------------
     * Viewer Type
     * ---------------------------------------------------------------
     */

    const getViewerTypeFromMatches = () => {
        const routeViewerType = matches
            .map(
                (match) =>
                    match.handle?.viewerType
            )
            .find(Boolean);

        if (
            routeViewerType &&
            VIEWER_CONFIG[routeViewerType]
        ) {
            return routeViewerType;
        }

        const pathname =
            matches[
                matches.length - 1
            ]?.pathname ||
            window.location.pathname;

        if (
            pathname.startsWith(
                "/consumption-viewer"
            )
        ) {
            return "consumption";
        }

        return "forecast";
    };

    const viewerType =
        getViewerTypeFromMatches();

    const viewerConfig =
        VIEWER_CONFIG[viewerType];

    /*
     * ---------------------------------------------------------------
     * Permissions
     * ---------------------------------------------------------------
     */

    const {
        permissions,
    } = useSelector(
        (state) => state.permissions
    );

    const userPermissions =
        permissions?.[10] || {};

    const canView =
        userPermissions?.view || false;

    const canEdit =
        userPermissions?.edit || false;

    const canDelete =
        userPermissions?.delete || false;

    const canCreate =
        userPermissions?.create || false;

    /*
     * ---------------------------------------------------------------
     * Redux
     * ---------------------------------------------------------------
     */

    const forecastState =
        useSelector(
            (state) => state.forecast
        );

    const {
        forecastGet,

        forecastDeleteResult,
        forecastDeleteError,
        deleteLoading,

        projectConsumption,

        projectConsumptionDeleteResult,
        projectConsumptionDeleteError,

        projectConsumptionDeleteLoading,
    } = forecastState;

    /*
     * ---------------------------------------------------------------
     * Fetch Permissions
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        dispatch(fetchPermissions());
    }, [dispatch]);

    /*
     * ---------------------------------------------------------------
     * Fetch Viewer Data
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        /*
         * Forecast
         */
        if (viewerType === "forecast") {
            dispatch(
                ForcastGet({
                    endpoint:
                        "/forecast",
                })
            );

            return;
        }

        /*
         * Consumption
         */
        if (viewerType === "consumption") {
            dispatch(
                ProjectConsumptionGet()
            );
        }
    }, [
        dispatch,
        viewerType,
    ]);

    /*
     * ---------------------------------------------------------------
     * Normalize API Data
     * ---------------------------------------------------------------
     */

    const viewerData = useMemo(() => {
        /*
         * =============================================================
         * FORECAST
         * =============================================================
         */

        if (viewerType === "forecast") {
            const data =
                forecastGet?.data;

            if (!Array.isArray(data)) {
                return [];
            }

            return data.map((item) => ({
                id:
                    item?._id,

                forecastId:
                    item?.forecastId || "-",

                consumptionId:
                    "-",

                companyName:
                    item?.customerId
                        ?.companyName || "-",

                projectName:
                    item?.projectId
                        ?.projectName || "-",

                bomName:
                    item?.bomId
                        ?.bomName || "-",

                projectId:
                    item?.projectId?._id ||
                    item?.projectId ||
                    "",
            }));
        }

        /*
         * =============================================================
         * CONSUMPTION
         * =============================================================
         */

        if (viewerType === "consumption") {
            const data =
                projectConsumption?.data;

            if (!Array.isArray(data)) {
                return [];
            }

            return data.map((item) => ({
                id:
                    item?._id,

                forecastId:
                    "-",

                consumptionId:
                    item?.consumptionId ||
                    item?.projectConsumptionId ||
                    item?.id ||
                    "-",

                customerName:
                    item?.customerId
                        ?.customerName ||
                    item?.customerId?.customerName ||
                    "-",

                projectName:
                    item?.projectId
                        ?.projectName ||
                    item?.project?.projectName ||
                    "-",

                bomName:
                    item?.bomId
                        ?.bomName ||
                    item?.bom?.bomName ||
                    "-",

                projectId:
                    item?.projectId?._id ||
                    item?.projectId ||
                    "",
            }));
        }

        return [];
    }, [
        viewerType,
        forecastGet,
        projectConsumption,
    ]);

    /*
     * ---------------------------------------------------------------
     * Search
     * ---------------------------------------------------------------
     */

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) {
            return viewerData;
        }

        const query =
            searchQuery
                .toLowerCase()
                .trim();

        return viewerData.filter(
            (item) =>
                item.forecastId
                    ?.toLowerCase()
                    .includes(query) ||

                item.consumptionId
                    ?.toLowerCase()
                    .includes(query) ||

                item.companyName
                    ?.toLowerCase()
                    .includes(query) ||

                item.projectName
                    ?.toLowerCase()
                    .includes(query) ||

                item.bomName
                    ?.toLowerCase()
                    .includes(query)
        );
    }, [
        searchQuery,
        viewerData,
    ]);

    /*
     * ---------------------------------------------------------------
     * Delete Result - Forecast
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        if (
            viewerType !== "forecast"
        ) {
            return;
        }

        if (
            forecastDeleteResult?.success === true
        ) {
            setDeleteSuccessMessage(
                forecastDeleteResult?.message ||
                    viewerConfig.deletedMessage
            );

            setSuccessModel(true);

            dispatch(
                clearForecastDeleteResult()
            );

            /*
             * Refresh Forecast
             */
            dispatch(
                ForcastGet({
                    endpoint:
                        "/forecast",
                })
            );

            setSelectedRowForDelete(null);

            setConfirmDelete(false);

            setSelectedRows([]);
        }
    }, [
        forecastDeleteResult,
        viewerType,
        viewerConfig.deletedMessage,
        dispatch,
    ]);

    /*
     * ---------------------------------------------------------------
     * Delete Error - Forecast
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        if (
            viewerType !== "forecast"
        ) {
            return;
        }

        if (forecastDeleteError) {
            setErrorMessage(
                forecastDeleteError?.message ||
                    viewerConfig.deleteErrorMessage
            );

            setErrorModel(true);

            dispatch(
                clearForecastDeleteResult()
            );

            setSelectedRowForDelete(null);

            setConfirmDelete(false);
        }
    }, [
        forecastDeleteError,
        viewerType,
        viewerConfig.deleteErrorMessage,
        dispatch,
    ]);

    /*
     * ---------------------------------------------------------------
     * Delete Result - Consumption
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        if (
            viewerType !== "consumption"
        ) {
            return;
        }

        if (
            projectConsumptionDeleteResult?.success === true
        ) {
            setDeleteSuccessMessage(
                projectConsumptionDeleteResult?.message ||
                    viewerConfig.deletedMessage
            );

            setSuccessModel(true);

            dispatch(
                clearProjectConsumptionDeleteResult()
            );

            /*
             * Refresh Consumption
             */
            dispatch(
                ProjectConsumptionGet()
            );

            setSelectedRowForDelete(null);

            setConfirmDelete(false);

            setSelectedRows([]);
        }
    }, [
        projectConsumptionDeleteResult,
        viewerType,
        viewerConfig.deletedMessage,
        dispatch,
    ]);

    /*
     * ---------------------------------------------------------------
     * Delete Error - Consumption
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        if (
            viewerType !== "consumption"
        ) {
            return;
        }

        if (
            projectConsumptionDeleteError
        ) {
            setErrorMessage(
                projectConsumptionDeleteError?.message ||
                    viewerConfig.deleteErrorMessage
            );

            setErrorModel(true);

            dispatch(
                clearProjectConsumptionDeleteResult()
            );

            setSelectedRowForDelete(null);

            setConfirmDelete(false);
        }
    }, [
        projectConsumptionDeleteError,
        viewerType,
        viewerConfig.deleteErrorMessage,
        dispatch,
    ]);

    /*
     * ---------------------------------------------------------------
     * Success Popup Auto Close
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        if (!successModel) {
            return;
        }

        const timer =
            setTimeout(() => {
                setSuccessModel(false);
            }, 2000);

        return () => {
            clearTimeout(timer);
        };
    }, [successModel]);

    /*
     * ---------------------------------------------------------------
     * Error Popup Auto Close
     * ---------------------------------------------------------------
     */

    useEffect(() => {
        if (!errorModel) {
            return;
        }

        const timer =
            setTimeout(() => {
                setErrorModel(false);
            }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [errorModel]);

    /*
     * ---------------------------------------------------------------
     * Columns
     * ---------------------------------------------------------------
     */

    const columns =
        viewerType === "consumption"
            ? [
                  {
                      header:
                          "Consumption Id",
                      key:
                          "consumptionId",
                  },
                  {
                      header:
                          "Customer",
                      key:
                          "customerName",
                  },
                  {
                      header:
                          "Project",
                      key:
                          "projectName",
                  },
                  {
                      header:
                          "BOM",
                      key:
                          "bomName",
                  },
              ]
            : [
                  {
                      header:
                          "Forecast Id",
                      key:
                          "forecastId",
                  },
                  {
                      header:
                          "Customer",
                      key:
                          "companyName",
                  },
                  {
                      header:
                          "Project",
                      key:
                          "projectName",
                  },
                  {
                      header:
                          "BOM",
                      key:
                          "bomName",
                  },
              ];

    /*
     * ---------------------------------------------------------------
     * Selection
     * ---------------------------------------------------------------
     */

    const handleSelectionChange = (
        selectedIds
    ) => {
        setSelectedRows(
            selectedIds
        );
    };

    /*
     * ---------------------------------------------------------------
     * Search
     * ---------------------------------------------------------------
     */

    const handleSearchChange = (
        value
    ) => {
        setSearchQuery(value);
    };

    /*
     * ---------------------------------------------------------------
     * Delete
     * ---------------------------------------------------------------
     */

    const handleDelete = (row) => {
        setSelectedRowForDelete(row);

        setConfirmDelete(true);
    };

    /*
     * ---------------------------------------------------------------
     * Confirm Single Delete
     * ---------------------------------------------------------------
     */

    const handleConfirmDelete = () => {
        if (!selectedRowForDelete) {
            return;
        }

        /*
         * Forecast
         */
        if (
            viewerType === "forecast"
        ) {
            dispatch(
                ForcastDelete(
                    selectedRowForDelete.id
                )
            );

            return;
        }

        /*
         * Consumption
         */
        if (
            viewerType === "consumption"
        ) {
            dispatch(
                ProjectConsumptionDelete(
                    selectedRowForDelete.id
                )
            );
        }
    };

    /*
     * ---------------------------------------------------------------
     * Edit
     * ---------------------------------------------------------------
     */

    const handleEdit = (row) => {
        const basePath =
            viewerType === "consumption"
                ? "consumption-viewer"
                : "forecast-viewer";

        const editorPath =
            viewerType === "consumption"
                ? "consumption-editor"
                : "forecast-editor";

        navigate(
            `/${basePath}/${editorPath}`,
            {
                state: {
                    rowId:
                        row.id,

                    mode:
                        "edit",

                    projectId:
                        row.projectId,
                },
            }
        );
    };

    /*
     * ---------------------------------------------------------------
     * View
     * ---------------------------------------------------------------
     */

    const handleView = (row) => {
        const basePath =
            viewerType === "consumption"
                ? "consumption-viewer"
                : "forecast-viewer";

        navigate(
            `/${basePath}/view`,
            {
                state: {
                    rowId:
                        row.id,
                },
            }
        );
    };

    /*
     * ---------------------------------------------------------------
     * Bulk Delete
     * ---------------------------------------------------------------
     */

    const handleBulkDelete = () => {
        if (!canDelete) {
            setErrorMessage(
                `You don't have permission to delete ${viewerConfig.title.toLowerCase()}s`
            );

            setErrorModel(true);

            return;
        }

        if (
            selectedRows.length === 0
        ) {
            setErrorMessage(
                `Please select ${viewerConfig.title.toLowerCase()}s to delete`
            );

            setErrorModel(true);

            return;
        }

        setConfirmDelete(true);

        setSelectedRowForDelete({
            id:
                selectedRows,

            isBulk:
                true,
        });
    };

    /*
     * ---------------------------------------------------------------
     * Bulk Delete Confirm
     * ---------------------------------------------------------------
     */

    const handleConfirmBulkDelete =
        async () => {
            if (
                !selectedRowForDelete?.isBulk
            ) {
                return;
            }

            try {
                for (
                    const id of
                    selectedRowForDelete.id
                ) {
                    if (
                        viewerType ===
                        "forecast"
                    ) {
                        await dispatch(
                            ForcastDelete(id)
                        ).unwrap();
                    }

                    if (
                        viewerType ===
                        "consumption"
                    ) {
                        await dispatch(
                            ProjectConsumptionDelete(
                                id
                            )
                        ).unwrap();
                    }
                }

                setDeleteSuccessMessage(
                    `${selectedRowForDelete.id.length} ${viewerConfig.title.toLowerCase()}(s) deleted successfully!`
                );

                setSuccessModel(true);

                /*
                 * Refresh
                 */
                if (
                    viewerType ===
                    "forecast"
                ) {
                    dispatch(
                        ForcastGet({
                            endpoint:
                                "/forecast",
                        })
                    );
                } else {
                    dispatch(
                        ProjectConsumptionGet()
                    );
                }

                setSelectedRows([]);

                setSelectedRowForDelete(
                    null
                );

                setConfirmDelete(
                    false
                );
            } catch (error) {
                console.error(
                    "Bulk delete error:",
                    error
                );

                setErrorMessage(
                    `Failed to delete some ${viewerConfig.title.toLowerCase()}s`
                );

                setErrorModel(true);

                setSelectedRowForDelete(
                    null
                );

                setConfirmDelete(
                    false
                );
            }
        };

    /*
     * ---------------------------------------------------------------
     * Animation
     * ---------------------------------------------------------------
     */

    const containerVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },

        visible: {
            opacity: 1,
            y: 0,

            transition: {
                duration: 0.5,
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            scale: 0.98,
        },

        visible: {
            opacity: 1,
            scale: 1,
        },
    };

    /*
     * ---------------------------------------------------------------
     * Return
     * ---------------------------------------------------------------
     */

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[#fcfdfe] font-sans text-slate-800"
        >
            <div>

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="flex items-center justify-between mb-8">

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {viewerConfig.title}

                            <span className="text-2xl font-bold text-[#0062a0]">
                                {" "}Viewer
                            </span>
                        </h1>

                        <p className="text-[#0062a0] font-medium mt-1">
                            {viewerConfig.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <Button
                            disabled={!canView}
                            variant="secondary"
                            onClick={() =>
                                setIsOpenSmartModel(
                                    true
                                )
                            }
                        >
                            Full View
                        </Button>

                        <Button
                            disabled={!canCreate}
                            variant="primary"
                            onClick={() => {
                                const basePath =
                                    viewerType ===
                                    "consumption"
                                        ? "consumption-viewer"
                                        : "forecast-viewer";

                                const editorPath =
                                    viewerType ===
                                    "consumption"
                                        ? "consumption-editor"
                                        : "forecast-editor";

                                navigate(
                                    `/${basePath}/${editorPath}`
                                );
                            }}
                        >
                            +{" "}
                            {
                                viewerConfig.createLabel
                            }
                        </Button>

                    </div>
                </div>

                {/* =====================================================
                    FILTERS
                ====================================================== */}

                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-end gap-3 mb-6"
                >
                    <FilterDropdown
                        label="Customer"
                        options={[]}
                    />

                    <FilterDropdown
                        label="Project"
                        options={[]}
                    />

                    <FilterDropdown
                        label="Item Name"
                        options={[]}
                    />

                    <Download_Button
                        disabled={!canView}
                        onClick={() =>
                            setSuccessModel(
                                true
                            )
                        }
                    />
                </motion.div>

                {/* =====================================================
                    TABLE
                ====================================================== */}

                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >

                    <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4">

                        <div className="max-w-md w-full">

                            <SearchBar
                                value={
                                    searchQuery
                                }
                                onChange={
                                    handleSearchChange
                                }
                                placeholder={
                                    viewerConfig.searchPlaceholder
                                }
                            />

                        </div>

                        <div className="flex items-center gap-3">

                            {selectedRows.length >
                                0 && (

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    className="flex items-center gap-3"
                                >

                                    <span className="text-sm font-semibold text-[#0062a0] bg-blue-50 px-4 py-2 rounded-full">
                                        {
                                            selectedRows.length
                                        }{" "}
                                        {
                                            viewerConfig.title
                                        }{" "}
                                        Item(s)
                                        Selected
                                    </span>

                                    {canDelete && (
                                        <button
                                            onClick={
                                                handleBulkDelete
                                            }
                                            className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                                        >
                                            Delete
                                            Selected
                                        </button>
                                    )}

                                </motion.div>
                            )}

                        </div>
                    </div>

                    <div className="p-0">

                        <ReUsable_Table
                            columns={
                                columns
                            }
                            data={
                                filteredData
                            }
                            showToggle={
                                false
                            }
                            showActions={
                                true
                            }
                            selectedRows={
                                selectedRows
                            }
                            onSelectionChange={
                                handleSelectionChange
                            }
                            onEdit={
                                canEdit
                                    ? handleEdit
                                    : undefined
                            }
                            onDelete={
                                canDelete
                                    ? handleDelete
                                    : undefined
                            }
                            onView={
                                canView
                                    ? handleView
                                    : undefined
                            }
                            ActionChildren="Actions"
                            onRowClick={
                                (row) =>
                                    canView &&
                                    handleView(
                                        row
                                    )
                            }
                        />

                    </div>

                </motion.div>
            </div>

            {/* =========================================================
                DELETE CONFIRMATION
            ========================================================== */}

            <Confirmation_Popup
                isOpen={
                    confirmDelete
                }

                onClose={() => {
                    setConfirmDelete(
                        false
                    );

                    setSelectedRowForDelete(
                        null
                    );
                }}

                onConfirm={
                    selectedRowForDelete?.isBulk
                        ? handleConfirmBulkDelete
                        : handleConfirmDelete
                }

                message={
                    selectedRowForDelete?.isBulk

                        ? viewerConfig.bulkDeleteConfirm.replace(
                              "{count}",
                              selectedRowForDelete
                                  .id
                                  .length
                          )

                        : viewerConfig.deleteConfirm.replace(
                              "{id}",
                              viewerType ===
                                  "consumption"
                                  ? selectedRowForDelete?.consumptionId ||
                                    ""
                                  : selectedRowForDelete?.forecastId ||
                                    ""
                          )
                }

                title="Confirm Delete"

                loading={
                    viewerType ===
                    "consumption"
                        ? projectConsumptionDeleteLoading
                        : deleteLoading
                }
            />

            {/* =========================================================
                SUCCESS
            ========================================================== */}

            <Success_Popup
                isOpen={
                    successModel
                }

                onClose={() =>
                    setSuccessModel(
                        false
                    )
                }

                message={
                    deleteSuccessMessage ||
                    viewerConfig.deletedMessage
                }
            />

            {/* =========================================================
                ERROR
            ========================================================== */}

            <ErrorMessage_Popup
                isOpen={
                    errorModel
                }

                onClose={() =>
                    setErrorModel(
                        false
                    )
                }

                message={
                    errorMessage
                }

                title="Operation Failed"

                btnText="Close"
            />

            {/* =========================================================
                FULL VIEW
            ========================================================== */}

            <ForCast_FullViewModel
                isOpen={
                    isOpenSmartModel
                }

                onClose={() =>
                    setIsOpenSmartModel(
                        false
                    )
                }
            />
            {/* <ForCast_FullViewModel 
  isOpen={isOpenSmartModel} 
  onClose={() => setIsOpenSmartModel(false)}
  showRequiredColumn={true}  // Set to false to hide Required column
  enableCustomerGrouping={true}  // Set to false to show flat table without grouping
  customLabels={{
    title: "Forecast",
    subtitle: "Viewer",
    requiredColumn: "Required (Monthly Breakdown)",
    m1: "M1",
    m2: "M2",
    m3: "M3",
    m4: "M4",
    m5: "M5",
    m6: "M6"
  }}
  onRowClick={(row) => {
    console.log("Row clicked:", row);
    // Handle row click
  }}
/> */}

        </motion.div>
    );
};

/*
|--------------------------------------------------------------------------
| Filter Dropdown
|--------------------------------------------------------------------------
*/

const FilterDropdown = ({
    label,
    options,
}) => {
    return (
        <div className="relative group min-w-[130px]">

            <button
                type="button"
                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-[#0062a0] hover:border-[#0062a0] transition-all"
            >
                {label}

                <ChevronDown
                    size={18}
                    className="group-hover:translate-y-0.5 transition-transform"
                />
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">

                {options &&
                options.length > 0 ? (
                    options.map(
                        (
                            opt,
                            index
                        ) => (
                            <div
                                key={
                                    index
                                }
                                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-[#e6f4ff] hover:text-[#0062a0] cursor-pointer transition-colors border-b last:border-0 border-slate-50"
                            >
                                {
                                    opt
                                }
                            </div>
                        )
                    )
                ) : (
                    <div className="px-4 py-2.5 text-sm text-slate-400 text-center">
                        No options
                    </div>
                )}

            </div>
        </div>
    );
};

export default ForCast_Table;