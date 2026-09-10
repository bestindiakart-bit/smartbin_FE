import React, { useMemo, useState } from "react";
import { X, Search } from "lucide-react";

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return "-";
  const [year, month] = String(monthKey).split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return monthKey;
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString() : "-";
  return String(value);
};

const formatAccuracy = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") return "-";
  const text = String(value);
  if (text.includes("%")) return text;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${Number(numeric.toFixed(2))}%` : text;
};

const ForecastAccuracy_Full_View_Model = ({
  isOpen,
  onClose,
  rows = [],
  months = [],
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    ["warehouseId", "Warehouse ID", 170],
    ["customerName", "Customer", 180],
    ["projectName", "Project", 180],
    ["bestPartNumber", "BEST Part Number", 190],
    ["description", "Description", 240],
    ["bomQuantity", "BOM Quantity", 140],
    ["currentQuantity", "Current Quantity", 160],
    ["rol", "ROL", 120],
    ["safetyStockQuantity", "Safety Stock", 150],
    ["maximumQuantity", "Maximum Quantity", 170],
  ];

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) =>
      [
        row.warehouseId,
        row.customerName,
        row.projectName,
        row.bestPartNumber,
        row.description,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [rows, searchQuery]);

  if (!isOpen) return null;

  const totalColumns = 1 + columns.length + months.length * 3;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-3 sm:p-5">
      <div className="flex h-[96vh] w-full max-w-[99vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-800">
              Forecast <span className="text-[#0062a0]">Accuracy Full View</span>
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Forecast vs Consumption Monitoring • {filteredRows.length} records
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            aria-label="Close full view"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search warehouse, customer, project, part number..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0062a0]"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Scroll horizontally to view all monthly columns
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white">
          <table
            className="border-collapse"
            style={{
              minWidth: `${60 + columns.reduce((sum, [, , width]) => sum + width, 0) + months.length * 450}px`,
            }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />
              {columns.map(([key, , width]) => (
                <col key={key} style={{ width: `${width}px` }} />
              ))}
              {months.map((month) => (
                <React.Fragment key={month}>
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "150px" }} />
                </React.Fragment>
              ))}
            </colgroup>

            <thead className="sticky top-0 z-30">
              <tr className="border-b border-slate-200 bg-slate-100">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-40 w-[60px] border-r border-slate-200 bg-slate-100 px-3 py-4 text-center text-[11px] font-black uppercase text-slate-600"
                >
                  #
                </th>
                {columns.map(([key, label], index) => (
                  <th
                    key={key}
                    rowSpan={2}
                    className={`border-r border-slate-200 bg-slate-100 px-4 py-4 text-center text-[12px] font-black uppercase tracking-wide text-slate-700 ${
                      index === 0 ? "sticky left-[60px] z-40" : ""
                    }`}
                  >
                    {label}
                  </th>
                ))}
                {months.map((month) => (
                  <th
                    key={`group-${month}`}
                    colSpan={3}
                    className="border-r border-slate-200 bg-[#eaf5fb] px-4 py-4 text-center text-[13px] font-black uppercase tracking-wide text-[#075985]"
                  >
                    {formatMonthLabel(month)}
                  </th>
                ))}
              </tr>

              <tr className="border-b-2 border-slate-300 bg-white">
                {months.map((month) => (
                  <React.Fragment key={`sub-${month}`}>
                    <th className="border-r border-slate-200 bg-white px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Consumption
                    </th>
                    <th className="border-r border-slate-200 bg-white px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Forecast
                    </th>
                    <th className="border-r border-slate-200 bg-white px-4 py-3 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Accuracy
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={totalColumns} className="py-16 text-center text-sm font-bold text-slate-500">
                    Loading forecast accuracy data...
                  </td>
                </tr>
              )}

              {!loading && filteredRows.map((row, rowIndex) => (
                <tr
                  key={row.id || `${row.warehouseId}-${row.bestPartNumber}-${rowIndex}`}
                  className={`border-b border-slate-200 transition-colors hover:bg-blue-50/60 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td className="sticky left-0 z-20 border-r border-slate-200 bg-inherit px-3 py-4 text-center text-xs font-black text-slate-500">
                    {rowIndex + 1}
                  </td>

                  {columns.map(([key], index) => (
                    <td
                      key={key}
                      title={formatValue(row[key])}
                      className={`border-r border-slate-200 px-4 py-4 text-center text-[13px] font-semibold text-slate-700 whitespace-nowrap ${
                        index === 0 ? "sticky left-[60px] z-20 bg-inherit text-left" : ""
                      }`}
                    >
                      {formatValue(row[key])}
                    </td>
                  ))}

                  {months.map((month) => {
                    const actual = row[`accuracy_${month}_actual`];
                    const forecast = row[`accuracy_${month}_forecast`];
                    const accuracy = row[`accuracy_${month}_accuracy`];
                    const numericAccuracy = Number(String(accuracy).replace("%", ""));

                    return (
                      <React.Fragment key={`${row.id || rowIndex}-${month}`}>
                        <td className="border-r border-slate-200 px-4 py-4 text-center text-[13px] font-bold text-slate-700 whitespace-nowrap">
                          {formatValue(actual)}
                        </td>
                        <td className="border-r border-slate-200 px-4 py-4 text-center text-[13px] font-bold text-slate-700 whitespace-nowrap">
                          {formatValue(forecast)}
                        </td>
                        <td
                          className={`border-r border-slate-200 px-4 py-4 text-center text-[13px] font-black whitespace-nowrap ${
                            Number.isFinite(numericAccuracy)
                              ? numericAccuracy >= 90
                                ? "text-green-600"
                                : numericAccuracy >= 70
                                ? "text-orange-500"
                                : "text-red-600"
                              : "text-slate-500"
                          }`}
                        >
                          {formatAccuracy(accuracy)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={totalColumns} className="py-20 text-center text-sm font-bold text-slate-500">
                    No forecast accuracy records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastAccuracy_Full_View_Model;
