import { AnimatePresence, motion } from "framer-motion";

import {

  ArrowLeft, Check, Loader2, Pencil, RefreshCw,

  Truck, X, AlertCircle, ArrowUp, ArrowDown,

} from "lucide-react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";

import {

  order_processing_getById,

  order_processing_statuses,

  order_processing_updateStatus,

} from "../../../../service/Orders_Services/Oreder_Services";

const FALLBACK_STAGES = [

  { key: "NEW", value: 1, label: "New", allowedFrom: [], changedBy: [] },

  { key: "PURCHASE_ORDER_SENT", value: 2, label: "Purchase Order Sent", allowedFrom: [1], changedBy: ["CUSTOMER"] },

  { key: "SALE_ORDER_CONFIRMED", value: 3, label: "Sale Order Confirmation", allowedFrom: [2], changedBy: ["OWNER"] },

  { key: "DELIVERED", value: 4, label: "Delivered", allowedFrom: [3], changedBy: ["OWNER"] },

  { key: "GRN_BOOKED", value: 5, label: "GRN Booked", allowedFrom: [4], changedBy: ["CUSTOMER"] },

  { key: "CANCELLED", value: 6, label: "Cancelled", allowedFrom: [1, 2], changedBy: ["CUSTOMER", "OWNER"] },

];

const labelOf = (value, keys = ["name"]) => {

  if (value == null || value === "") return "-";

  if (typeof value !== "object") return String(value);

  for (const key of keys) {

    if (value[key] != null && value[key] !== "") return String(value[key]);

  }

  return String(value._id || "-");

};

const formatDate = (value) => {

  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())

    ? String(value)

    : date.toLocaleDateString("en-IN", {

      day: "numeric",

      month: "short",

      year: "numeric",

    });

};

const errorText = (error) =>

  error?.response?.data?.data?.message ||

  error?.response?.data?.message ||

  error?.message ||

  "Unable to complete the request.";

const InfoItem = ({ label, value }) => (

  <div className="min-w-0 space-y-1.5">

    <p className="text-sm font-medium text-slate-400">{label}</p>

    <p className="text-base md:text-lg font-semibold text-slate-900 break-words">

      {value ?? "-"}

    </p>

  </div>

);

const getRegularStages = (stages) =>

  stages

    .filter((stage) => stage.key !== "CANCELLED")

    .sort((a, b) => Number(a.value) - Number(b.value));


const getStatusChoices = (stages, currentStatus) => {

  const regular = getRegularStages(stages);

  const currentIndex = regular.findIndex(

    (stage) => Number(stage.value) === Number(currentStatus),

  );

  if (currentIndex < 0) return [];

  const previous = regular[currentIndex - 1];

  const current = regular[currentIndex];

  const next = regular[currentIndex + 1];

  const cancelled = stages.find(

    (stage) => stage.key === "CANCELLED",

  );

  const options = [];

  if (previous) {

    options.push({

      ...previous,

      type: "previous",

      disabled: false,

      backendAllowed: true, // Let backend validate rollback; reason is mandatory.

    });

  }

  options.push({

    ...current,

    type: "current",

    disabled: true,

    backendAllowed: false,

  });

  if (next) {

    options.push({

      ...next,

      type: "next",

      disabled: false,

      backendAllowed: next.allowedFrom?.some(

        (value) => Number(value) === Number(currentStatus),

      ) ?? false,

    });

  }

  if (

    cancelled &&

    cancelled.allowedFrom?.some(

      (value) => Number(value) === Number(currentStatus),

    )

  ) {

    options.push({

      ...cancelled,

      type: "cancel",

      disabled: false,

      backendAllowed: true,

    });

  }

  return options;

};

/* =====================================================

   RIGHT SIDE — STATUS TRACKER

===================================================== */

function OrderTimeline({

  status,

  stages,

  logs,

  statusesLoaded,

  onChangeStatus,

  updating,

}) {

  const ordered = useMemo(() => getRegularStages(stages), [stages]);

  const current = stages.find(

    (stage) => Number(stage.value) === Number(status),

  );

  const cancelled = current?.key === "CANCELLED";

  const regularLogs = logs.filter((log) =>

    ordered.some((stage) => Number(stage.value) === Number(log.status)),

  );

  const lastRegularLog = regularLogs[regularLogs.length - 1];

  const reached = cancelled

    ? Number(lastRegularLog?.status ?? 1)

    : Number(status);

  const currentIndex = Math.max(

    0,

    ordered.findIndex((stage) => Number(stage.value) === reached),

  );

  const finalIndex = ordered.length - 1;

  const rowHeight = 92;

  const nodeY = (index) => 19 + index * rowHeight;

  const moving = !cancelled && currentIndex > 0 && currentIndex < finalIndex;

  const fromY = nodeY(Math.max(0, currentIndex - 1)) - 14;

  const toY = nodeY(currentIndex) - 14;

  const choices = statusesLoaded ? getStatusChoices(stages, status) : [];

  const canChange = !cancelled &&

    currentIndex < finalIndex &&

    choices.some((choice) => !choice.disabled);

  return (

    <section className="rounded-[24px] border border-slate-200 bg-white p-5 md:p-6 shadow-sm">

      <div className="mb-7">

        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0062a0]">

          Live Order Journey

        </p>

        <h2 className="mt-2 text-xl md:text-2xl font-bold text-slate-900">

          Delivery progress

        </h2>

        <p className="text-sm text-slate-500 mt-1">

          Synced with order status

        </p>

        <span className={`inline-block mt-3 rounded-full px-3 py-1 text-xs font-semibold ${cancelled ? "bg-red-50 text-red-700" : "bg-sky-50 text-[#0062a0]"

          }`}>

          {current?.label || `Status ${status ?? "-"}`}

        </span>

      </div>

      <div className="relative pl-1">

        <div

          className="absolute top-[19px] w-[3px] rounded-full bg-slate-200"

          style={{ left: 23, height: Math.max(0, finalIndex * rowHeight) }}

        />

        <motion.div

          initial={{ height: 0 }}

          animate={{ height: currentIndex * rowHeight }}

          transition={{ duration: 0.8 }}

          className="absolute top-[19px] w-[3px] rounded-full bg-[#0062a0]"

          style={{ left: 23 }}

        />

        {/* Truck faces downward, tyres on right */}

        <motion.div

          key={`truck-${status}`}

          initial={false}

          animate={moving

            ? { y: [fromY, toY, fromY] }

            : { y: toY }}

          transition={moving

            ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }

            : { duration: 0.5 }}

          className="absolute z-20 pointer-events-none"

          style={{ left: 12, top: 3, width: 28, height: 28 }}

        >

          <Truck

            size={28}

            strokeWidth={2.4}

            className="text-[#0062a0]"

            style={{ transform: "rotate(360deg)" }}

          />

        </motion.div>

        {ordered.map((stage, index) => {

          const completed = index < currentIndex;

          const active = !cancelled &&

            Number(stage.value) === Number(status);

          const highlighted = completed || active ||

            (cancelled && index <= currentIndex);

          const reachedDate = logs.find(

            (log) => Number(log.status) === Number(stage.value),

          )?.changedAt;

          return (

            <div

              key={stage.key}

              className="relative grid grid-cols-[38px_minmax(0,1fr)] gap-5"

              style={{ height: rowHeight }}

            >

              <div className="flex justify-center">

                <div className={`relative z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 text-sm font-bold ${active

                  ? "border-[#0062a0] bg-[#0062a0] text-sky-50"

                  : highlighted

                    ? "border-emerald-500 bg-emerald-500 text-white"

                    : "border-slate-300 bg-white text-slate-500"

                  }`}>

                  {completed || (cancelled && index <= currentIndex)

                    ? <Check size={18} strokeWidth={2.8} />

                    : index + 1}

                  {active && (

                    <motion.span

                      className="absolute inset-[-7px] rounded-full border-2 border-sky-300"

                      animate={{

                        opacity: [0.7, 0, 0.7],

                        scale: [1, 1.22, 1],

                      }}

                      transition={{ duration: 2, repeat: Infinity }}

                    />

                  )}

                </div>

              </div>

              <div className="pt-0.5 min-w-0">

                <p className={`text-sm md:text-[15px] font-semibold leading-snug ${active

                  ? "text-[#0062a0]"

                  : highlighted

                    ? "text-slate-900"

                    : "text-slate-400"

                  }`}>

                  {stage.label}

                </p>

                <p className="mt-1 text-xs text-slate-500">

                  {active

                    ? "Current stage"

                    : highlighted

                      ? reachedDate ? formatDate(reachedDate) : "Completed"

                      : "Upcoming"}

                </p>

              </div>

            </div>

          );

        })}

      </div>

      {cancelled && (

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">

          <X size={18} className="shrink-0" />

          Order Cancelled

        </div>

      )}

      <div className="mt-4 border-t border-slate-100 pt-5">

        <div className="flex items-center justify-between gap-3">

          <div>

            <p className="font-semibold text-sm text-slate-800">

              Update order status

            </p>

            <p className="text-xs text-slate-500 mt-1">

              {cancelled || currentIndex === finalIndex

                ? "Order has reached a terminal status."

                : "View previous, current and next status"}

            </p>

          </div>

          <button

            type="button"

            onClick={onChangeStatus}

            disabled={!statusesLoaded || !canChange || updating}

            className="rounded-xl bg-[#0062a0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004c80] disabled:opacity-40 disabled:cursor-not-allowed"

          >

            {updating ? "Updating..." : "Change"}

          </button>

        </div>

        {!statusesLoaded && (

          <p className="mt-3 text-xs text-amber-700">

            Status definitions unavailable. Refresh to retry.

          </p>

        )}

      </div>

      {logs.length > 0 && (

        <div className="mt-6 border-t border-slate-100 pt-5">

          <h3 className="text-sm font-semibold text-slate-700 mb-3">

            Status activity

          </h3>

          <div className="space-y-3">

            {[...logs].reverse().map((log, index) => (

              <div key={`${log.changedAt}-${index}`} className="text-sm">

                <p className="font-semibold text-slate-800">

                  {log.statusLabel ||

                    stages.find(

                      (stage) => Number(stage.value) === Number(log.status),

                    )?.label ||

                    `Status ${log.status}`}

                </p>

                <p className="text-xs text-slate-500 mt-1">

                  {log.changedByName || log.role || "System"} ·{" "}

                  {formatDate(log.changedAt)}

                </p>

                {log.remarks && (

                  <p className="text-xs text-slate-500 mt-1 break-words">

                    {log.remarks}

                  </p>

                )}

              </div>

            ))}

          </div>

        </div>

      )}

    </section>

  );

}

/* =====================================================

   CHANGE STATUS MODAL

===================================================== */

function ChangeStatusModal({

  open,

  onClose,

  onConfirm,

  currentStatus,

  stages,

  updating,

  error,

}) {

  const choices = useMemo(

    () => getStatusChoices(stages, currentStatus),

    [stages, currentStatus],

  );

  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {

    if (!open) return;

    const next = choices.find(

      (choice) => choice.type === "next" && choice.backendAllowed,

    );

    setSelectedStatus(String(next?.value ?? choices.find(

      (choice) => !choice.disabled && choice.backendAllowed,

    )?.value ?? ""));

  }, [open, choices]);

  const selected = choices.find(

    (choice) => String(choice.value) === selectedStatus,

  );

  if (!open) return null;

  return (

    <motion.div

      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}

    >

      <motion.div

        initial={{ opacity: 0, scale: 0.96 }}

        animate={{ opacity: 1, scale: 1 }}

        exit={{ opacity: 0, scale: 0.96 }}

        role="dialog"

        aria-modal="true"

        aria-labelledby="change-status-title"

        className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-xl"

      >

        <div className="flex items-center justify-between gap-3">

          <div>

            <h2 id="change-status-title" className="text-xl font-bold text-slate-900">

              Change Order Status

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Select the status for this order.

            </p>

          </div>

          <button

            type="button"

            onClick={onClose}

            disabled={updating}

            className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"

            aria-label="Close"

          >

            <X size={20} />

          </button>

        </div>

        <div className="mt-6 space-y-2">

          {choices.map((choice) => {

            const selectedChoice = selectedStatus === String(choice.value);

            const current = choice.type === "current";

            const previous = choice.type === "previous";

            const cancel = choice.type === "cancel";

            return (

              <label

                key={choice.key}

                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${current

                  ? "border-[#0062a0] bg-[#0062a0]"

                  : selectedChoice

                    ? "border-[#0062a0] bg-sky-50 cursor-pointer"

                    : "border-slate-200 hover:bg-slate-50 cursor-pointer"

                  }`}

              >

                <input

                  type="radio"

                  name="order-status"

                  value={choice.value}

                  checked={selectedChoice}

                  onChange={() => setSelectedStatus(String(choice.value))}

                  disabled={current || updating || !choice.backendAllowed}

                  className="h-4 w-4 accent-[#0062a0]"

                />

                <div className="flex-1 min-w-0">

                  <p className={`font-semibold text-sm ${current ? "text-white" : cancel ? "text-red-700" : "text-slate-900"

                    }`}>

                    {choice.label}

                  </p>

                </div>

                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${current

                  ? "bg-white/20 text-white"

                  : cancel

                    ? "bg-red-50 text-red-700"

                    : previous

                      ? "bg-slate-100 text-slate-600"

                      : "bg-green-50 text-green-700"

                  }`}>

                  {previous && <ArrowUp size={12} />}

                  {choice.type === "next" && <ArrowDown size={12} />}

                  {current ? "Current" : previous ? "Previous" :

                    cancel ? "Cancel order" : "Next"}

                </span>

              </label>

            );

          })}

        </div>

        {selected?.type === "previous" && selected.backendAllowed && (
          <div className="mt-5">
            <label htmlFor="rollback-reason" className="block mb-2 text-sm font-semibold text-slate-700">
              Reason for rollback <span className="text-red-600">*</span>
            </label>
            <textarea
              id="rollback-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={updating}
              placeholder="Why does this order need to return to Purchase Order Sent?"
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0062a0]"
            />
            {!reason.trim() && <p className="mt-1 text-xs text-slate-500">A reason is required by the server.</p>}
          </div>
        )}
        {selected?.changedBy?.length > 0 && (

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">

            <AlertCircle size={16} className="shrink-0" />

            <span>

              Authorized roles for this transition:{" "}

              <strong>{selected.changedBy.join(", ")}</strong>.

              The backend will validate permissions.

            </span>

          </div>

        )}

        {error && (

          <p role="alert" className="mt-4 text-sm text-red-600">

            {error}

          </p>

        )}

        <div className="mt-7 flex justify-end gap-3">

          <button

            type="button"

            onClick={onClose}

            disabled={updating}

            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"

          >

            Cancel

          </button>

          <button

            type="button"

            onClick={() => selected && onConfirm(selected, reason.trim())}

            disabled={updating || !selected || selected.disabled || !selected.backendAllowed || (selected.type === "previous" && !reason.trim())}

            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 ${selected?.type === "cancel"

              ? "bg-red-600 hover:bg-red-700"

              : "bg-[#0062a0] hover:bg-[#004c80]"

              }`}

          >

            {updating && <Loader2 size={16} className="animate-spin" />}

            {updating ? "Updating..." : "Confirm Update"}

          </button>

        </div>

      </motion.div>

    </motion.div>

  );

}

/* =====================================================

   MAIN ORDER VIEW

===================================================== */

export default function Order_Processing_View() {

  const navigate = useNavigate();

  const location = useLocation();

  const params = useParams();

  const rowId =

    params.id ||

    location.state?.rowId ||

    location.state?.rowID ||

    location.state?.id ||

    location.state?.row?._id ||

    location.state?.row?.id;

  const [order, setOrder] = useState(null);

  const [stages, setStages] = useState(FALLBACK_STAGES);

  const [statusesLoaded, setStatusesLoaded] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [updating, setUpdating] = useState(false);

  const [updateError, setUpdateError] = useState("");

  const [statusModal, setStatusModal] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const [statusSuccess, setStatusSuccess] = useState("");

  const submittingRef = useRef(false);

  const reload = useCallback(() => {

    setRefreshKey((value) => value + 1);

  }, []);

  useEffect(() => {

    let active = true;

    const load = async () => {

      if (!rowId) {

        setLoading(false);

        setError("Order ID missing. Open an order from the listing page.");

        return;

      }

      setLoading(true);

      setError("");

      try {

        const [orderResult, statusesResult] = await Promise.allSettled([

          order_processing_getById(rowId),

          order_processing_statuses(),

        ]);

        if (!active) return;

        if (orderResult.status !== "fulfilled") {

          throw orderResult.reason;

        }

        const response = orderResult.value?.data;

        const data =

          response?.data?.record ||

          response?.data?.order ||

          response?.data ||

          response;

        if (!data?._id) {

          throw new Error("Order details not found.");

        }

        setOrder(data);

        const received = statusesResult.status === "fulfilled"

          ? statusesResult.value?.data?.data

          : null;

        const valid = Array.isArray(received) && received.length > 0;

        setStages(valid ? received : FALLBACK_STAGES);

        setStatusesLoaded(valid);

      } catch (err) {

        if (active) {

          setOrder(null);

          setError(errorText(err));

        }

      } finally {

        if (active) setLoading(false);

      }

    };

    load();

    return () => {

      active = false;

    };

  }, [rowId, refreshKey]);

  const openStatusModal = () => {

    if (!statusesLoaded || updating) return;

    setUpdateError("");

    setStatusModal(true);

  };

  // First collect status + reason, then ask for confirmation before PATCH.
  const requestStatusConfirmation = (selectedDefinition, reason = "") => {
    if (!selectedDefinition || updating || submittingRef.current) return;
    const currentStatus = Number(order?.orderStatus ?? order?.status);
    const targetStatus = Number(selectedDefinition.value);
    if (currentStatus === targetStatus) return;
    const isRollback = targetStatus === currentStatus - 1;
    if (isRollback && !reason.trim()) {
      setUpdateError("Please provide a reason for moving to the previous status.");
      return;
    }
    setUpdateError("");
    setPendingStatus({ definition: selectedDefinition, reason: reason.trim() });
    setConfirmationOpen(true);
  };

  const closeStatusModal = () => {
    if (updating) return;
    setConfirmationOpen(false);
    setPendingStatus(null);
    setStatusModal(false);
    setUpdateError("");
  };

  const submitStatus = async (selectedDefinition, reason = "") => {
    if (!rowId || !selectedDefinition || submittingRef.current) return;
    const currentStatus = Number(order?.orderStatus ?? order?.status);
    const nextStatus = Number(selectedDefinition.value);
    const isRollback = nextStatus === currentStatus - 1;
    const definition = stages.find((stage) => Number(stage.value) === nextStatus);
    const forwardAllowed = definition?.allowedFrom?.some((value) => Number(value) === currentStatus);
    if (!isRollback && !forwardAllowed) {
      setUpdateError("This status transition is not supported by the backend.");
      return;
    }
    if (isRollback && !reason.trim()) {
      setUpdateError("Please provide a reason for moving to the previous status.");
      return;
    }
    submittingRef.current = true;
    setUpdating(true);
    setUpdateError("");
    setStatusSuccess("");
    try {
      const payload = {
        orderStatus: nextStatus,
        ...(isRollback ? { reason: reason.trim() } : {}),
      };
      const result = await order_processing_updateStatus(rowId, payload);
      if (result?.data?.success === false) {
        throw new Error(result?.data?.data?.message || result?.data?.message || "Status update failed.");
      }
      setStatusModal(false);
      setStatusSuccess(`Status changed to ${selectedDefinition.label}.`);
      reload();
    } catch (err) {
      setUpdateError(errorText(err));
    } finally {
      submittingRef.current = false;
      setUpdating(false);
    }
  };

  const edit = () => {

    if (!rowId) return;

    navigate("../order-prcessing-create", {

      relative: "path",

      state: { mode: "edit", rowId },

    });

  };

  const items = useMemo(

    () => Array.isArray(order?.items) ? order.items : [],

    [order],

  );

  const logs = useMemo(

    () => Array.isArray(order?.orderLogs) ? order.orderLogs : [],

    [order],

  );

  const status = order?.orderStatus ?? order?.status;

  const statusLabel =

    stages.find(

      (stage) => Number(stage.value) === Number(status),

    )?.label ||

    order?.orderStatusLabel ||

    "-";

  const quantity = items.reduce(

    (sum, item) => sum + (Number(item.quantity) || 0),

    0,

  );

  const payment = order?.paymentStatus == null

    ? "-"

    : [1, "1", "paid", "PAID"].includes(order.paymentStatus)

      ? "Paid"

      : "Unpaid";

  return (

    <motion.div

      initial={{ opacity: 0, y: 12 }}

      animate={{ opacity: 1, y: 0 }}

      className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 text-slate-800"

    >

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

        <div className="flex items-center gap-3 min-w-0">

          <button

            type="button"

            onClick={() => navigate(-1)}

            className="p-3 text-[#0062a0] hover:bg-sky-50 rounded-2xl"

            aria-label="Go back"

          >

            <ArrowLeft size={24} />

          </button>

          <div className="min-w-0">

            <p className="text-xs text-slate-500">Order Details</p>

            <h1 className="text-xl md:text-2xl font-bold break-words">

              {order?.orderId || rowId || "Order"}

            </h1>

          </div>

          {order && (

            <span className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0062a0]">

              {statusLabel}

            </span>

          )}

        </div>

        <button

          type="button"

          onClick={reload}

          disabled={loading || updating}

          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm disabled:opacity-40"

        >

          <RefreshCw

            size={16}

            className={loading ? "animate-spin" : ""}

          />

          Refresh

        </button>

      </div>

      {loading ? (

        <div className="flex justify-center gap-3 py-24 text-[#0062a0]">

          <Loader2 className="animate-spin" />

          Loading order details...

        </div>

      ) : error ? (

        <div

          role="alert"

          className="rounded-xl bg-red-50 p-6 text-red-700"

        >

          {error}

        </div>

      ) : order ? (

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">

          {/* LEFT — ORDER CONTENT */}

          <div className="min-w-0 space-y-6">

            <section className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8">

              <h2 className="text-xl font-bold mb-7">

                Order information

              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-9">

                <InfoItem

                  label="Customer"

                  value={labelOf(order.customerId, [

                    "companyName",

                    "customerName",

                  ])}

                />

                <InfoItem

                  label="Warehouse"

                  value={labelOf(order.warehouseId, [

                    "warehouseName",

                    "warehouseId",

                  ])}

                />

                <InfoItem label="Order Type" value={order.orderType || "-"} />

                <InfoItem

                  label="Order Date"

                  value={formatDate(order.orderDate || order.createdAt)}

                />

                <InfoItem

                  label="Expected Due Date"

                  value={formatDate(order.expectedDate)}

                />

                <InfoItem label="Order Status" value={statusLabel} />

                <InfoItem label="Payment Status" value={payment} />

                <InfoItem label="Total Item Lines" value={items.length} />

                <InfoItem

                  label="Total Quantity"

                  value={quantity.toLocaleString("en-IN")}

                />

                {order.totalAmount != null && (

                  <InfoItem

                    label="Total Amount"

                    value={`₹${Number(order.totalAmount).toLocaleString("en-IN")}`}

                  />

                )}

              </div>

            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 md:p-8">

              <h2 className="text-xl font-bold mb-6">

                Delivery information

              </h2>

              <div className="space-y-6">

                <InfoItem

                  label="Shipping Address"

                  value={order.shippingAddress || "-"}

                />

                <InfoItem

                  label="Remarks"

                  value={order.remarks || "-"}

                />

              </div>

            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 md:p-6">

              <h2 className="text-xl font-bold mb-5">Item List</h2>

              <div className="overflow-x-auto rounded-xl border border-slate-200">

                <table className="w-full min-w-[700px] text-sm">

                  <thead className="bg-slate-50 text-slate-600">

                    <tr>

                      {[

                        "S.No",

                        "Item Name",

                        "Part Number",

                        "Quantity",

                        "Stock at Trigger",

                        "Reorder Level",

                        "Warehouse Limit",

                      ].map((heading) => (

                        <th

                          key={heading}

                          className="px-4 py-3 text-left font-semibold whitespace-nowrap"

                        >

                          {heading}

                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    {items.length ? (

                      items.map((entry, index) => {

                        const item = entry.itemId || entry.itemMasterId;

                        return (

                          <tr

                            key={entry._id || index}

                            className="border-t border-slate-100 hover:bg-slate-50"

                          >

                            <td className="px-4 py-4">{index + 1}</td>

                            <td className="px-4 py-4 font-semibold">

                              {labelOf(item, ["itemName", "name"])}

                            </td>

                            <td className="px-4 py-4">

                              {typeof item === "object"

                                ? item?.partNumber || "-"

                                : "-"}

                            </td>

                            <td className="px-4 py-4">

                              {entry.quantity ?? "-"}

                            </td>

                            <td className="px-4 py-4">

                              {entry.stockAtTrigger ?? "-"}

                            </td>

                            <td className="px-4 py-4">

                              {entry.reorderLevel ?? "-"}

                            </td>

                            <td className="px-4 py-4">

                              {entry.warehouseLimit ?? "-"}

                            </td>

                          </tr>

                        );

                      })

                    ) : (

                      <tr>

                        <td

                          colSpan={7}

                          className="p-8 text-center text-slate-500"

                        >

                          No items found.

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            <div className="flex justify-end pb-10">

              <Button onClick={edit} variant="primary">

                <Pencil size={16} />

                Edit

              </Button>

            </div>

          </div>

          {/* RIGHT — TRACKER */}

          <aside className="min-w-0 xl:sticky xl:top-6">

            <OrderTimeline

              status={status}

              stages={stages}

              logs={logs}

              statusesLoaded={statusesLoaded}

              onChangeStatus={openStatusModal}

              updating={updating}

            />

          </aside>

        </div>

      ) : null}

      <AnimatePresence>

        {statusModal && (

          <ChangeStatusModal

            open={statusModal}

            onClose={closeStatusModal}

            onConfirm={requestStatusConfirmation}

            currentStatus={status}

            stages={stages}

            updating={updating}

            error={updateError}

          />

        )}

      </AnimatePresence>

      <Success_Popup
        isOpen={Boolean(statusSuccess)}
        onClose={() => setStatusSuccess("")}
        title="Order Status Updated"
        message={statusSuccess}
        isActive={true}
      />

      <Confirmation_Popup
        isOpen={confirmationOpen && !!pendingStatus && !updating}
        onClose={() => {
          if (updating) return;
          setConfirmationOpen(false);
          setPendingStatus(null);
        }}
        onConfirm={() => {
          if (!pendingStatus || submittingRef.current || updating) return;
          const { definition, reason } = pendingStatus;
          setConfirmationOpen(false);
          setPendingStatus(null);
          submitStatus(definition, reason);
        }}
        title={pendingStatus?.definition?.type === "cancel" ? "Cancel Order?" : "Confirm Status Update?"}
        message={pendingStatus
          ? `Change order status from ${statusLabel} to ${pendingStatus.definition.label}?${pendingStatus.reason ? ` Reason: ${pendingStatus.reason}` : ""}`
          : ""}
        btnText={pendingStatus?.definition?.type === "cancel" ? "Yes, Cancel Order" : "Yes, Update"}
        isActive={true}
      />

    </motion.div>

  );

}
