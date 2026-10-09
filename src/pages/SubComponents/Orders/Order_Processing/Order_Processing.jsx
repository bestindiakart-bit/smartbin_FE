// import { motion } from "framer-motion";
// import { ClipboardList, Plus, RefreshCw, Search, PackageCheck } from "lucide-react";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import Button from "../../../../component/button/Buttons";
// import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
// import StatsCard from "../../../../component/stats/StatsCard";
// import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";
// import { order_processing_allGet } from "../../../../service/Orders_Services/Oreder_Services";

// const CREATE_ROUTE = "order-prcessing-create"; // Preserve existing route spelling.
// const VIEW_ROUTE = "order-Processing-view";
// const pickId = (value) =>
//   value && typeof value === "object" ? String(value._id ?? value.id ?? "") : String(value ?? "");
// const getErrorMessage = (error) =>
//   error?.response?.data?.message || error?.message || "Unable to load orders.";
// const statusName = (value) => {
//   const map = { 0: "Pending", 1: "Confirmed", 2: "Processing", 3: "Shipped", 4: "Delivered", 5: "Cancelled" };
//   return map[value] ?? (typeof value === "string" ? value : "Pending");
// };
// const normalizeOrder = (order, index) => ({
//   id: pickId(order?._id ?? order?.id),
//   orderId: String(order?.orderId ?? order?.orderNumber ?? `Order ${index + 1}`),
//   customerName:
//     order?.customerId?.companyName || order?.customerId?.customerName ||
//     order?.customerName || "-",
//   warehouseName:
//     order?.warehouseId?.warehouseName || order?.warehouseName || "-",
//   status: statusName(order?.orderStatus ?? order?.status),
//   payment: order?.paymentStatus === 1 || order?.paymentStatus === "paid" ? "Paid" : "Unpaid",
//   qtyValue: Array.isArray(order?.items) ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0,
//   itemsCount: Array.isArray(order?.items) ? order.items.length : 0,
//   expectedDate: order?.expectedDate ? String(order.expectedDate).slice(0, 10) : "-",
// });

// export default function Order_Processing() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { permissions = [] } = useSelector((state) => state.permissions || {});
//   // Preserve current module permissions index from the existing page.
//   const access = permissions?.[7] || {};
//   const canView = Boolean(access.view);
//   const canCreate = Boolean(access.create);
//   const canEdit = Boolean(access.edit);

//   const [orders, setOrders] = useState([]);
//   const [query, setQuery] = useState("");
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => { dispatch(fetchPermissions()); }, [dispatch]);

//   useEffect(() => {
//     let active = true;
//     const fetchOrders = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const response = await order_processing_allGet(page, limit);
//         const body = response?.data || {};
//         const data = body.data || {};
//         const raw = Array.isArray(data.orders) ? data.orders :
//           Array.isArray(data.records) ? data.records :
//           Array.isArray(data) ? data :
//           Array.isArray(body.orders) ? body.orders : [];
//         if (!active) return;
//         setOrders(raw.map(normalizeOrder));
//         const total = Number(data.total ?? data.totalCount ?? data.pagination?.total ?? body.total);
//         const pages = Number(data.totalPages ?? data.pagination?.totalPages ?? body.totalPages);
//         // Do not invent a total count if API doesn't return one.
//         setPagination({
//           page,
//           total: Number.isFinite(total) ? total : null,
//           totalPages: Number.isFinite(pages) && pages > 0 ? pages : null,
//         });
//       } catch (err) {
//         if (active) { setError(getErrorMessage(err)); setOrders([]); }
//       } finally { if (active) setLoading(false); }
//     };
//     fetchOrders();
//     return () => { active = false; };
//   }, [page, limit, reloadKey]);

//   const filteredOrders = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return q ? orders.filter((row) => [row.orderId, row.customerName, row.status, row.warehouseName]
//       .some((value) => String(value).toLowerCase().includes(q))) : orders;
//   }, [query, orders]);

//   const goEdit = useCallback((row) => {
//     if (row?.id && canEdit) navigate(CREATE_ROUTE, { state: { mode: "edit", rowId: row.id } });
//   }, [navigate, canEdit]);
//   const goView = useCallback((row) => {
//     if (row?.id && canView) navigate(VIEW_ROUTE, { state: { rowId: row.id } });
//   }, [navigate, canView]);

//   const columns = [
//     { header: "Order Number", key: "orderId" },
//     { header: "Customer", key: "customerName", isCustomer: true },
//     { header: "Warehouse", key: "warehouseName" },
//     { header: "Status", key: "status", isStatus: true },
//     { header: "Payment Status", key: "payment", isPaid: true },
//     { header: "Item Quantity", key: "qtyValue" },
//     { header: "Expected Date", key: "expectedDate" },
//   ];

//   const stats = [
//     { title: "Orders on this page", count: orders.length, footerText: "Current API page", icon: <ClipboardList /> },
//     { title: "Items on this page", count: orders.reduce((sum, o) => sum + o.itemsCount, 0), footerText: "Order lines", icon: <PackageCheck /> },
//   ];
//   const canNext = pagination.totalPages != null ? page < pagination.totalPages : orders.length === limit;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#fcfdfe] p-4 md:p-8">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Order <span className="text-[#0062a0]">Processing</span></h1>
//           <p className="text-[#0062a0] font-medium mt-1">Order Management System</p>
//         </div>
//         <div className="flex gap-3">
//           <button type="button" aria-label="Refresh orders" onClick={() => setReloadKey((v) => v + 1)}
//             className="rounded-xl border p-3 hover:bg-slate-100 disabled:opacity-50" disabled={loading}>
//             <RefreshCw size={18} className={loading ? "animate-spin" : ""}/>
//           </button>
//           <Button variant="primary" disabled={!canCreate} onClick={() => navigate(CREATE_ROUTE, { state: { mode: "create" } })}>
//             <Plus size={16}/> Order Processing
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
//         {stats.map((item) => <StatsCard key={item.title} {...item}/>)}
//       </div>

//       <div className="bg-white border border-slate-100 rounded-[28px] shadow-sm overflow-hidden">
//         <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//           <div className="flex items-center gap-2 border rounded-xl px-3 w-full sm:max-w-md">
//             <Search size={18} className="text-slate-400" />
//             <input className="w-full py-3 outline-none text-sm" value={query} onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search orders on this page" aria-label="Search orders" />
//           </div>
//           <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
//             className="border rounded-xl p-3 text-sm" aria-label="Rows per page">
//             {[10, 20, 50].map((n) => <option key={n} value={n}>{n} per page</option>)}
//           </select>
//         </div>
//         {error && <p role="alert" className="p-4 text-red-600">{error}</p>}
//         {loading ? <p className="p-8 text-slate-500">Loading orders...</p> :
//           filteredOrders.length ? (
//             <ReUsable_Table columns={columns} data={filteredOrders} showActions={true}
//               showStatusBadge={true} showPaidBadge={true} showToggle={false} showQtyStatus={false}
//               onView={canView ? goView : undefined} onEdit={canEdit ? goEdit : undefined}
//               onRowClick={canView ? goView : undefined} />
//           ) : <p className="p-8 text-slate-500">No orders found.</p>
//         }
//         <div className="border-t p-4 flex items-center justify-between gap-3">
//           <span className="text-sm text-slate-500">Page {page}{pagination.totalPages ? ` of ${pagination.totalPages}` : ""}
//             {pagination.total != null ? ` · ${pagination.total} total orders` : ""}</span>
//           <div className="flex gap-2">
//             <button className="border px-4 py-2 rounded-lg disabled:opacity-40" disabled={page <= 1 || loading}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
//             <button className="border px-4 py-2 rounded-lg disabled:opacity-40" disabled={!canNext || loading}
//               onClick={() => setPage((p) => p + 1)}>Next</button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }


import { motion } from "framer-motion";
import { ClipboardList, Plus, RefreshCw, Search, PackageCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import ReUsable_Table from "../../../../component/Table/ReUsable_Table";
import StatsCard from "../../../../component/stats/StatsCard";
import { fetchPermissions } from "../../../../store/Permission_Store/Permission_Slice";
import { order_processing_allGet } from "../../../../service/Orders_Services/Oreder_Services";

const CREATE_ROUTE = "order-prcessing-create";
const VIEW_ROUTE = "order-Processing-view";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id ?? value.id ?? value.rowId ?? value.rowID ?? "");
  }
  return String(value);
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unable to load orders.";

const STATUS_MAP = {
  1: "New",
  2: "Purchase Order Sent",
  3: "Sale Order Confirmation",
  4: "Delivered",
  5: "GRN Booked",
  6: "Cancelled",
};

const normalizeOrder = (order, index) => ({
  id: getId(order?._id ?? order?.id),
  _id: getId(order?._id ?? order?.id),
  orderId: String(order?.orderId ?? order?.orderNumber ?? `Order ${index + 1}`),
  customerName: order?.customerId?.companyName || order?.customerId?.customerName || order?.customerName || "-",
  warehouseName: order?.warehouseId?.warehouseName || order?.warehouseName || "-",
  status: STATUS_MAP[order?.orderStatus ?? order?.status] || order?.orderStatusLabel || "-",
  payment: [1, "1", "paid", "PAID"].includes(order?.paymentStatus) ? "Paid" : "Unpaid",
  qtyValue: Array.isArray(order?.items)
    ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    : 0,
  itemsCount: Array.isArray(order?.items) ? order.items.length : 0,
  expectedDate: order?.expectedDate ? String(order.expectedDate).slice(0, 10) : "-",
});

export default function Order_Processing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { permissions = [] } = useSelector((state) => state.permissions || {});
  const access = permissions?.[7] || {};
  const canView = Boolean(access.view);
  const canCreate = Boolean(access.create);
  const canEdit = Boolean(access.edit);

  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: null, totalPages: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await order_processing_allGet(page, limit);
        const body = response?.data || {};
        const data = body.data || {};
        const raw = Array.isArray(data.orders) ? data.orders
          : Array.isArray(data.records) ? data.records
          : Array.isArray(data) ? data
          : Array.isArray(body.orders) ? body.orders : [];

        if (!active) return;
        setOrders(raw.map(normalizeOrder));

        const totalRaw = data.total ?? data.totalCount ?? data.pagination?.total ?? body.total;
        const pagesRaw = data.totalPages ?? data.pagination?.totalPages ?? body.totalPages;
        const total = totalRaw != null ? Number(totalRaw) : null;
        const pages = pagesRaw != null ? Number(pagesRaw) : null;
        setPagination({
          total: Number.isFinite(total) ? total : null,
          totalPages: Number.isFinite(pages) && pages > 0
            ? pages : Number.isFinite(total) ? Math.max(1, Math.ceil(total / limit)) : null,
        });
      } catch (err) {
        if (active) {
          setOrders([]);
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadOrders();
    return () => { active = false; };
  }, [page, limit, reloadKey]);

  const filteredOrders = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return orders;
    return orders.filter((row) =>
      [row.orderId, row.customerName, row.warehouseName, row.status]
        .some((value) => String(value).toLowerCase().includes(text)),
    );
  }, [query, orders]);

  const resolveOrderId = useCallback((row) => {
    if (typeof row === "string") {
      return orders.find((item) => item.id === row || item.orderId === row)?.id || row;
    }
    if (typeof row === "number") return orders[row]?.id || "";
    return getId(row?._id ?? row?.id ?? row?.rowId ?? row?.original?._id);
  }, [orders]);

  const goView = useCallback((row) => {
    if (!canView) return;
    const rowId = resolveOrderId(row);
    if (!rowId) return;
    navigate(VIEW_ROUTE, {
      state: { rowId },
    });
  }, [navigate, canView, resolveOrderId]);

  const goEdit = useCallback((row) => {
    if (!canEdit) return;
    const rowId = resolveOrderId(row);
    if (!rowId) return;
    navigate(CREATE_ROUTE, {
      state: { mode: "edit", rowId },
    });
  }, [navigate, canEdit, resolveOrderId]);

  const columns = [
    { header: "Order Number", key: "orderId" },
    { header: "Customer", key: "customerName", isCustomer: true },
    { header: "Warehouse", key: "warehouseName" },
    { header: "Status", key: "status", isStatus: true },
    { header: "Payment Status", key: "payment", isPaid: true },
    { header: "Item Quantity", key: "qtyValue" },
    { header: "Expected Date", key: "expectedDate" },
  ];

  const stats = [
    {
      title: "Orders on this page",
      count: orders.length,
      footerText: "Current API page",
      icon: <ClipboardList />,
    },
    {
      title: "Items on this page",
      count: orders.reduce((sum, order) => sum + order.itemsCount, 0),
      footerText: "Order lines",
      icon: <PackageCheck />,
    },
  ];

  const canNext = pagination.totalPages != null
    ? page < pagination.totalPages
    : orders.length === limit;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Order <span className="text-[#0062a0]">Processing</span>
          </h1>
          <p className="text-[#0062a0] font-medium mt-1">
            Order Management System
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Refresh orders"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={loading}
            className="rounded-xl border p-3 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <Button
            variant="primary"
            disabled={!canCreate}
            onClick={() => navigate(CREATE_ROUTE, { state: { mode: "create" } })}
          >
            <Plus size={16} /> Order Processing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {stats.map((item) => <StatsCard key={item.title} {...item} />)}
      </div>

      <div className="bg-white border border-slate-100 rounded-[28px] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 border rounded-xl px-3 w-full sm:max-w-md">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full py-3 outline-none text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders on this page"
              aria-label="Search orders"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="border rounded-xl p-3 text-sm"
            aria-label="Rows per page"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>

        {error && <p role="alert" className="p-4 text-red-600">{error}</p>}
        {loading ? (
          <p className="p-8 text-slate-500">Loading orders...</p>
        ) : filteredOrders.length ? (
          <ReUsable_Table
            columns={columns}
            data={filteredOrders}
            showActions={true}
            showStatusBadge={true}
            showPaidBadge={true}
            showToggle={false}
            showQtyStatus={false}
            onView={canView ? goView : undefined}
            onEdit={canEdit ? goEdit : undefined}
            onRowClick={canView ? goView : undefined}
          />
        ) : (
          <p className="p-8 text-slate-500">No orders found.</p>
        )}

        <div className="border-t p-4 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Page {page}
            {pagination.totalPages ? ` of ${pagination.totalPages}` : ""}
            {pagination.total != null ? ` · ${pagination.total} total orders` : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="border px-4 py-2 rounded-lg disabled:opacity-40"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="border px-4 py-2 rounded-lg disabled:opacity-40"
              disabled={!canNext || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
