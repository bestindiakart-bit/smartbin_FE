import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  MoreVertical,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --- COLOR MAP FOR ADVANCED STATUS INDICATOR ---
const statusColorMap = {
  red: { bg: "bg-red-500", shadow: "rgba(239, 68, 68, 0.6)" },
  green: { bg: "bg-green-500", shadow: "rgba(34, 197, 94, 0.6)" },
  blue: { bg: "bg-blue-500", shadow: "rgba(59, 130, 246, 0.6)" },
  yellow: { bg: "bg-yellow-500", shadow: "rgba(234, 179, 8, 0.6)" },
  orange: { bg: "bg-orange-500", shadow: "rgba(249, 115, 22, 0.6)" },
  purple: { bg: "bg-purple-500", shadow: "rgba(168, 85, 247, 0.6)" },
  pink: { bg: "bg-pink-500", shadow: "rgba(236, 72, 153, 0.6)" },
  indigo: { bg: "bg-indigo-500", shadow: "rgba(99, 102, 241, 0.6)" },
  teal: { bg: "bg-teal-500", shadow: "rgba(20, 184, 166, 0.6)" },
  cyan: { bg: "bg-cyan-500", shadow: "rgba(6, 182, 212, 0.6)" },
};

// --- ADVANCED STATUS INDICATOR WITH MOTION UI ---
const StatusIndicator = ({ value, message }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isDanger =
    typeof value === "string" && value.toLowerCase() === "danger";

  const tooltipText =
    message ||
    (typeof value === "string"
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : "");

  let bgClass = "bg-gray-400";
  let shadowColor = "rgba(156, 163, 175, 0.6)";

  if (typeof value === "boolean") {
    bgClass = value ? "bg-green-500" : "bg-red-500";
    shadowColor = value ? "rgba(34, 197, 94, 0.6)" : "rgba(239, 68, 68, 0.6)";
  } else if (typeof value === "string" && !isDanger) {
    const lower = value.toLowerCase();
    if (statusColorMap[lower]) {
      bgClass = statusColorMap[lower].bg;
      shadowColor = statusColorMap[lower].shadow;
    }
  }

  return (
    <div
      className="relative flex items-center justify-center w-8 h-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isDanger ? (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{
            scale: 1.2,
            rotate: [0, -15, 15, -15, 0],
            transition: { duration: 0.4 },
          }}
        >
          <AlertTriangle
            size={20}
            className="text-red-500 cursor-pointer drop-shadow-md"
          />
        </motion.div>
      ) : (
        <motion.div
          className={`w-4 h-4 rounded-full ${bgClass} cursor-pointer`}
          animate={{
            boxShadow: [
              `0px 0px 0px 0px ${shadowColor}`,
              `0px 0px 0px 8px rgba(0,0,0,0)`,
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          whileHover={{ scale: 1.3 }}
        />
      )}

      <AnimatePresence>
        {isHovered && tooltipText && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: -12, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap z-[100] shadow-xl pointer-events-none tracking-wide"
          >
            {tooltipText}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReUsable_Table = ({
  columns = [],
  data = [],
  loading = false,
  showToggle = false,
  showbinstatus = false,
  showWhstatus = false,
  showQtyStatus = false,
  showActions = true,
  showMoreView = false,
  onMoreView,
  selectedRows = [],
  onSelectionChange,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  onView,
  onStatusToggle,
  ActionChildren,
  onRowClick,
  tableHeight = "max-h-[600px]",
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQueries, setSearchQueries] = useState({});
  const scrollRef = useRef(null);

  // --- COLUMN RESIZING STATE & LOGIC ---
  const [colWidths, setColWidths] = useState({});
  const resizingColRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    // Initialize default widths based on column prop
    const initialWidths = {};
    columns.forEach((col) => {
      initialWidths[col.key] = col.width || 180; // 180px default width
    });
    setColWidths(initialWidths);
  }, [columns]);

  const handleResizeStart = (e, colKey) => {
    e.stopPropagation(); // Prevent drag-to-scroll from triggering
    e.preventDefault();
    resizingColRef.current = colKey;
    startXRef.current = e.clientX;
    startWidthRef.current = colWidths[colKey] || 180;

    // Apply specific styles to body while dragging
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = useCallback(
    (e) => {
      if (!resizingColRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(80, startWidthRef.current + deltaX); // Min 80px width

      setColWidths((prev) => ({
        ...prev,
        [resizingColRef.current]: newWidth,
      }));
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    resizingColRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  // --- HORIZONTAL DRAG-TO-SCROLL LOGIC ---
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (["INPUT", "BUTTON", "SELECT", "SVG", "PATH"].includes(e.target.tagName))
      return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const toggleColumnKey = useMemo(() => {
    const toggleCol = columns.find((col) => col.isToggle);
    return toggleCol ? toggleCol.key : null;
  }, [columns]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.keys(searchQueries).every((key) => {
        const query = searchQueries[key]?.toLowerCase();
        if (!query) return true;
        return String(row[key])?.toLowerCase().includes(query);
      });
    });
  }, [data, searchQueries]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayStart = totalItems === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(startIndex + itemsPerPage, totalItems);

  const handleSelectAll = (e) => {
    e.stopPropagation();
    const currentPageIds = filteredData.map((row) => row.id || row._id);
    const allOnPageSelected = currentPageIds.every((id) =>
      selectedRows.includes(id)
    );
    if (allOnPageSelected) {
      onSelectionChange?.(
        selectedRows.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      onSelectionChange?.(
        Array.from(new Set([...selectedRows, ...currentPageIds]))
      );
    }
  };

  const renderTextStatusBadge = (value) => {
    const isActive = value?.toLowerCase() === "active";
    return (
      <div className="flex items-center justify-center">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className={`px-3 py-1 rounded-md text-[12px] font-bold tracking-wide min-w-[80px] inline-block text-center cursor-default ${
            isActive
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {value}
        </motion.span>
      </div>
    );
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-opacity duration-300 ${
        loading ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`w-full overflow-auto no-scrollbar cursor-grab active:cursor-grabbing select-none h-auto ${tableHeight}`}
      >
        <table className="w-full text-left border-separate border-spacing-0 table-fixed min-w-max">
          <thead>
            <tr className="bg-[#f8fafc]">
              {/* CHECKBOX HEADER */}
              <th className="p-4 w-12 min-w-[48px] max-w-[48px] text-center sticky top-0 left-0 bg-[#f8fafc] z-50 border-r border-b border-slate-200">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredData.length > 0 &&
                      filteredData.every((row) =>
                        selectedRows.includes(row.id || row._id)
                      )
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#0062a0] focus:ring-[#0062a0] cursor-pointer transition-all"
                  />
                </div>
              </th>

              {/* DYNAMIC COLUMNS WITH EXCEL-LIKE RESIZER */}
              {columns.map((col, idx) => {
                const colWidth = colWidths[col.key] || 180;
                return (
                  <th
                    key={col.key || idx}
                    style={{
                      width: colWidth,
                      minWidth: colWidth,
                      maxWidth: colWidth,
                    }}
                    className="relative p-4 sticky top-0 bg-[#f8fafc] z-40 border-r border-b border-slate-200 group"
                  >
                    <div className="flex flex-col gap-2 items-center text-center w-full px-2">
                      <span className="text-[13px] font-bold text-slate-600 whitespace-nowrap uppercase tracking-wider text-center w-full truncate">
                        {col.header}
                      </span>
                      <div
                        className="relative group text-left w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Search
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                        <input
                          type="text"
                          placeholder={`Search...`}
                          value={searchQueries[col.key] || ""}
                          onChange={(e) =>
                            setSearchQueries((prev) => ({
                              ...prev,
                              [col.key]: e.target.value,
                            }))
                          }
                          className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0062a0]/20 focus:border-[#0062a0] transition-all"
                        />
                      </div>
                    </div>

                    {/* --- DRAGGABLE RESIZER HANDLE --- */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, col.key)}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-50 transition-colors opacity-0 group-hover:opacity-100 hover:bg-[#0062a0]"
                      title="Drag to resize"
                    />
                  </th>
                );
              })}

              {/* MORE INFO HEADER */}
              {showMoreView && (
                <th className="p-4 w-24 min-w-[96px] max-w-[96px] text-[13px] font-bold text-slate-600 text-center sticky top-0 bg-[#f8fafc] z-40 border-r border-b border-slate-200">
                  More Info
                </th>
              )}

              {/* ACTIONS HEADER */}
              {showActions && (
                <th className="p-4 w-[72px] min-w-[72px] max-w-[72px] text-[13px] font-bold text-slate-600 text-center sticky top-0 right-0 bg-[#f8fafc] z-50 border-l border-b border-slate-200">
                  {ActionChildren || "Actions"}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, index) => {
              const rowId = row.id || row._id;
              const isSelected = selectedRows.includes(rowId);
              const isInactive =
                toggleColumnKey &&
                (row[toggleColumnKey] === false || row[toggleColumnKey] === 0);

              const isLastRow = index === filteredData.length - 1;
              const rowBorderClass = isLastRow ? "" : "border-b";

              return (
                <motion.tr
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.01 }}
                  key={rowId || index}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors group ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${
                    isSelected
                      ? "bg-[#f0f9ff]"
                      : isInactive
                      ? "bg-slate-50/50 text-slate-400"
                      : "bg-white hover:bg-slate-50/80"
                  }`}
                >
                  {/* CHECKBOX CELL */}
                  <td
                    className={`p-4 w-12 min-w-[48px] max-w-[48px] text-center sticky left-0 z-20 border-r border-slate-200 ${rowBorderClass} transition-colors ${
                      isSelected
                        ? "bg-[#f0f9ff]"
                        : isInactive
                        ? "bg-[#fafafa]"
                        : "bg-inherit group-hover:bg-[#f8fafc]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          onSelectionChange?.(
                            isSelected
                              ? selectedRows.filter((id) => id !== rowId)
                              : [...selectedRows, rowId]
                          );
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#0062a0] focus:ring-[#0062a0] cursor-pointer"
                      />
                    </div>
                  </td>

                  {/* DYNAMIC CELLS WITH APPLIED WIDTH */}
                  {columns.map((col, idx) => {
                    let content;
                    const colWidth = colWidths[col.key] || 180;

                    if (col.key === "currentStatus") {
                      content = renderTextStatusBadge(row[col.key]);
                    } else if (col.isStatus && showbinstatus) {
                      content = (
                        <div className="flex items-center justify-center">
                          <StatusIndicator
                            value={row[col.key]}
                            message={row.binStatusMessage}
                          />
                        </div>
                      );
                    } else if (col.isPaid && showWhstatus) {
                      content = (
                        <div className="flex items-center justify-center">
                          <StatusIndicator
                            value={row[col.key]}
                            message={
                              row.warehouseStatusMessage || row.binStatusMessage
                            }
                          />
                        </div>
                      );
                    } else if (col.isToggle && showToggle) {
                      content = (
                        <div className="flex items-center justify-center">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusToggle?.(row);
                            }}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ease-in-out ${
                              row[col.key] ? "bg-[#0062a0]" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                                row[col.key] ? "translate-x-5" : "translate-x-1"
                              }`}
                            />
                          </motion.button>
                        </div>
                      );
                    } else if (col.isQtyIndicator && showQtyStatus) {
                      content = (
                        <div className="flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.3 }}
                            className={`w-3 h-3 rounded-full mx-auto shadow-sm cursor-pointer ${
                              row[col.key] === 0
                                ? "bg-red-500"
                                : row[col.key] < 30
                                ? "bg-yellow-400"
                                : "bg-green-500"
                            }`}
                          />
                        </div>
                      );
                    } else {
                      // Apply truncate for standard text so it cuts off nicely on smaller columns
                      content = (
                        <span
                          title={row[col.key] || "-"}
                          className={`block w-full text-center truncate px-2 ${
                            isInactive
                              ? "opacity-70 text-slate-400"
                              : "text-slate-700"
                          }`}
                        >
                          {row[col.key] || "-"}
                        </span>
                      );
                    }

                    return (
                      <td
                        key={idx}
                        style={{
                          width: colWidth,
                          minWidth: colWidth,
                          maxWidth: colWidth,
                        }}
                        className={`p-4 text-[14px] font-medium align-middle border-r border-slate-200 ${rowBorderClass} text-center overflow-hidden`}
                      >
                        {content}
                      </td>
                    );
                  })}

                  {/* MORE INFO CELL */}
                  {showMoreView && (
                    <td
                      className={`p-4 w-24 min-w-[96px] max-w-[96px] text-center align-middle border-r border-slate-200 ${rowBorderClass}`}
                    >
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoreView?.(row);
                          }}
                          className="text-black hover:text-[#0062a0] transition-colors p-1"
                        >
                          <Eye size={22} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  )}

                  {/* ACTIONS CELL */}
                  {showActions && (
                    <td
                      className={`p-4 w-[72px] min-w-[72px] max-w-[72px] text-center sticky right-0 z-20 border-l border-slate-200 ${rowBorderClass} transition-colors ${
                        isSelected
                          ? "bg-[#f0f9ff]"
                          : isInactive
                          ? "bg-[#fafafa]"
                          : "bg-inherit group-hover:bg-[#f8fafc]"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === rowId ? null : rowId);
                          }}
                          className="text-slate-400 hover:text-[#0062a0] hover:bg-blue-50 p-2 rounded-full transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {openMenuId === rowId && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-14 top-2 z-30 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] flex items-center p-2 gap-3 border border-slate-100"
                              >
                                {onEdit && (
                                  <button
                                    onClick={() => {
                                      onEdit(row);
                                      setOpenMenuId(null);
                                    }}
                                    className="p-2 text-[#0062a0] bg-blue-50/50 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                )}
                                {onView && (
                                  <button
                                    onClick={() => {
                                      onView(row);
                                      setOpenMenuId(null);
                                    }}
                                    className="p-2 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                  >
                                    <Eye size={16} />
                                  </button>
                                )}
                                {onDelete && (
                                  <button
                                    onClick={() => {
                                      onDelete(row);
                                      setOpenMenuId(null);
                                    }}
                                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {!loading && filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white border-t border-slate-200">
            <div className="w-16 h-16 mb-4 bg-slate-50 rounded-full flex items-center justify-center">
              <Search className="text-slate-300" size={24} />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg">
              No records found
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 select-none bg-slate-50/50 border-t border-slate-200">
        <div className="text-sm text-slate-600 font-medium">
          Showing{" "}
          <span className="font-bold text-slate-800">{displayStart}</span> to{" "}
          <span className="font-bold text-slate-800">{displayEnd}</span> of{" "}
          <span className="font-bold text-slate-800">{totalItems}</span> results
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
              Rows per page:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-[#0062a0]/20 focus:border-[#0062a0] transition-all"
            >
              {[10, 20, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="px-3 py-2 text-slate-600 hover:text-[#0062a0] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 flex items-center transition-colors font-medium border-r border-slate-200"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="hidden sm:flex items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .map((page, idx, arr) => (
                  <div key={page} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-3 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() => onPageChange?.(page)}
                      className={`min-w-[40px] h-10 text-sm font-semibold transition-all ${
                        currentPage === page
                          ? "bg-[#0062a0] text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#0062a0]"
                      } ${idx !== 0 ? "border-l border-slate-100" : ""}`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="px-3 py-2 text-slate-600 hover:text-[#0062a0] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-600 flex items-center transition-colors font-medium border-l border-slate-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReUsable_Table;