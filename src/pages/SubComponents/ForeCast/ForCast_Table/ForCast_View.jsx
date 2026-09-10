import React, { useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  History,
  ArrowRight,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

import {
  ForcastGet,
  ProjectConsumptionGet,
} from '../../../../store/Api_slice/Forecast_Slice';

import { fetchPermissions } from '../../../../store/Permission_Store/Permission_Slice';

const ForCast_View = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = useMatches();
  const dispatch = useDispatch();

  /* =========================================================
     VIEWER CONFIG
  ========================================================= */

  const VIEWER_CONFIG = {
    forecast: {
      viewerType: 'forecast',
      title: 'Forecast',
      description: 'Manage and monitor forecasts',
      apiEndpoint: '/forecast/',
      idLabel: 'Forecast Id',
      createLabel: 'Create Forecast',
      searchPlaceholder:
        'Search by Forecast ID, Customer, Project, or BOM...',
      deletedMessage: 'Forecast deleted successfully!',
      deleteErrorMessage: 'Failed to delete forecast',
      bulkDeleteConfirm:
        'Are you sure you want to delete {count} selected forecast(s)?',
      deleteConfirm: 'Are you sure you want to delete forecast {id}?',
    },

    consumption: {
      viewerType: 'consumption',
      title: 'Consumption',
      description: 'Manage and monitor consumption',
      apiEndpoint: '/project-consumption/',
      idLabel: 'Consumption Id',
      createLabel: 'Create Consumption',
      searchPlaceholder:
        'Search by Consumption ID, Customer, Project, or BOM...',
      deletedMessage: 'Consumption deleted successfully!',
      deleteErrorMessage: 'Failed to delete consumption',
      bulkDeleteConfirm:
        'Are you sure you want to delete {count} selected consumption(s)?',
      deleteConfirm: 'Are you sure you want to delete consumption {id}?',
    },
  };

  /* =========================================================
     DETECT VIEWER TYPE FROM ROUTE
  ========================================================= */

  const getViewerTypeFromMatches = (routeMatches) => {
    const routeViewerType = routeMatches
      .map((match) => match.handle?.viewerType)
      .find(Boolean);

    if (routeViewerType && VIEWER_CONFIG[routeViewerType]) {
      return routeViewerType;
    }

    const pathname =
      routeMatches[routeMatches.length - 1]?.pathname ||
      window.location.pathname;

    if (pathname.startsWith('/consumption-viewer')) {
      return 'consumption';
    }

    return 'forecast';
  };

  const viewerType = getViewerTypeFromMatches(matches);
  const viewerConfig = VIEWER_CONFIG[viewerType];

  const isConsumption = viewerType === 'consumption';

  /* =========================================================
     PERMISSIONS
  ========================================================= */

  const { permissions } = useSelector((state) => state.permissions);
  const userPermissions = permissions[10] || {};

  const canView = userPermissions?.view || false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  /* =========================================================
     ROW ID
  ========================================================= */

  const rowId = location.state?.rowId;

  /* =========================================================
     FORECAST REDUX STATE
  ========================================================= */

  const { forecastGet } = useSelector((state) => state.forecast);

  /* =========================================================
     CONSUMPTION REDUX STATE
  ========================================================= */

  const {
    projectConsumptionGet,
    projectConsumption,
  } = useSelector((state) => state.forecast);

  const [viewData, setViewData] = useState(null);

  /* =========================================================
     FETCH DATA
     
     IMPORTANT:
     Forecast -> ForcastGet
     Consumption -> ProjectConsumptionGet
  ========================================================= */

  useEffect(() => {
    setViewData(null);

    if (isConsumption) {
      dispatch(ProjectConsumptionGet());
      return;
    }

    if (!forecastGet?.data) {
      dispatch(
        ForcastGet({
          endpoint: viewerConfig.apiEndpoint,
        })
      );
    }
  }, [
    dispatch,
    isConsumption,
    viewerConfig.apiEndpoint,
  ]);

  /* =========================================================
     HELPER
     Extract array from API response safely
  ========================================================= */

  const extractArray = (response) => {
    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.projectConsumption)) {
      return response.data.projectConsumption;
    }

    if (Array.isArray(response?.projectConsumption)) {
      return response.projectConsumption;
    }

    if (Array.isArray(response?.data?.consumption)) {
      return response.data.consumption;
    }

    if (Array.isArray(response?.consumption)) {
      return response.consumption;
    }

    if (Array.isArray(response?.data?.consumptionEntries)) {
      return response.data.consumptionEntries;
    }

    if (Array.isArray(response?.consumptionEntries)) {
      return response.consumptionEntries;
    }

    return [];
  };

  /* =========================================================
     FIND FORECAST RECORD
  ========================================================= */

  useEffect(() => {
    if (isConsumption) {
      return;
    }

    if (!forecastGet || !rowId) {
      return;
    }

    const forecastData = extractArray(forecastGet);

    const targetData = forecastData.find(
      (item) => item?._id === rowId
    );

    setViewData(targetData || null);
  }, [
    forecastGet,
    rowId,
    isConsumption,
  ]);

  /* =========================================================
     FIND CONSUMPTION RECORD
  ========================================================= */

  useEffect(() => {
    if (!isConsumption) {
      return;
    }

    if ((!projectConsumptionGet && !projectConsumption) || !rowId) {
      return;
    }

    const consumptionResponse =
      projectConsumptionGet || projectConsumption;
    const consumptionData = extractArray(
      consumptionResponse
    );

    const targetData = consumptionData.find(
      (item) => item?._id === rowId
    );

    setViewData(targetData || null);
  }, [
    projectConsumptionGet,
    projectConsumption,
    rowId,
    isConsumption,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (!viewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]">
        <p className="text-gray-500 font-medium animate-pulse">
          Loading {viewerConfig.title} Details...
        </p>
      </div>
    );
  }

  /* =========================================================
     COMMON HEADER VALUES
  ========================================================= */

  const recordId =
    viewData?.forecastId ||
    viewData?.consumptionId ||
    viewData?.projectConsumptionId ||
    viewData?.projectConsumptionID ||
    viewData?._id ||
    '-';

  const customerName =
    viewData?.customerId?.companyName ||
    viewData?.customerId?.customerName ||
    '-';

  const projectName =
    viewData?.projectId?.projectName ||
    viewData?.projectId?.name ||
    '-';

  /* =========================================================
     FORECAST MONTH DATA
  ========================================================= */

  const forecastMonths =
    Array.isArray(viewData?.projectForecast)
      ? viewData.projectForecast
      : [];

  /* =========================================================
     CONSUMPTION MONTH DATA
     
     Supports common possible API property names without
     changing the backend response.
  ========================================================= */

  const consumptionMonths = Array.isArray(
    viewData?.projectConsumption
  )
    ? viewData.projectConsumption.map((monthData) => ({
        ...monthData,
        consumptionMonth: monthData?.consumptionMonth || monthData?.month || '',
        productionQuantity: monthData?.productionQuantity ?? monthData?.consumptionQuantity ?? monthData?.quantity ?? 0,
        itemConsumptions: Array.isArray(monthData?.itemConsumptions)
          ? monthData.itemConsumptions
          : Array.isArray(monthData?.items)
            ? monthData.items
            : Array.isArray(monthData?.consumptionItems)
              ? monthData.consumptionItems
              : [],
      }))
    : Array.isArray(viewData?.consumptionEntries)
      ? viewData.consumptionEntries
      : Array.isArray(viewData?.consumption)
        ? viewData.consumption
        : [];

  /* =========================================================
     FORECAST VIEW
  ========================================================= */

  const renderForecastTable = () => {
    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-[15px] text-gray-800 bg-[#f9fafc]">
            <th className="py-4 px-6 font-semibold min-w-[140px]">
              Month
            </th>

            <th className="py-4 px-6 font-semibold min-w-[180px]">
              Production
            </th>

            <th className="py-4 px-6 font-semibold">
              Supply
            </th>

            <th className="py-4 px-6 font-semibold min-w-[250px]">
              Item
            </th>

            <th className="py-4 px-6 font-semibold">
              Required
            </th>

            <th className="py-4 px-6 font-semibold">
              Total Cons
            </th>

            <th className="py-4 px-6 font-semibold">
              Supplied Cons
            </th>
          </tr>
        </thead>

        <tbody className="text-[14px] text-gray-700">
          {forecastMonths.map((monthData, monthIdx) => {
            const itemsList =
              monthData?.itemConsumptions || [];

            /*
             * If there are no item consumptions,
             * still show the month row.
             */
            if (itemsList.length === 0) {
              return (
                <tr
                  key={`forecast-month-${monthIdx}`}
                  className="border-t border-gray-200"
                >
                  <td className="py-4 px-6">
                    {monthData?.forecastMonth || '-'}
                  </td>

                  <td className="py-4 px-6">
                    {monthData?.productionQuantity ?? 0}
                  </td>

                  <td className="py-4 px-6">
                    {monthData?.supplyQuantity ?? 0}
                  </td>

                  <td
                    colSpan="4"
                    className="py-4 px-6 text-gray-400"
                  >
                    No item consumption data
                  </td>
                </tr>
              );
            }

            return itemsList.map((item, itemIdx) => (
              <tr
                key={`${monthIdx}-${itemIdx}`}
                className={`hover:bg-gray-50/50 transition-colors ${
                  itemIdx !== 0
                    ? 'border-none'
                    : 'border-t border-gray-200'
                }`}
              >
                {/* Month */}
                <td className="py-4 px-6 align-top">
                  {itemIdx === 0 && (
                    <div className="flex flex-col gap-3 mt-1">
                      <span className="text-gray-800 font-medium whitespace-nowrap">
                        {monthData?.forecastMonth || '-'}
                      </span>
                    </div>
                  )}
                </td>

                {/* Production + History */}
                <td className="py-4 px-6 align-top">
                  {itemIdx === 0 ? (
                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-semibold text-slate-800 text-[15px]">
                        {monthData?.productionQuantity ?? 0}
                      </span>

                      {Array.isArray(
                        monthData?.productionHistory
                      ) &&
                        monthData.productionHistory.length >
                          0 && (
                          <div className="relative group cursor-pointer">
                            <div className="flex items-center gap-1 text-xs font-medium text-[#0062a0] bg-blue-50 px-2 py-1 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors">
                              <History size={13} />

                              <span>
                                Edited (
                                {
                                  monthData
                                    .productionHistory
                                    .length
                                }
                                )
                              </span>
                            </div>

                            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 rounded-t-xl flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  Update History
                                </span>
                              </div>

                              <div className="max-h-[250px] overflow-y-auto p-1">
                                {monthData.productionHistory.map(
                                  (hist, hIdx) => {
                                    const updaterName =
                                      hist?.updatedBy?.name ||
                                      hist?.updatedBy
                                        ?.userName ||
                                      (typeof hist?.updatedBy ===
                                      'string'
                                        ? `User ID: ${hist.updatedBy.substring(
                                            0,
                                            8
                                          )}...`
                                        : 'System / Unknown');

                                    return (
                                      <div
                                        key={hIdx}
                                        className="p-3 hover:bg-slate-50 rounded-lg transition-colors border-b last:border-0 border-slate-50"
                                      >
                                        <div className="text-[11px] text-slate-400 mb-2 flex justify-between items-center">
                                          <span className="flex items-center gap-1.5">
                                            <Calendar size={12} />

                                            {hist?.updatedAt
                                              ? new Date(
                                                  hist.updatedAt
                                                ).toLocaleDateString(
                                                  'en-US',
                                                  {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                  }
                                                )
                                              : '-'}
                                          </span>

                                          <span className="flex items-center gap-1.5">
                                            <Clock size={12} />

                                            {hist?.updatedAt
                                              ? new Date(
                                                  hist.updatedAt
                                                ).toLocaleTimeString(
                                                  'en-US',
                                                  {
                                                    hour: '2-digit',
                                                    minute:
                                                      '2-digit',
                                                  }
                                                )
                                              : '-'}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100/60 w-fit px-2 py-0.5 rounded-full mb-2.5 border border-slate-200/60">
                                          <User
                                            size={10}
                                            className="text-slate-400"
                                          />

                                          <span className="font-medium">
                                            {updaterName}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-slate-400 line-through decoration-slate-300 font-medium">
                                            {hist?.oldValue ?? '-'}
                                          </span>

                                          <ArrowRight
                                            size={14}
                                            className="text-slate-300"
                                          />

                                          <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                            {hist?.newValue ?? '-'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ) : null}
                </td>

                {/* Supply */}
                <td className="py-4 px-6 text-gray-600 align-top">
                  {itemIdx === 0
                    ? monthData?.supplyQuantity ?? 0
                    : ''}
                </td>

                {/* Item */}
                <td className="py-4 px-6 text-gray-700 align-top">
                  <div className="mt-1">
                    {item?.itemId?.itemName || '-'}
                  </div>
                </td>

                {/* Required */}
                <td className="py-4 px-6 text-gray-700 align-top">
                  <div className="mt-1">
                    {item?.requiredQuantity ?? 0}
                  </div>
                </td>

                {/* Total Consumption */}
                <td className="py-4 px-6 text-gray-700 align-top">
                  <div className="mt-1">
                    {item?.totalConsumption ?? 0}
                  </div>
                </td>

                {/* Supplied Consumption */}
                <td className="py-4 px-6 text-gray-700 align-top">
                  <div className="mt-1">
                    {item?.suppliedConsumption ?? 0}
                  </div>
                </td>
              </tr>
            ));
          })}

          {forecastMonths.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="py-12 text-center text-gray-500"
              >
                No monthly forecast data available for this
                record.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  /* =========================================================
     CONSUMPTION VIEW
  ========================================================= */

  const renderConsumptionTable = () => {
    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-[15px] text-gray-800 bg-[#f9fafc]">
            <th className="py-4 px-6 font-semibold min-w-[180px]">
              Month
            </th>

            <th className="py-4 px-6 font-semibold min-w-[200px]">
              Consumption
            </th>

            <th className="py-4 px-6 font-semibold min-w-[250px]">
              Item
            </th>

            <th className="py-4 px-6 font-semibold">
              Required
            </th>

            <th className="py-4 px-6 font-semibold">
              Total Consumption
            </th>

            <th className="py-4 px-6 font-semibold">
              Supplied Consumption
            </th>
          </tr>
        </thead>

        <tbody className="text-[14px] text-gray-700">
          {consumptionMonths.map(
            (monthData, monthIdx) => {
              /*
               * Consumption item arrays can have different
               * names depending on backend response.
               */
              const itemsList =
                monthData?.itemConsumptions ||
                monthData?.items ||
                monthData?.consumptionItems ||
                [];

              /*
               * Resolve month from Consumption response.
               */
              const month =
                monthData?.consumptionMonth ||
                monthData?.month ||
                monthData?.forecastMonth ||
                '-';

              /*
               * Resolve parent consumption quantity.
               */
              const quantity =
                monthData?.productionQuantity ??
                monthData?.consumptionQuantity ??
                monthData?.quantity ??
                monthData?.totalConsumption ??
                0;

              /*
               * If no item array exists, display the
               * consumption month and quantity directly.
               */
              if (itemsList.length === 0) {
                return (
                  <tr
                    key={`consumption-month-${monthIdx}`}
                    className="border-t border-gray-200 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 align-top">
                      <span className="text-gray-800 font-medium whitespace-nowrap">
                        {month}
                      </span>
                    </td>

                    <td className="py-4 px-6 align-top">
                      <span className="font-semibold text-slate-800 text-[15px]">
                        {quantity}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-gray-400">
                      -
                    </td>

                    <td className="py-4 px-6 text-gray-400">
                      -
                    </td>

                    <td className="py-4 px-6 text-gray-700">
                      {monthData?.totalConsumption ??
                        quantity}
                    </td>

                    <td className="py-4 px-6 text-gray-700">
                      {monthData?.suppliedConsumption ?? 0}
                    </td>
                  </tr>
                );
              }

              return itemsList.map((item, itemIdx) => {
                const itemName =
                  item?.itemId?.itemName ||
                  item?.itemMasterId?.itemName ||
                  item?.itemName ||
                  '-';

                const requiredQuantity =
                  item?.requiredQuantity ??
                  item?.required ??
                  0;

                const totalConsumption =
                  item?.totalConsumption ??
                  item?.consumptionQuantity ??
                  item?.quantity ??
                  0;

                const suppliedConsumption =
                  item?.suppliedConsumption ?? 0;

                return (
                  <tr
                    key={`${monthIdx}-${itemIdx}`}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      itemIdx !== 0
                        ? 'border-none'
                        : 'border-t border-gray-200'
                    }`}
                  >
                    {/* Month */}
                    <td className="py-4 px-6 align-top">
                      {itemIdx === 0 && (
                        <span className="text-gray-800 font-medium whitespace-nowrap">
                          {month}
                        </span>
                      )}
                    </td>

                    {/* Consumption Quantity */}
                    <td className="py-4 px-6 align-top">
                      {itemIdx === 0 && (
                        <span className="font-semibold text-slate-800 text-[15px]">
                          {quantity}
                        </span>
                      )}
                    </td>

                    {/* Item */}
                    <td className="py-4 px-6 text-gray-700 align-top">
                      {itemName}
                    </td>

                    {/* Required */}
                    <td className="py-4 px-6 text-gray-700 align-top">
                      {requiredQuantity}
                    </td>

                    {/* Total Consumption */}
                    <td className="py-4 px-6 text-gray-700 align-top">
                      {totalConsumption}
                    </td>

                    {/* Supplied Consumption */}
                    <td className="py-4 px-6 text-gray-700 align-top">
                      {suppliedConsumption}
                    </td>
                  </tr>
                );
              });
            }
          )}

          {consumptionMonths.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="py-12 text-center text-gray-500"
              >
                No monthly consumption data available for
                this record.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 font-sans text-slate-800"
    >
      <div className="max-w-full mx-auto">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center gap-5 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-[#0062a0] bg-white border border-gray-200 hover:bg-blue-50 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {viewerConfig.title} Details
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">
                {viewerConfig.idLabel}: {recordId}
              </span>

              {' | '}

              {customerName}

              {' | '}

              {projectName}
            </p>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible pb-12">
            {isConsumption
              ? renderConsumptionTable()
              : renderForecastTable()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForCast_View;