import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Download,
  SquareKanban,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useMatches, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  binDashboard_dynamicGet,
  smartbinDashboard_getall,
} from "../../../../service/Bin_Services/Bin_Services";
import { ForcastGet } from "../../../../store/Api_slice/Forecast_Slice";
import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";

import Button from "../../../../component/button/Buttons";
import Download_Button from "../../../../component/button/Download_Button";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import SearchBar from "../../../../component/SearchBar/SearchBar";
import StatsCard from "../../../../component/stats/StatsCard";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import SmartBin_Full_View_Model from "./SmartBin_Full_View_Model";
import ForecastAccuracy_Full_View_Model from "./ForecastAccuracy_Full_View_Model";

const FORECAST_ACCURACY_ENDPOINT = "/forecast/dashboard";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours || 12;
  return `${day}/${month}/${year} (${hours}:${minutes} ${ampm})`;
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return "-";
  const [year, month] = String(monthKey).split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return monthKey;
  return date.toLocaleString("en-US", { month: "long" });
};

const getViewerType = (matches, pathname) => {
  const routeViewerType = [...matches]
    .reverse()
    .find((match) => match.handle?.viewerType)?.handle?.viewerType;

  if (routeViewerType === "forecastAccuracy") return "forecastAccuracy";
  if (pathname.startsWith("/forecast-accuracy-report")) return "forecastAccuracy";
  return "smartbin";
};

const SmartBin_Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = useMatches();
  const dispatch = useDispatch();

  const viewerType = getViewerType(matches, location.pathname);
  const isForecastAccuracy = viewerType === "forecastAccuracy";

  const { permissions } = useSelector((state) => state.permissions);
  const forecastGet = useSelector((state) => state.forecast?.forecastGet);
  const forecastLoading = useSelector((state) => state.forecast?.loading);

  const userPermissions = permissions?.[11] || {};
  const canView = userPermissions?.view || false;
  const canEdit = userPermissions?.edit || false;
  const canDelete = userPermissions?.delete || false;
  const canCreate = userPermissions?.create || false;

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const [successModel, setSuccessModel] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isOpenSmartModel, setIsOpenSmartModel] = useState(false);
  const [isOpenForecastAccuracyFullView, setIsOpenForecastAccuracyFullView] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [dynamicData, setDynamicData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // ------------------------------------------------------------
  // SMARTBIN DATA
  // ------------------------------------------------------------
  useEffect(() => {
    if (isForecastAccuracy) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [staticRes, dynamicRes] = await Promise.all([
          smartbinDashboard_getall(currentPage, itemsPerPage, ""),
          binDashboard_dynamicGet(currentPage, itemsPerPage, ""),
        ]);

        const records = staticRes?.data?.data?.records || [];
        const total = staticRes?.data?.data?.totalRecords || records.length;

        setTableData(records);
        setDynamicData(dynamicRes?.data?.data || []);
        setTotalItems(total);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setTableData([]);
        setDynamicData([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isForecastAccuracy, currentPage, itemsPerPage]);

  // ------------------------------------------------------------
  // FORECAST ACCURACY DATA
  // Uses the existing ForcastGet thunk, which accepts a custom endpoint.
  // ------------------------------------------------------------
  useEffect(() => {
    if (!isForecastAccuracy) return;

    setCurrentPage(1);
    setSelectedRows([]);
    dispatch(ForcastGet({ endpoint: FORECAST_ACCURACY_ENDPOINT }));
  }, [dispatch, isForecastAccuracy]);

  const forecastAccuracyData = useMemo(() => {
    if (!isForecastAccuracy) return [];
    return Array.isArray(forecastGet?.data) ? forecastGet.data : [];
  }, [forecastGet, isForecastAccuracy]);

  // ------------------------------------------------------------
  // SMARTBIN NORMALIZATION
  // ------------------------------------------------------------
  const smartBinProcessedData = useMemo(() => {
    return tableData.map((item, index) => {
      const liveData = dynamicData.find((d) => d.binId === item.binId);

      return {
        ...item,
        srNo: index + 1,
        id: item.id || item._id || `row-${index}`,
        binQty: liveData?.currentQuantity ?? item.binQty,
        binStatus:
          liveData?.statusTag || liveData?.currentStatus || item.binStatus,
        binStatusMessage: liveData?.statusMessage || "",
        binUpdatedOn: liveData?.lastUpdatedAt
          ? formatDateTime(liveData.lastUpdatedAt)
          : item.binUpdatedOn,
        warehouseCurrentStock:
          liveData?.warehouseCurrentStock ?? item.warehouseCurrentStock,
        warehouseStatusMessage:
          item.warehouseStatusMessage ||
          liveData?.warehouseStatusMessage ||
          "",
        warehouseStatusTag:
          liveData?.warehouseStatusTag || item.warehouseStatusTag,
        currentStatus:
          liveData?.masterStatus ||
          (item.status === 1 ? "Active" : "Inactive"),
      };
    });
  }, [tableData, dynamicData])  // ------------------------------------------------------------
  // FORECAST ACCURACY NORMALIZATION
  // ------------------------------------------------------------

  /*
   * The Forecast Accuracy API can expose monthly values in a few common
   * shapes. Normalize them into one object:
   *
   * {
   *   "2026-10": { actual, forecast, accuracy },
   *   "2026-11": { actual, forecast, accuracy }
   * }
   *
   * The primary source remains item.monthly. The additional fallbacks make
   * the report resilient when the backend sends projectForecast /
   * projectConsumption arrays instead of a pre-built monthly object.
   */
  const normalizeMonthly = (item) => {
    const result = {};

    const addMonth = (monthValue, actual, forecast, accuracy) => {
      if (!monthValue) return;

      const raw = String(monthValue);
      const monthMatch = raw.match(/^(\d{4})[-/](\d{1,2})/);

      if (!monthMatch) return;

      const monthKey = `${monthMatch[1]}-${String(
        Number(monthMatch[2])
      ).padStart(2, "0")}`;

      if (!result[monthKey]) {
        result[monthKey] = {
          actual: null,
          forecast: null,
          accuracy: null,
        };
      }

      if (actual !== undefined && actual !== null && actual !== "") {
        result[monthKey].actual = actual;
      }

      if (forecast !== undefined && forecast !== null && forecast !== "") {
        result[monthKey].forecast = forecast;
      }

      if (accuracy !== undefined && accuracy !== null && accuracy !== "") {
        result[monthKey].accuracy = accuracy;
      }
    };

    // 1. Preferred backend shape: monthly object.
    if (
      item?.monthly &&
      typeof item.monthly === "object" &&
      !Array.isArray(item.monthly)
    ) {
      Object.entries(item.monthly).forEach(([month, values]) => {
        const value = values || {};

        addMonth(
          month,
          value.actual ??
            value.consumption ??
            value.consumptionQuantity ??
            value.actualQuantity ??
            value.actualQty,
          value.forecast ??
            value.forecastQuantity ??
            value.forecastQty,
          value.accuracy ??
            value.forecastAccuracy ??
            value.accuracyPercentage ??
            value.accuracyPercent
        );
      });
    }

    // 2. monthly array fallback.
    if (Array.isArray(item?.monthly)) {
      item.monthly.forEach((value) => {
        const month =
          value?.month ??
          value?.forecastMonth ??
          value?.consumptionMonth ??
          value?.monthKey ??
          value?.date;

        addMonth(
          month,
          value?.actual ??
            value?.consumption ??
            value?.consumptionQuantity ??
            value?.actualQuantity ??
            value?.actualQty,
          value?.forecast ??
            value?.forecastQuantity ??
            value?.forecastQty,
          value?.accuracy ??
            value?.forecastAccuracy ??
            value?.accuracyPercentage ??
            value?.accuracyPercent
        );
      });
    }

    // 3. Forecast array fallback.
    const forecastArrays = [
      item?.projectForecast,
      item?.forecast,
      item?.forecastData,
      item?.forecastDetails,
    ];

    forecastArrays.forEach((arr) => {
      if (!Array.isArray(arr)) return;

      arr.forEach((value) => {
        addMonth(
          value?.forecastMonth ??
            value?.month ??
            value?.monthKey ??
            value?.date,
          undefined,
          value?.forecast ??
            value?.forecastQuantity ??
            value?.quantity ??
            value?.productionQuantity ??
            value?.forecastQty
        );
      });
    });

    // 4. Consumption array fallback.
    const consumptionArrays = [
      item?.projectConsumption,
      item?.consumption,
      item?.consumptionData,
      item?.consumptionDetails,
    ];

    consumptionArrays.forEach((arr) => {
      if (!Array.isArray(arr)) return;

      arr.forEach((value) => {
        addMonth(
          value?.consumptionMonth ??
            value?.month ??
            value?.monthKey ??
            value?.date,
          value?.actual ??
            value?.consumption ??
            value?.consumptionQuantity ??
            value?.quantity ??
            value?.actualQuantity ??
            value?.actualQty
        );
      });
    });

    // 5. Calculate accuracy when backend did not provide it.
    Object.values(result).forEach((month) => {
      if (
        month.accuracy === null &&
        month.actual !== null &&
        month.forecast !== null
      ) {
        const actual = Number(month.actual);
        const forecast = Number(month.forecast);

        if (
          Number.isFinite(actual) &&
          Number.isFinite(forecast)
        ) {
          if (actual === 0 && forecast === 0) {
            month.accuracy = 100;
          } else if (actual !== 0) {
            month.accuracy = Math.max(
              0,
              Math.min(
                100,
                100 - (Math.abs(actual - forecast) / Math.abs(actual)) * 100
              )
            );
          }
        }
      }
    });

    return result;
  };

  const normalizedForecastAccuracy = useMemo(() => {
    if (!isForecastAccuracy) return [];

    return forecastAccuracyData.map((item, index) => {
      const monthly = normalizeMonthly(item);

      return {
        ...item,
        id:
          item?.id ||
          item?._id ||
          `${item?.customerMasterId || item?.customerName || "row"}-${
            item?.masterId || index
          }-${index}`,
        srNo: index + 1,
        customerName:
          item?.customerName ??
          item?.customer?.customerName ??
          item?.customer?.name ??
          "-",
        projectName:
          item?.projectName ??
          item?.project?.projectName ??
          item?.project?.name ??
          "-",
        warehouseId:
          item?.warehouseId ??
          item?.warehouse?.warehouseId ??
          "-",
        bestPartNumber:
          item?.bestPartNumber ??
          item?.customerPartNumber ??
          item?.partNumber ??
          "-",
        description:
          item?.description ??
          item?.itemDescription ??
          item?.itemName ??
          "-",
        bomQuantity:
          item?.bomQuantity ??
          item?.bomQty ??
          item?.bom?.quantity ??
          "-",
        currentQuantity:
          item?.currentQuantity ??
          item?.currentStock ??
          item?.currentQty ??
          "-",
        rol:
          item?.rol ??
          item?.reorderLevel ??
          item?.reorderQuantity ??
          "-",
        safetyStockQuantity:
          item?.safetyStockQuantity ??
          item?.safetyStock ??
          item?.safeStock ??
          "-",
        maximumQuantity:
          item?.maximumQuantity ??
          item?.maximumQty ??
          item?.maxQuantity ??
          "-",
        monthly,
      };
    });
  }, [forecastAccuracyData, isForecastAccuracy]);

  const accuracyMonths = useMemo(() => {
    const monthSet = new Set();

    normalizedForecastAccuracy.forEach((row) => {
      Object.keys(row.monthly || {}).forEach((month) =>
        monthSet.add(month)
      );
    });

    return [...monthSet].sort();
  }, [normalizedForecastAccuracy]);

  const forecastAccuracyRows = useMemo(() => {
    return normalizedForecastAccuracy.map((item) => {
      const row = { ...item };

      accuracyMonths.forEach((month) => {
        const values = item.monthly?.[month] || {};

        row[`accuracy_${month}_actual`] =
          values.actual ?? "-";

        row[`accuracy_${month}_forecast`] =
          values.forecast ?? "-";

        row[`accuracy_${month}_accuracy`] =
          values.accuracy ?? "-";
      });

      return row;
    });
  }, [normalizedForecastAccuracy, accuracyMonths]);

  // ------------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------------
  const filteredData = useMemo(() => {
    const source = isForecastAccuracy
      ? forecastAccuracyRows
      : smartBinProcessedData;

    if (!searchQuery.trim()) return source;

    const query = searchQuery.toLowerCase().trim();

    return source.filter((item) => {
      if (isForecastAccuracy) {
        return [
          item.warehouseId,
          item.customerName,
          item.projectName,
          item.masterId,
          item.bestPartNumber,
          item.description,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
        );
      }

      return [
        item.customerName,
        item.projectName,
        item.masterId,
        item.binId,
        item.itemName,
        item.binStatus,
        item.currentStatus,
        item.warehouseStatusTag,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    isForecastAccuracy,
    searchQuery,
    forecastAccuracyRows,
    smartBinProcessedData,
  ]);

  // Forecast Accuracy uses client-side pagination.
  const paginatedAccuracyData = useMemo(() => {
    if (!isForecastAccuracy) return [];

    const start = (currentPage - 1) * itemsPerPage;

    return filteredData.slice(
      start,
      start + itemsPerPage
    );
  }, [
    isForecastAccuracy,
    filteredData,
    currentPage,
    itemsPerPage,
  ]);

  const tableDisplayData = isForecastAccuracy
    ? paginatedAccuracyData
    : filteredData;

  // ------------------------------------------------------------
  // TOTALS / STATS
  // ------------------------------------------------------------
  useEffect(() => {
    if (!isForecastAccuracy) return;

    setTotalItems(filteredData.length);

    const totalPages = Math.max(
      1,
      Math.ceil(filteredData.length / itemsPerPage)
    );

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    isForecastAccuracy,
    filteredData.length,
    itemsPerPage,
    currentPage,
  ]);

  const statsData = useMemo(() => {
    if (isForecastAccuracy) {
      const data = filteredData;

      const missingForecast = data.filter(
        (row) => row.hasForecastData === false
      ).length;

      const missingActual = data.filter(
        (row) => row.hasActualData === false
      ).length;

      const accuracyValues = data.flatMap((row) =>
        accuracyMonths.map(
          (month) =>
            row[`accuracy_${month}_accuracy`]
        )
      );

      const numericAccuracy = accuracyValues
        .map((value) => {
          if (
            typeof value === "string" &&
            value.trim().endsWith("%")
          ) {
            return Number(
              value.trim().replace("%", "")
            );
          }

          return Number(value);
        })
        .filter((value) => Number.isFinite(value));

      const averageAccuracy = numericAccuracy.length
        ? Math.round(
            numericAccuracy.reduce(
              (sum, value) => sum + value,
              0
            ) / numericAccuracy.length
          )
        : 0;

      return [
        {
          title: "Total Records",
          count: data.length.toString(),
          footerText: "Forecast accuracy records",
          icon: <BarChart3 />,
        },
        {
          title: "Missing Forecast",
          count: missingForecast
            .toString()
            .padStart(2, "0"),
          footerText: "Needs forecast data",
          icon: (
            <UserRoundX className="text-red-500" />
          ),
        },
        {
          title: "Missing Actual",
          count: missingActual
            .toString()
            .padStart(2, "0"),
          footerText: "Needs consumption data",
          icon: (
            <AlertTriangle className="text-orange-500" />
          ),
        },
        {
          title: "Avg Accuracy",
          count: `${averageAccuracy}%`,
          footerText: "Across available months",
          icon: (
            <UserCheck className="text-green-500" />
          ),
        },
      ];
    }

    const dataForStats = filteredData;

    const uniqueProjectsCount = new Set(
      dataForStats
        .map((d) => d.projectName)
        .filter(Boolean)
    ).size;

    const criticalCount = dataForStats.filter((d) => {
      const status =
        d.binStatus?.toLowerCase() || "";

      return (
        status === "red" ||
        status === "orange" ||
        status === "critical"
      );
    }).length;

    const onlineCount = dataForStats.filter(
      (d) =>
        d.currentStatus?.toLowerCase() === "active" ||
        d.binStatus?.toLowerCase() === "online" ||
        d.binStatus?.toLowerCase() === "green" ||
        d.status === 1
    ).length;

    const healthPct =
      dataForStats.length > 0
        ? Math.round(
            (onlineCount / dataForStats.length) * 100
          )
        : 0;

    return [
      {
        title: "Total Bins",
        count: totalItems.toString(),
        footerText: "Across all sites",
        icon: <Users />,
      },
      {
        title: "Active Projects",
        count: uniqueProjectsCount.toString(),
        footerText: "On current view",
        icon: <SquareKanban />,
      },
      {
        title: "Critical Stock",
        count: criticalCount
          .toString()
          .padStart(2, "0"),
        footerText: "Needs Attention",
        icon: (
          <UserRoundX className="text-red-500" />
        ),
      },
      {
        title: "System Health",
        count: `${healthPct}%`,
        footerText: "Online/Active",
        icon: (
          <UserCheck className="text-green-500" />
        ),
      },
    ];
  }, [
    isForecastAccuracy,
    filteredData,
    totalItems,
    accuracyMonths,
  ]);

  // ------------------------------------------------------------
  // SMART BIN COLUMN CONFIGURATION
  // ------------------------------------------------------------
  const smartBinColumns = useMemo(
    () => [
      {
        header: "Customer",
        key: "customerName",
        width: 180,
      },
      {
        header: "Project Name",
        key: "projectName",
        width: 180,
      },
      {
        header: "Master ID",
        key: "masterId",
        width: 180,
      },
      {
        header: "BIN ID",
        key: "binId",
        width: 170,
      },
      {
        header: "Item Name",
        key: "itemName",
        width: 180,
      },
      {
        header: "Bin Status",
        key: "binStatus",
        width: 150,
        isStatus: true,
      },
      {
        header: "Bin Max",
        key: "binMaxLimit",
        width: 140,
      },
      {
        header: "Bin QTY",
        key: "binQty",
        width: 140,
      },
      {
        header: "Bin Reorder",
        key: "binReorderLevel",
        width: 150,
      },
      {
        header: "Bin Safety",
        key: "binSafetyLimit",
        width: 150,
      },
      {
        header: "Bin Updated",
        key: "binUpdatedOn",
        width: 200,
      },
      {
        header: "WH Status",
        key: "warehouseStatusTag",
        width: 150,
        isPaid: true,
      },
      {
        header: "WH Max",
        key: "warehouseMaxLimit",
        width: 140,
      },
      {
        header: "WH C Qty",
        key: "warehouseCurrentStock",
        width: 150,
      },
      {
        header: "WH Reorder",
        key: "warehouseReorderLevel",
        width: 150,
      },
      {
        header: "WH Safety",
        key: "warehouseSafetyLimit",
        width: 150,
      },
      {
        header: "Status",
        key: "currentStatus",
        width: 140,
        isStatus: true,
      },
    ],
    []
  );

  const columns = smartBinColumns;

  // ------------------------------------------------------------
  // FORECAST ACCURACY TABLE
  // ------------------------------------------------------------
  const formatTableValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return value;
  };

  const formatAccuracyValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "-"
    ) {
      return "-";
    }

    const text = String(value);

    if (text.includes("%")) {
      return text;
    }

    const numeric = Number(value);

    return Number.isFinite(numeric)
      ? `${Number(numeric.toFixed(2))}%`
      : text;
  };

  const forecastAccuracyBaseColumns = [
    {
      key: "customerName",
      header: "Customer",
      width: 180,
    },
    {
      key: "projectName",
      header: "Project",
      width: 180,
    },
    {
      key: "warehouseId",
      header: "Warehouse ID",
      width: 170,
    },
    {
      key: "bestPartNumber",
      header: "BEST Part Number",
      width: 190,
    },
    {
      key: "description",
      header: "Description",
      width: 240,
    },
    {
      key: "bomQuantity",
      header: "BOM Quantity",
      width: 140,
    },
    {
      key: "currentQuantity",
      header: "Current Quantity",
      width: 160,
    },
    {
      key: "rol",
      header: "ROL",
      width: 120,
    },
    {
      key: "safetyStockQuantity",
      header: "Safety Stock",
      width: 150,
    },
    {
      key: "maximumQuantity",
      header: "Maximum Quantity",
      width: 170,
    },
  ];

  const renderForecastAccuracyTable = () => {
    if (!isForecastAccuracy) return null;

    const tableRows = tableDisplayData || [];

    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[680px]">
          <table
            className="border-collapse"
            style={{
              minWidth: `${
                60 +
                forecastAccuracyBaseColumns.reduce(
                  (sum, column) => sum + column.width,
                  0
                ) +
                accuracyMonths.length * 450
              }px`,
            }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />

              {forecastAccuracyBaseColumns.map(
                (column) => (
                  <col
                    key={column.key}
                    style={{
                      width: `${column.width}px`,
                    }}
                  />
                )
              )}

              {accuracyMonths.map((month) => (
                <React.Fragment key={month}>
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "150px" }} />
                </React.Fragment>
              ))}
            </colgroup>

            <thead className="md:sticky md:top-0 z-30">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th
                  rowSpan={2}
                  className="md:sticky md:left-0 z-40 min-w-[60px] w-[60px] border-r border-slate-200 bg-slate-100 px-3 py-4 text-center"
                >
                  <input
                    type="checkbox"
                    checked={
                      tableRows.length > 0 &&
                      tableRows.every((row) =>
                        selectedRows.includes(row.id)
                      )
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(
                          tableRows.map(
                            (row) => row.id
                          )
                        );
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    className="h-4 w-4 accent-[#0062a0]"
                  />
                </th>

                {forecastAccuracyBaseColumns.map(
                  (column, index) => (
                    <th
                      key={column.key}
                      rowSpan={2}
                      className={`border-r border-slate-200 bg-slate-100 px-4 py-4 text-center text-[12px] font-black uppercase tracking-wide text-slate-700 whitespace-nowrap ${
                        index === 0
                          ? "md:sticky md:left-[60px] z-40"
                          : ""
                      }`}
                    >
                      {column.header}
                    </th>
                  )
                )}

                {accuracyMonths.map((month) => (
                  <th
                    key={`group-${month}`}
                    colSpan={3}
                    className="border-r border-slate-200 bg-[#eaf5fb] px-4 py-4 text-center text-[13px] font-black uppercase tracking-wide text-[#075985] whitespace-nowrap"
                  >
                    {formatMonthLabel(month)}
                  </th>
                ))}
              </tr>

              <tr className="bg-white border-b-2 border-slate-300">
                {accuracyMonths.map((month) => (
                  <React.Fragment
                    key={`sub-${month}`}
                  >
                    <th className="border-r border-slate-200 bg-white px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Consumption
                    </th>
                    <th className="border-r border-slate-200 bg-white px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Forecast
                    </th>
                    <th className="border-r border-slate-200 bg-white px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      Accuracy
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {forecastLoading && (
                <tr>
                  <td
                    colSpan={
                      1 +
                      forecastAccuracyBaseColumns.length +
                      accuracyMonths.length * 3
                    }
                    className="py-12 text-center text-sm font-bold text-slate-500"
                  >
                    Loading forecast accuracy data...
                  </td>
                </tr>
              )}

              {!forecastLoading &&
                tableRows.map((row, rowIndex) => {
                  const isSelected =
                    selectedRows.includes(row.id);

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-200 transition-colors ${
                        isSelected
                          ? "bg-blue-50"
                          : rowIndex % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/50"
                      } hover:bg-blue-50/70`}
                    >
                      <td className="md:sticky md:left-0 z-20 border-r border-slate-200 bg-inherit px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedRows((prev) =>
                              prev.includes(row.id)
                                ? prev.filter(
                                    (id) =>
                                      id !== row.id
                                  )
                                : [
                                    ...prev,
                                    row.id,
                                  ]
                            );
                          }}
                          className="h-4 w-4 accent-[#0062a0]"
                        />
                      </td>

                      {forecastAccuracyBaseColumns.map(
                        (column, index) => (
                          <td
                            key={column.key}
                            title={String(
                              formatTableValue(
                                row[column.key]
                              )
                            )}
                            className={`border-r border-slate-200 px-4 py-4 text-center text-[13px] font-semibold text-slate-700 whitespace-nowrap ${
                              index === 0
                                ? "md:sticky md:left-[60px] z-20 bg-inherit text-left"
                                : ""
                            }`}
                          >
                            {formatTableValue(
                              row[column.key]
                            )}
                          </td>
                        )
                      )}

                      {accuracyMonths.map((month) => {
                        const actual =
                          row[
                            `accuracy_${month}_actual`
                          ];

                        const forecast =
                          row[
                            `accuracy_${month}_forecast`
                          ];

                        const accuracy =
                          row[
                            `accuracy_${month}_accuracy`
                          ];

                        const numericAccuracy =
                          Number(
                            String(
                              accuracy
                            ).replace("%", "")
                          );

                        return (
                          <React.Fragment
                            key={`${row.id}-${month}`}
                          >
                            <td className="border-r border-slate-200 px-4 py-4 text-center text-[13px] font-bold text-slate-700 whitespace-nowrap">
                              {formatTableValue(
                                actual
                              )}
                            </td>

                            <td className="border-r border-slate-200 px-4 py-4 text-center text-[13px] font-bold text-slate-700 whitespace-nowrap">
                              {formatTableValue(
                                forecast
                              )}
                            </td>

                            <td
                              className={`border-r border-slate-200 px-4 py-4 text-center text-[13px] font-black whitespace-nowrap ${
                                Number.isFinite(
                                  numericAccuracy
                                )
                                  ? numericAccuracy >=
                                    90
                                    ? "text-green-600"
                                    : numericAccuracy >=
                                      70
                                    ? "text-orange-500"
                                    : "text-red-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {formatAccuracyValue(
                                accuracy
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}

              {!forecastLoading &&
                tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={
                        1 +
                        forecastAccuracyBaseColumns.length +
                        accuracyMonths.length * 3
                      }
                      className="py-16 text-center"
                    >
                      <div className="text-sm font-bold text-slate-500">
                        No forecast accuracy records found.
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Check the API response or change
                        the search filter.
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-600">
            Showing{" "}
            <span className="font-black text-slate-800">
              {tableRows.length
                ? (currentPage - 1) *
                    itemsPerPage +
                  1
                : 0}
            </span>{" "}
            to{" "}
            <span className="font-black text-slate-800">
              {Math.min(
                currentPage * itemsPerPage,
                filteredData.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-800">
              {filteredData.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              Rows per page:
            </span>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(
                  Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-[#0062a0]"
            >
              {[10, 20, 50, 100].map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>

            <div className="rounded-lg bg-[#0062a0] px-4 py-2 text-sm font-black text-white">
              {currentPage}
            </div>

            <button
              type="button"
              disabled={
                currentPage >=
                Math.max(
                  1,
                  Math.ceil(
                    filteredData.length /
                      itemsPerPage
                  )
                )
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    Math.max(
                      1,
                      Math.ceil(
                        filteredData.length /
                          itemsPerPage
                      )
                    ),
                    page + 1
                  )
                )
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------
  const handleSelectionChange = (selectedIds) => setSelectedRows(selectedIds);

  const handleEdit = (row) => {
    if (isForecastAccuracy) return;
    navigate("edit-bin", { state: { rowID: row.id } });
  };

  const handleView = () => {
    if (!isForecastAccuracy) {
      setIsOpenSmartModel(true);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDownload = () => {
    // Keep existing Download_Button behavior.
    setSuccessModel(true);
  };

  const effectiveLoading = isForecastAccuracy ? !!forecastLoading : loading;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-[#fcfdfe] min-h-screen"
    >
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isForecastAccuracy ? (
                <>
                  Forecast <span className="text-[#0062a0]">Accuracy</span>
                </>
              ) : (
                <>
                  Smart Bin <span className="text-[#0062a0]">Dashboard</span>
                </>
              )}
            </h1>
            <p className="text-[#0062a0] font-medium mt-1">
              {isForecastAccuracy
                ? "Forecast vs Consumption Monitoring"
                : "Real-time Inventory Monitoring"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              disabled={!canView}
              onClick={() => {
                if (isForecastAccuracy) {
                  setIsOpenForecastAccuracyFullView(true);
                } else {
                  setIsOpenSmartModel(true);
                }
              }}
              variant="secondary"
            >
              Full View
            </Button>

            <Download_Button
              disabled={!canView}
              onClick={handleDownload}
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsData.map((item, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatsCard
                title={item.title}
                count={item.count}
                footerText={item.footerText}
                icon={item.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* Table Container */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="max-w-md w-full">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={
                  isForecastAccuracy
                    ? "Search warehouse, customer, project, part number..."
                    : "Search customers, projects, bin ID, item name..."
                }
              />
            </div>

            <AnimatePresence>
              {selectedRows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#f0f9ff] border border-blue-200 px-4 py-1.5 rounded-full text-[13px] font-bold text-[#0062a0]"
                >
                  {selectedRows.length} Items Selected
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={isForecastAccuracy ? "p-1" : "p-1"}>
            {isForecastAccuracy ? (
              renderForecastAccuracyTable()
            ) : (
              <ReUsable_Table
                columns={columns}
                data={tableDisplayData}
                loading={effectiveLoading}
                selectedRows={selectedRows}
                onSelectionChange={handleSelectionChange}
                onEdit={canEdit ? handleEdit : null}
                onView={canView ? handleView : null}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onLimitChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
                showActions={canEdit || canView || canDelete}
                showWhstatus={true}
                showbinstatus={true}
                showToggle={false}
                ActionChildren="Actions"
                tableHeight="max-h-[600px]"
              />
            )}
          </div>
        </motion.div>
      </div>

      <Success_Popup
        isOpen={successModel}
        onClose={() => setSuccessModel(false)}
        message="File Downloaded Successfully!"
      />

      {!isForecastAccuracy && (
        <SmartBin_Full_View_Model
          isOpen={isOpenSmartModel}
          onClose={() => setIsOpenSmartModel(false)}
        />
      )}

      {isForecastAccuracy && (
        <ForecastAccuracy_Full_View_Model
          isOpen={isOpenForecastAccuracyFullView}
          onClose={() => setIsOpenForecastAccuracyFullView(false)}
          rows={forecastAccuracyRows}
          months={accuracyMonths}
          loading={forecastLoading}
        />
      )}
    </motion.div>
  );
};

export default SmartBin_Dashboard;
