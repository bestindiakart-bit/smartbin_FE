import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Filter, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import LogoSmartBin from "../../../../assets/LogoSmartBin.svg";

// Static Dummy Data with multiple items per customer
const staticTableData = [
  {
    id: 1,
    customerName: "ABC Pvt Ltd",
    items: [
      {
        itemName: "Hydraulic Pump",
        l3Months: 120,
        l6Months: 250,
        stock: 80,
        rol: 40,
        required: { m1: 10, m2: 20, m3: 15, m4: 18, m5: 25, m6: 30 }
      },
      {
        itemName: "Hydraulic Hose",
        l3Months: 300,
        l6Months: 600,
        stock: 200,
        rol: 100,
        required: { m1: 30, m2: 35, m3: 40, m4: 45, m5: 50, m6: 55 }
      }
    ]
  },
  {
    id: 2,
    customerName: "XYZ Industries",
    items: [
      {
        itemName: "Motor Drive",
        l3Months: 85,
        l6Months: 180,
        stock: 45,
        rol: 30,
        required: { m1: 8, m2: 12, m3: 10, m4: 15, m5: 18, m6: 20 }
      }
    ]
  },
  {
    id: 3,
    customerName: "PQR Manufacturing",
    items: [
      {
        itemName: "Control Valve",
        l3Months: 200,
        l6Months: 420,
        stock: 150,
        rol: 60,
        required: { m1: 25, m2: 30, m3: 28, m4: 32, m5: 35, m6: 40 }
      },
      {
        itemName: "Pressure Gauge",
        l3Months: 150,
        l6Months: 310,
        stock: 90,
        rol: 45,
        required: { m1: 15, m2: 20, m3: 18, m4: 22, m5: 25, m6: 28 }
      },
      {
        itemName: "Flow Meter",
        l3Months: 100,
        l6Months: 210,
        stock: 60,
        rol: 30,
        required: { m1: 10, m2: 15, m3: 12, m4: 16, m5: 18, m6: 20 }
      }
    ]
  },
  {
    id: 4,
    customerName: "LMN Energy",
    items: [
      {
        itemName: "Transformer",
        l3Months: 45,
        l6Months: 95,
        stock: 25,
        rol: 20,
        required: { m1: 5, m2: 8, m3: 7, m4: 10, m5: 12, m6: 15 }
      }
    ]
  },
  {
    id: 5,
    customerName: "RST Construction",
    items: [
      {
        itemName: "Conveyor Belt",
        l3Months: 300,
        l6Months: 650,
        stock: 200,
        rol: 100,
        required: { m1: 40, m2: 45, m3: 50, m4: 55, m5: 60, m6: 65 }
      },
      {
        itemName: "Gearbox",
        l3Months: 80,
        l6Months: 170,
        stock: 50,
        rol: 25,
        required: { m1: 10, m2: 12, m3: 14, m4: 16, m5: 18, m6: 20 }
      }
    ]
  }
];

// Nested Table Component
const NestedTable = ({ data, labels }) => {
  const months = [
    { key: 'm1', label: labels?.m1 || 'M1', value: data?.m1 || 0 },
    { key: 'm2', label: labels?.m2 || 'M2', value: data?.m2 || 0 },
    { key: 'm3', label: labels?.m3 || 'M3', value: data?.m3 || 0 },
    { key: 'm4', label: labels?.m4 || 'M4', value: data?.m4 || 0 },
    { key: 'm5', label: labels?.m5 || 'M5', value: data?.m5 || 0 },
    { key: 'm6', label: labels?.m6 || 'M6', value: data?.m6 || 0 }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden border border-blue-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr style={{ backgroundColor: '#0b5d97' }}>
              {months.map((month, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-blue-400 last:border-r-0"
                >
                  {month.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white/80 backdrop-blur-sm">
              {months.map((month, idx) => (
                <td
                  key={idx}
                  className="px-3 py-3 text-center text-sm font-semibold text-gray-800 border-r border-gray-200 last:border-r-0"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="inline-block"
                  >
                    <span className="bg-blue-100 px-3 py-1.5 rounded-lg text-blue-700 font-bold">
                      {month.value}
                    </span>
                  </motion.div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stock Status Component
const StockStatus = ({ stock, rol }) => {
  const status = stock <= rol ? "critical" : stock <= rol * 1.5 ? "warning" : "normal";
  
  const statusConfig = {
    critical: { color: "text-red-600", bg: "bg-red-100", label: "Critical", text: "text-red-700" },
    warning: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Warning", text: "text-yellow-700" },
    normal: { color: "text-green-600", bg: "bg-green-100", label: "Normal", text: "text-green-700" }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        {config.label}
      </span>
      <span className={`text-sm font-bold ${config.text}`}>{stock}</span>
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ label, options, selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        style={{ borderColor: '#0b5d97/40' }}
      >
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0b5d97', color: 'white' }}>
          {selected}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-blue-50 ${
                  selected === opt ? "text-white" : "text-slate-600"
                }`}
                style={selected === opt ? { backgroundColor: '#0b5d97' } : {}}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Component
const ForCast_FullViewModel = ({ 
  isOpen, 
  onClose,
  data = staticTableData,
  showRequiredColumn = true,
  enableCustomerGrouping = true,
  customLabels = {},
  onRowClick = null
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All");

  // Flatten data for search and filter (when grouping is disabled)
  const flattenedData = useMemo(() => {
    if (!enableCustomerGrouping) {
      const flat = [];
      data.forEach(customer => {
        customer.items.forEach(item => {
          flat.push({
            id: `${customer.id}-${item.itemName}`,
            customerName: customer.customerName,
            ...item
          });
        });
      });
      return flat;
    }
    return data;
  }, [data, enableCustomerGrouping]);

  // Get unique customers for filter
  const uniqueCustomers = useMemo(() => {
    const customers = ["All", ...new Set(data.map(item => item.customerName))];
    return customers;
  }, [data]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!enableCustomerGrouping) {
      let flatData = flattenedData;
      
      if (searchQuery) {
        flatData = flatData.filter(item =>
          item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (customerFilter !== "All") {
        flatData = flatData.filter(item => item.customerName === customerFilter);
      }
      
      return flatData;
    } else {
      let groupedData = data;
      
      if (searchQuery) {
        groupedData = groupedData.filter(customer =>
          customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.items.some(item => item.itemName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      if (customerFilter !== "All") {
        groupedData = groupedData.filter(customer => customer.customerName === customerFilter);
      }
      
      return groupedData;
    }
  }, [data, flattenedData, enableCustomerGrouping, searchQuery, customerFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    if (enableCustomerGrouping) {
      let totalL3 = 0, totalL6 = 0, totalStock = 0, totalRol = 0;
      filteredData.forEach(customer => {
        customer.items.forEach(item => {
          totalL3 += item.l3Months;
          totalL6 += item.l6Months;
          totalStock += item.stock;
          totalRol += item.rol;
        });
      });
      return { l3Months: totalL3, l6Months: totalL6, stock: totalStock, rol: totalRol };
    } else {s
      return filteredData.reduce((acc, item) => ({
        l3Months: acc.l3Months + (item.l3Months || 0),
        l6Months: acc.l6Months + (item.l6Months || 0),
        stock: acc.stock + (item.stock || 0),
        rol: acc.rol + (item.rol || 0)
      }), { l3Months: 0, l6Months: 0, stock: 0, rol: 0 });
    }
  }, [filteredData, enableCustomerGrouping]);

  // Render flat table (no grouping) - All rows shown with STICKY HEADER
  const renderFlatTable = () => (
    <div className="relative">
      <table className="w-full min-w-[1000px]">
        <thead className="sticky top-0 z-20">
          <tr style={{ backgroundColor: '#0b5d97' }}>
            <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Customer Name</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Name</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">L3 Months</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">L6 Months</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Stock</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">ROL</th>
            {showRequiredColumn && (
              <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                {customLabels.requiredColumn || "Required (Monthly Breakdown)"}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={showRequiredColumn ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            filteredData.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0b5d97' }}>
                      <span className="text-white text-xs font-bold">
                        {row.customerName?.charAt(0) || '?'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{row.customerName}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-gray-700">{row.itemName}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {row.l3Months}
                    </span>
                  </motion.div>
                </td>
                <td className="px-4 py-4 text-center">
                  <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {row.l6Months}
                    </span>
                  </motion.div>
                </td>
                <td className="px-4 py-4">
                  <StockStatus stock={row.stock} rol={row.rol} />
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-bold text-gray-800">{row.rol}</span>
                </td>
                {showRequiredColumn && (
                  <td className="px-4 py-4">
                    <NestedTable data={row.required} labels={customLabels} />
                  </td>
                )}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Render grouped table (with all rows expanded by default - no collapse) with STICKY HEADER
  const renderGroupedTable = () => (
    <div className="relative">
      <table className="w-full min-w-[1000px]">
        <thead className="sticky top-0 z-20">
          <tr style={{ backgroundColor: '#0b5d97' }}>
            <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Customer Name</th>
            <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Name</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">L3 Months</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">L6 Months</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Stock</th>
            <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">ROL</th>
            {showRequiredColumn && (
              <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                {customLabels.requiredColumn || "Required (Monthly Breakdown)"}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={showRequiredColumn ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            filteredData.map((customer, customerIdx) => (
              <React.Fragment key={customer.id}>
                {/* Customer Header Row - Shows customer name once */}
                <tr className="bg-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0b5d97' }}>
                        <span className="text-white text-xs font-bold">
                          {customer.customerName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{customer.customerName}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({customer.items.length} items)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" colSpan={showRequiredColumn ? 6 : 5}>
                    {/* Empty cells to maintain table structure */}
                  </td>
                </tr>

                {/* All Customer Items Rows - Always visible, no collapse */}
                {customer.items.map((item, itemIdx) => (
                  <motion.tr
                    key={`${customer.id}-${itemIdx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIdx * 0.05 }}
                    className="hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                    onClick={() => onRowClick && onRowClick({ customerName: customer.customerName, ...item })}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700 ml-6">
                        {item.itemName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.l3Months}
                        </span>
                      </motion.div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.l6Months}
                        </span>
                      </motion.div>
                    </td>
                    <td className="px-4 py-3">
                      <StockStatus stock={item.stock} rol={item.rol} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-800">{item.rol}</span>
                    </td>
                    {showRequiredColumn && (
                      <td className="px-4 py-3">
                        <NestedTable data={item.required} labels={customLabels} />
                      </td>
                    )}
                  </motion.tr>
                ))}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[999] bg-black/50 flex flex-col overflow-hidden"
        >
          <div className="bg-[#fcfdfe] flex-1 flex flex-col overflow-hidden w-full h-full">
            
            {/* Header */}
            <header className="px-6 md:px-8 py-5 flex flex-wrap items-center justify-between border-b gap-4 flex-shrink-0" style={{ backgroundColor: '#0b5d97' }}>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-all font-bold group cursor-pointer"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-md cursor-pointer">Back to Dashboard</span>
              </button>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase flex-1 text-center hidden md:block">
                {customLabels.title || "Forecast"} <span className="text-white/80">{customLabels.subtitle || "Viewer"}</span>
              </h1>
              <div className="flex items-center justify-end">
                <img src={LogoSmartBin} alt="SmartBin Logo" className="h-9 w-auto object-contain drop-shadow-sm brightness-0 invert" />
              </div>
            </header>

            {/* Toolbar with Filters */}
            <div className="px-6 md:px-8 py-4 flex flex-col xl:flex-row gap-4 xl:items-center justify-between bg-slate-50/80 border-b border-slate-200 flex-shrink-0">
              <div className="relative group w-full xl:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400 group-focus-within:text-[#0b5d97] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by customer or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b5d97] focus:border-[#0b5d97] shadow-sm transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold shadow-sm">
                  <Filter size={16} className="text-slate-400" /> Filters
                </div>
                <FilterDropdown 
                  label="Customer" 
                  options={uniqueCustomers}
                  selected={customerFilter}
                  onSelect={setCustomerFilter}
                />
              </div>
            </div>

            {/* Table Area with Sticky Header */}
            <div className="flex-1 overflow-auto bg-slate-50/30">
              <div className="bg-white border border-slate-200 shadow-md overflow-hidden">
                <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {enableCustomerGrouping ? renderGroupedTable() : renderFlatTable()}
                </div>
                
                {/* Totals Row */}
                {filteredData.length > 0 && (
                  <div className="bg-gray-100 border-t-2 border-gray-300 px-4 py-3 sticky bottom-0 z-10">
                    <div className="flex items-center justify-end gap-8">
                      <div className="text-sm font-bold text-gray-900">
                        Total L3: <span className="font-bold" style={{ color: '#0b5d97' }}>{totals.l3Months}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        Total L6: <span className="font-bold" style={{ color: '#0b5d97' }}>{totals.l6Months}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        Total Stock: <span className="font-bold" style={{ color: '#0b5d97' }}>{totals.stock}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        Total ROL: <span className="font-bold" style={{ color: '#0b5d97' }}>{totals.rol}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForCast_FullViewModel;