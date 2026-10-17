import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  RefreshCw,
  Truck,
  Trash2,
  X,
  AlertCircle,
  ArrowUp,
  ArrowDown,
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
  order_processing_deleteLot,
} from "../../../../service/Orders_Services/Oreder_Services";

const FALLBACK_STAGES = [
  { key: "NEW", value: 1, label: "New", allowedFrom: [], changedBy: [] },

  {
    key: "PURCHASE_ORDER_SENT",
    value: 2,
    label: "Purchase Order Sent",
    allowedFrom: [1],
    changedBy: ["CUSTOMER"],
  },

  {
    key: "SALE_ORDER_CONFIRMED",
    value: 3,
    label: "Sale Order Confirmation",
    allowedFrom: [2],
    changedBy: ["OWNER"],
  },

  {
    key: "DELIVERED",
    value: 4,
    label: "Delivered",
    allowedFrom: [3],
    changedBy: ["OWNER"],
  },

  {
    key: "MATERIAL_DELIVERED",
    value: 5,
    label: "Material Delivered",
    allowedFrom: [4],
    changedBy: ["CUSTOMER"],
  },

  {
    key: "CANCELLED",
    value: 6,
    label: "Cancelled",
    allowedFrom: [1, 2],
    changedBy: ["CUSTOMER", "OWNER"],
  },
];

const getLoggedInRole = () => {
  for (const key of ["user", "userData", "authUser", "loginUser"]) {
    try {
      const record = JSON.parse(localStorage.getItem(key) || "null");
      const value = record?.role?.name ?? record?.role?.roleName ?? record?.role ?? record?.userType ?? record?.userTypeId?.userTypeName ?? record?.user?.role?.name ?? record?.user?.role ?? record?.data?.userTypeId?.userTypeName;
      if (value) return String(value).toUpperCase().replace(/[\s-]+/g, "_");
    } catch {
      // Ignore invalid cached user data.
    }
  }
  return String(localStorage.getItem("role") || "").toUpperCase().replace(/[\s-]+/g, "_");
};

const getLoggedInOwner = () => {
  for (const key of ["user", "userData", "authUser", "loginUser"]) {
    try {
      const record = JSON.parse(localStorage.getItem(key) || "null");
      if (record && typeof record.owner === "boolean") return record.owner;
      if (record?.data && typeof record.data.owner === "boolean") return record.data.owner;
    } catch {
      // Ignore invalid cached user data.
    }
  }
  return false;
};

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

const documentHref = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = (import.meta.env.VITE_API_URL || "").replace(/\/api\/v1\/?$/, "");
  return `${origin}${String(path).startsWith("/") ? "" : "/"}${path}`;
};

const DocumentLinks = ({ label, files }) => {
  const entries = Array.isArray(files) ? files : files ? [files] : [];
  if (!entries.length) return null;
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {entries.map((file, index) => {
          const path = typeof file === "string" ? file : file?.filePath || file?.url;
          if (!path) return null;
          return <a key={`${path}-${index}`} href={documentHref(path)} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#0062a0] underline">{file?.fileName || `${label} ${index + 1}`}</a>;
        })}
      </div>
    </div>
  );
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

const getStatusChoices = (stages, orderOrStatus) => {
  const order = orderOrStatus && typeof orderOrStatus === "object"
    ? orderOrStatus
    : { orderStatus: orderOrStatus };
  const statusValue = Number(order.orderStatus ?? order.status);
  const current = stages.find((stage) => Number(stage.value) === statusValue);
  if (!current) return [];
  const choices = [{ ...current, type: "current", disabled: true, backendAllowed: false }];
  const actions = stages.flatMap((stage) => (stage.actions || []).map((action) => ({ stage, action })));
  const lots = Array.isArray(order.lots) ? order.lots : [];
  const pendingQuantity = Number(order.pendingQuantity) || 0;
  const forwardChoices = [
    { from: 1, to: 2, name: "PO_SENT", appliesTo: "ORDER", condition: () => true },
    { from: 2, to: 3, name: "CONFIRM", appliesTo: "PENDING", condition: () => pendingQuantity > 0 || order.pendingQuantity == null },
  ];
  for (const entry of forwardChoices) {
    if (statusValue !== entry.from || !entry.condition()) continue;
    const target = stages.find((stage) => Number(stage.value) === entry.to);
    const action = target?.actions?.find((candidate) => candidate.action === entry.name && candidate.appliesTo === entry.appliesTo);
    if (target && action) choices.push({ ...target, type: "next", disabled: false, backendAllowed: true, selectedAction: action.action, appliesTo: action.appliesTo, reasonRequired: Boolean(action.reasonRequired), changedBy: action.by || [], actionDescription: action.description });
  }
  for (const lot of lots) {
    const lotStatus = Number(lot.lotStatus);
    const forwardName = lotStatus === 3 ? "DISPATCH" : lotStatus === 4 ? "DELIVER" : null;
    if (forwardName) {
      const targetValue = lotStatus + 1;
      const target = stages.find((stage) => Number(stage.value) === targetValue);
      const action = target?.actions?.find((candidate) => candidate.action === forwardName && candidate.appliesTo === "LOT");
      if (target && action) choices.push({ ...target, type: "next", label: `${target.label} (lot ${lot.lotNo})`, disabled: false, backendAllowed: true, selectedAction: action.action, appliesTo: action.appliesTo, reasonRequired: Boolean(action.reasonRequired), changedBy: action.by || [], actionDescription: action.description, lotNo: lot.lotNo });
    }
    for (const { action } of actions) {
      if (Number(action.movesBackFrom) !== lotStatus || action.appliesTo !== "LOT") continue;
      const isLotDelete = action.action === "LOT_DELETE";
      const targetValue = isLotDelete || action.action === "CONFIRM_REVERT" ? 2 : 3;
      const target = stages.find((entry) => Number(entry.value) === targetValue);
      if (target) choices.push({ ...target, type: action.action.includes("CANCEL") ? "cancel" : "previous", label: `${isLotDelete ? "Remove lot" : target.label} (lot ${lot.lotNo})`, disabled: false, backendAllowed: true, selectedAction: action.action, appliesTo: action.appliesTo, reasonRequired: Boolean(action.reasonRequired), changedBy: action.by || [], actionDescription: action.description, lotNo: lot.lotNo });
    }
    const cancel = stages.find((stage) => stage.key === "CANCELLED");
    for (const action of cancel?.actions || []) {
      const appliesToLotStatus = action.action === "LOT_CANCEL"
        ? [3, 4].includes(lotStatus)
        : Number(action.movesBackFrom) === lotStatus;
      if (action.appliesTo === "LOT" && appliesToLotStatus) {
        choices.push({ ...cancel, label: `${cancel.label} (lot ${lot.lotNo})`, type: "cancel", disabled: false, backendAllowed: true, selectedAction: action.action, appliesTo: action.appliesTo, reasonRequired: Boolean(action.reasonRequired), changedBy: action.by || [], actionDescription: action.description, lotNo: lot.lotNo });
      }
    }
  }
  for (const { stage, action } of actions) {
    if (action.appliesTo === "LOT" || Number(action.movesBackFrom) !== statusValue) continue;
    if (action.action === "PO_REVERT" && (statusValue !== 2 || lots.length > 0)) continue;
    let targetValue = action.action === "PO_REVERT" ? 1 : statusValue - 1;
    const target = stages.find((entry) => Number(entry.value) === targetValue);
    if (target) choices.push({ ...target, type: "previous", disabled: false, backendAllowed: true, selectedAction: action.action, appliesTo: action.appliesTo, reasonRequired: Boolean(action.reasonRequired), changedBy: action.by || [], actionDescription: action.description, actionSource: stage.key });
  }
  const cancelStage = stages.find((stage) => stage.key === "CANCELLED");
  for (const action of cancelStage?.actions || []) {
    const applies = action.appliesTo === "ORDER"
      ? [1, 2].includes(statusValue) && lots.length === 0
      : action.appliesTo === "PENDING"
        ? statusValue === 2 && pendingQuantity > 0 && lots.length > 0
        : false;
    if (applies) choices.push({ ...cancelStage, type: "cancel", label: `${cancelStage.label} (${action.appliesTo.toLowerCase()})`, disabled: false, backendAllowed: true, selectedAction: action.action, appliesTo: action.appliesTo, reasonRequired: Boolean(action.reasonRequired), changedBy: action.by || [], actionDescription: action.description });
  }
  const sortOrder = { previous: 0, current: 1, next: 2, cancel: 3 };
  return choices.sort((a, b) => sortOrder[a.type] - sortOrder[b.type]);
};

/* =====================================================

   RIGHT SIDE — STATUS TRACKER

===================================================== */

function OrderTimeline({
  status,

  order,

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

  const choices = statusesLoaded ? getStatusChoices(stages, order) : [];

  const canChange =
    !cancelled &&
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

        <p className="text-sm text-slate-500 mt-1">Synced with order status</p>

        <span
          className={`inline-block mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
            cancelled ? "bg-red-50 text-red-700" : "bg-sky-50 text-[#0062a0]"
          }`}
        >
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

          animate={moving ? { y: [fromY, toY, fromY] } : { y: toY }}

          transition={
            moving
              ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 }
          }

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

          const active = !cancelled && Number(stage.value) === Number(status);

          const highlighted =
            completed || active || (cancelled && index <= currentIndex);

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
                <div
                  className={`relative z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 text-sm font-bold ${
                    active
                      ? "border-[#0062a0] bg-[#0062a0] text-sky-50"
                      : highlighted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {completed || (cancelled && index <= currentIndex) ? (
                    <Check size={18} strokeWidth={2.8} />
                  ) : (
                    index + 1
                  )}

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
                <p
                  className={`text-sm md:text-[15px] font-semibold leading-snug ${
                    active
                      ? "text-[#0062a0]"
                      : highlighted
                        ? "text-slate-900"
                        : "text-slate-400"
                  }`}
                >
                  {stage.label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {active
                    ? "Current stage"
                    : highlighted
                      ? reachedDate
                        ? formatDate(reachedDate)
                        : "Completed"
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
  order,
}) {
  const choices = useMemo(
    () => getStatusChoices(stages, order),

    [stages, order],
  );

  const [selectedStatus, setSelectedStatus] = useState("");
  const [expandedLotNo, setExpandedLotNo] = useState(order?.lots?.[0]?.lotNo ?? null);
  const [lotDeleteModal, setLotDeleteModal] = useState(null);
  const [reason, setReason] = useState("");
  const [lotDeleteRemarks, setLotDeleteRemarks] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [dispatch, setDispatch] = useState({ transporter: "", docketNumber: "", deliveryDate: "", invoiceNumber: "", invoiceDate: "" });
  const [dispatchFiles, setDispatchFiles] = useState({ invoiceCopy: [], lrCopy: [], inspectionReport: [] });
  const [grn, setGrn] = useState({ grnNumber: "", grnDate: "", receivedQuantity: "", grnAttachment: null });
  const [uploadError, setUploadError] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [editingAllocations, setEditingAllocations] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAllocations((order?.items || []).map((item, index) => ({
      index,
      askedBoxes: String(order.pendingBoxQuantity ?? item.boxQuantity ?? 0),
      askedQuantity: String(order.pendingQuantity ?? item.quantity ?? 0),
      confirmedBoxes: String(item.confirmedBoxQuantity ?? order.pendingBoxQuantity ?? item.boxQuantity ?? 0),
      confirmedQuantity: String(
        item.confirmedQuantity ??
          (Number(item.confirmedBoxQuantity ?? order.pendingBoxQuantity ?? item.boxQuantity) || 0) *
            (Number(item.itemSBQ) || 0),
      ),
    })));
    setEditingAllocations(false);
  }, [open, order]);

  useEffect(() => {
    if (!open) return;

    const next = choices.find(
      (choice) => choice.type === "next" && choice.backendAllowed,
    );

    setSelectedStatus(
      next
        ? `${next.value}:${next.selectedAction || next.type}:${next.lotNo ?? ""}`
        : (() => {
            const fallback = choices.find((choice) => !choice.disabled && choice.backendAllowed);
            return fallback ? `${fallback.value}:${fallback.selectedAction || fallback.type}:${fallback.lotNo ?? ""}` : "";
          })(),
    );
    setExpandedLotNo(order?.lots?.[0]?.lotNo ?? null);
    setReason("");
    setLotDeleteRemarks("");
  }, [open, choices, order]);

  const selected = choices.find(
    (choice) => `${choice.value}:${choice.selectedAction || choice.type}:${choice.lotNo ?? ""}` === selectedStatus,
  );
  const activeSelected = selected?.lotNo != null && Number(selected.lotNo) !== Number(expandedLotNo)
    ? null
    : selected;
  const orderChoices = choices.filter((choice) => choice.lotNo == null);
  const lotChoices = choices.filter((choice) => choice.lotNo != null);
  const minDate = new Date().toISOString().slice(0, 10);
  const needsPurchaseDetails = activeSelected?.selectedAction === "CONFIRM" && Number(currentStatus) === 2;
  const needsDispatchDetails = activeSelected?.selectedAction === "DISPATCH";
  const needsDeliveryDetails = activeSelected?.selectedAction === "DELIVER";
  const allocationError = allocations.some((allocation) => {
    const askedBoxes = Number(allocation.askedBoxes);
    const askedQuantity = Number(allocation.askedQuantity);
    const confirmedBoxes = Number(allocation.confirmedBoxes);
    const confirmedQuantity = Number(allocation.confirmedQuantity);
    return !Number.isFinite(askedBoxes) || !Number.isFinite(askedQuantity) || !Number.isFinite(confirmedBoxes) || !Number.isFinite(confirmedQuantity) || askedBoxes < 0 || askedQuantity < 0 || confirmedBoxes < 0 || confirmedQuantity < 0 || confirmedBoxes > askedBoxes || confirmedQuantity > askedQuantity;
  });
  const purchaseDetailsValid = !needsPurchaseDetails || expectedDate >= minDate;
  const dispatchValid = !needsDispatchDetails || (dispatch.transporter.trim() && dispatch.docketNumber.trim() && dispatch.deliveryDate >= minDate && dispatch.invoiceNumber.trim() && dispatch.invoiceDate >= minDate);
  const deliveryValid = !needsDeliveryDetails || (grn.grnNumber.trim() && grn.grnDate >= minDate);
  const selectChoice = (choice) => {
    setSelectedStatus(`${choice.value}:${choice.selectedAction || choice.type}:${choice.lotNo ?? ""}`);
    if (choice.selectedAction === "DISPATCH" && choice.lotNo != null) {
      const selectedLot = (order?.lots || []).find((lot) => Number(lot.lotNo) === Number(choice.lotNo));
      if (selectedLot?.expectedDate) {
        const expectedDeliveryDate = String(selectedLot.expectedDate).slice(0, 10);
        setDispatch((previous) => ({ ...previous, deliveryDate: expectedDeliveryDate }));
      }
    }
  };
  const renderChoice = (choice) => {
    const selectedChoice = selectedStatus === `${choice.value}:${choice.selectedAction || choice.type}:${choice.lotNo ?? ""}`;
    const current = choice.type === "current";
    const previous = choice.type === "previous";
    const cancel = choice.type === "cancel";
    return (
      <label key={`${choice.key}-${choice.selectedAction || choice.type}-${choice.lotNo ?? "order"}`} className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${current ? "border-[#0062a0] bg-[#0062a0]" : selectedChoice ? "border-[#0062a0] bg-sky-50 cursor-pointer" : "border-slate-200 hover:bg-slate-50 cursor-pointer"}`}>
        <input type="radio" name="order-status" value={`${choice.value}:${choice.selectedAction || choice.type}:${choice.lotNo ?? ""}`} checked={selectedChoice} onChange={() => selectChoice(choice)} disabled={current || updating || !choice.backendAllowed} className="h-4 w-4 accent-[#0062a0]" />
        <span className="flex-1 min-w-0"><span className={`block text-sm font-semibold ${current ? "text-white" : cancel ? "text-red-700" : "text-slate-900"}`}>{choice.label}</span>{choice.actionDescription && <span className={`mt-1 block text-xs ${current ? "text-sky-100" : "text-slate-500"}`}>{choice.actionDescription}</span>}</span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${current ? "bg-white/20 text-white" : cancel ? "bg-red-50 text-red-700" : previous ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-700"}`}>
          {previous && <ArrowUp size={12} />}{choice.type === "next" && <ArrowDown size={12} />}
          {current ? "Current" : previous ? "Previous" : cancel ? "Cancel" : "Next"}
        </span>
      </label>
    );
  };

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-black/50"

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ x: "100%" }}

        animate={{ x: 0 }}

        exit={{ x: "100%" }}

        transition={{ type: "tween", duration: 0.25 }}

        onClick={(event) => event.stopPropagation()}

        role="dialog"

        aria-modal="true"

        aria-labelledby="change-status-title"

        className="h-[100dvh] w-full max-w-4xl overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl sm:p-6 lg:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="change-status-title"
              className="text-xl font-bold text-slate-900"
            >
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
          {orderChoices.map(renderChoice)}
        </div>

        {Array.isArray(order?.lots) && order.lots.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Lots</h3>
            {order.lots.map((lot) => {
              const expanded = expandedLotNo === lot.lotNo;
              const actionsForLot = lotChoices.filter((choice) => Number(choice.lotNo) === Number(lot.lotNo));
              const lotDeleteChoice = actionsForLot.find((choice) => choice.selectedAction === "LOT_DELETE");
              const visibleLotActions = actionsForLot.filter((choice) => choice.selectedAction !== "LOT_DELETE");
              return (
                <article key={`modal-lot-${lot.lotNo}`} className={`overflow-hidden rounded-xl border ${expanded ? "border-[#0062a0]" : "border-slate-200"}`}>
                  <div className={`flex items-center gap-3 p-3 ${expanded ? "bg-sky-50" : "bg-white"}`}>
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input type="radio" name="modal-lot-accordion" checked={expanded} onChange={() => {
                        setExpandedLotNo(lot.lotNo);
                        const firstAction = actionsForLot.find((choice) => choice.type === "next") || actionsForLot.find((choice) => choice.backendAllowed && choice.selectedAction !== "LOT_DELETE");
                        if (firstAction) selectChoice(firstAction);
                        else setSelectedStatus("");
                      }} className="h-4 w-4 accent-[#0062a0]" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">Lot {lot.lotNo}{lot.saleOrderNumber ? ` · ${lot.saleOrderNumber}` : ""}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{lot.lotStatusLabel || stages.find((stage) => Number(stage.value) === Number(lot.lotStatus))?.label || `Status ${lot.lotStatus}`} · {Number(lot.quantity || 0).toLocaleString("en-IN")} units{lot.boxQuantity != null ? ` · ${lot.boxQuantity} boxes` : ""}</span>
                      </span>
                    </label>
                    <span className="text-xs font-semibold text-[#0062a0]">{expanded ? "Details" : "Show"}</span>
                    {lotDeleteChoice && <button
                      type="button"
                      title={`Remove lot ${lot.lotNo}`}
                      aria-label={`Remove lot ${lot.lotNo}`}
                      disabled={updating}
                      onClick={() => {
                        setExpandedLotNo(lot.lotNo);
                        setSelectedStatus("");
                        setReason("");
                        setLotDeleteRemarks("");
                        setLotDeleteModal(lotDeleteChoice);
                      }}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                    ><Trash2 size={17} /></button>}
                  </div>
                  <AnimatePresence initial={false}>
                  {expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: "easeInOut" }} className="overflow-hidden">
                    <div className="space-y-3 border-t border-slate-200 p-3">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                      <InfoItem label="Expected date" value={formatDate(lot.expectedDate)} />
                      <InfoItem label="Confirmed by" value={lot.confirmedBy || "-"} />
                      <InfoItem label="Confirmed on" value={formatDate(lot.saleOrderConfirmedAt)} />
                      {lot.dispatch?.transporter && <InfoItem label="Transporter" value={lot.dispatch.transporter} />}
                      {lot.dispatch?.docketNumber && <InfoItem label="Docket number" value={lot.dispatch.docketNumber} />}
                      {lot.dispatch?.invoiceNumber && <InfoItem label="Invoice number" value={lot.dispatch.invoiceNumber} />}
                      {lot.grnNumber && <InfoItem label="GRN number" value={lot.grnNumber} />}
                    </div>
                    {visibleLotActions.length > 0 ? <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lot actions</p>{visibleLotActions.map(renderChoice)}</div> : !lotDeleteChoice && <p className="text-xs text-slate-500">No actions available for this lot.</p>}
                    </div>
                  </motion.div>}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}

        {selected?.reasonRequired && selected.backendAllowed && selected.selectedAction !== "LOT_DELETE" && (
          <div className="mt-5">
            <label
              htmlFor="rollback-reason"
              className="block mb-2 text-sm font-semibold text-slate-700"
            >
              Reason for rollback <span className="text-red-600">*</span>
            </label>
            <textarea
              id="rollback-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={updating}
              placeholder={selected.selectedAction === "LOT_DELETE" ? "Why should this lot be removed?" : "Why does this order need to return to Purchase Order Sent?"}
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0062a0]"
            />
            {!reason.trim() && (
              <p className="mt-1 text-xs text-slate-500">
                A reason is required by the server.
              </p>
            )}
          </div>
        )}
        {needsPurchaseDetails && (
          <div className="mt-5 space-y-4">
            <label htmlFor="expected-date" className="block text-sm font-semibold">Expected date *
              <input id="expected-date" type="date" min={minDate} value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm" />
            </label>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">Asked and confirmed quantities</p>
              <button type="button" disabled={updating} onClick={() => setEditingAllocations((value) => !value)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-[#0062a0] disabled:cursor-not-allowed disabled:opacity-40">{editingAllocations ? "Done" : "Edit quantities"}</button>
            </div>
            {allocations.map((allocation) => {
              const item = order?.items?.[allocation.index];
              const itemRef = item?.itemId || item?.itemMasterId;
              const updateConfirmedBoxes = (value) => {
                const maxBoxes = Number(allocation.askedBoxes) || 0;
                const parsedValue = Number(value);
                const boundedValue = value !== "" && Number.isFinite(parsedValue)
                  ? String(Math.min(maxBoxes, Math.max(0, parsedValue)))
                  : value;
                setAllocations((previous) => previous.map((entry) => {
                if (entry.index !== allocation.index) return entry;
                const itemSbq = Number(item?.itemSBQ) || 0;
                return {
                  ...entry,
                  confirmedBoxes: boundedValue,
                  confirmedQuantity: String((Number(boundedValue) || 0) * itemSbq),
                };
                }));
              };
              const askedQuantity = Number(allocation.askedQuantity) || 0;
              const confirmedQuantity = Number(allocation.confirmedQuantity) || 0;
              const remainingQuantity = Math.max(0, askedQuantity - confirmedQuantity);
              const askedBoxes = Number(allocation.askedBoxes) || 0;
              const confirmedBoxes = Number(allocation.confirmedBoxes) || 0;
              const remainingBoxes = Math.max(0, askedBoxes - confirmedBoxes);
              return <div key={item?._id || allocation.index} className="rounded-xl border border-slate-200 p-3">
                <p className="mb-3 text-sm font-semibold">{labelOf(itemRef, ["itemName", "name"])}</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-600">Asked box quantity<input type="number" min="0" value={allocation.askedBoxes} disabled className="mt-1 w-full rounded-lg border bg-slate-100 p-2 text-sm disabled:cursor-not-allowed" /></label>
                  <label className="text-xs text-slate-600">Asked quantity<input type="number" min="0" value={allocation.askedQuantity} disabled className="mt-1 w-full rounded-lg border bg-slate-100 p-2 text-sm disabled:cursor-not-allowed" /></label>
                  <label className="text-xs text-slate-600">Confirmed box quantity<input type="number" min="0" max={allocation.askedBoxes} step="1" value={allocation.confirmedBoxes} disabled={!editingAllocations || updating} onChange={(event) => updateConfirmedBoxes(event.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm disabled:bg-slate-100" /></label>
                  <label className="text-xs text-slate-600">Confirmed quantity<input type="number" min="0" value={allocation.confirmedQuantity} disabled className="mt-1 w-full rounded-lg border bg-slate-100 p-2 text-sm disabled:cursor-not-allowed" /></label>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Confirmed {confirmedQuantity}</span><span>Remaining {remainingQuantity}</span></div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-slate-100"><span className="bg-[#0062a0]" style={{ width: `${askedQuantity ? Math.min(100, confirmedQuantity / askedQuantity * 100) : 0}%` }} /><span className="bg-amber-400" style={{ width: `${askedQuantity ? Math.min(100, remainingQuantity / askedQuantity * 100) : 0}%` }} /></div>
                  <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{confirmedBoxes} confirmed box(es)</span><span>{remainingBoxes} remaining box(es)</span></div>
                </div>
              </div>;
            })}
            {allocationError && <p className="text-xs text-amber-700">Confirmed values cannot exceed asked values and all quantities must be zero or greater.</p>}
          </div>
        )}
        {needsDispatchDetails && <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">Valid transporter *<input value={dispatch.transporter} onChange={(event) => setDispatch((prev) => ({ ...prev, transporter: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm">Docket number *<input value={dispatch.docketNumber} onChange={(event) => setDispatch((prev) => ({ ...prev, docketNumber: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm">Delivery date *<input type="date" min={minDate} value={dispatch.deliveryDate} onChange={(event) => setDispatch((prev) => ({ ...prev, deliveryDate: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm">Invoice number *<input value={dispatch.invoiceNumber} onChange={(event) => setDispatch((prev) => ({ ...prev, invoiceNumber: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm">Invoice date *<input type="date" min={minDate} value={dispatch.invoiceDate} onChange={(event) => setDispatch((prev) => ({ ...prev, invoiceDate: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
          </div>
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {[
              { key: "invoiceCopy", label: "Invoice copies", max: 2 },
              { key: "lrCopy", label: "LR copies", max: 2 },
              { key: "inspectionReport", label: "Inspection reports", max: 5 },
            ].map(({ key, label, max }) => (
              <label key={key} className="block text-sm font-medium text-slate-700">
                {label} <span className="text-xs font-normal text-slate-500">(image or PDF, up to {max})</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  disabled={updating}
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    if (files.length > max) {
                      setUploadError(`${label}: select no more than ${max} files.`);
                      event.target.value = "";
                      return;
                    }
                    setUploadError("");
                    setDispatchFiles((previous) => ({ ...previous, [key]: files }));
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-sm"
                />
                {dispatchFiles[key].length > max && <span className="mt-1 block text-xs text-red-600">Maximum {max} files.</span>}
              </label>
            ))}
          </div>
          {uploadError && <p role="alert" className="text-xs text-red-600">{uploadError}</p>}
        </div>}
        {needsDeliveryDetails && <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-1">
          <label className="text-xs">GRN number *<input value={grn.grnNumber} onChange={(event) => setGrn((prev) => ({ ...prev, grnNumber: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
          <label className="text-xs">GRN date *<input type="date" max={minDate} value={grn.grnDate} onChange={(event) => setGrn((prev) => ({ ...prev, grnDate: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
          <label className="text-xs">Received quantity (optional)<input type="number" min="0" value={grn.receivedQuantity} onChange={(event) => setGrn((prev) => ({ ...prev, receivedQuantity: event.target.value }))} className="mt-1 w-full rounded-lg border p-2" /></label>
          <label className="text-xs">GRN attachment (optional, image or PDF)<input type="file" accept="image/*,application/pdf" onChange={(event) => setGrn((prev) => ({ ...prev, grnAttachment: event.target.files?.[0] || null }))} className="mt-1 block w-full rounded-lg border p-2" /></label>
        </div>}
        {selected?.changedBy?.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle size={16} className="shrink-0" />

            <span>
              Authorized roles for this transition:{" "}
              <strong>{selected.changedBy.join(", ")}</strong>. The backend will
              validate permissions.
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

              onClick={() => selected && onConfirm(selected, reason.trim(), { expectedDate, remarks: lotDeleteRemarks.trim(), allocations: allocations.map(({ index, askedBoxes, askedQuantity, confirmedBoxes, confirmedQuantity }) => ({ itemId: order?.items?.[index]?.itemId?._id ?? order?.items?.[index]?.itemId ?? order?.items?.[index]?.itemMasterId?._id ?? order?.items?.[index]?.itemMasterId, boxQuantity: Number(askedBoxes), quantity: Number(askedQuantity), confirmedBoxQuantity: Number(confirmedBoxes), confirmedQuantity: Number(confirmedQuantity) })), ...dispatch, ...dispatchFiles, ...grn })}

            disabled={
              updating ||
              !selected ||
              selected.disabled ||
              !selected.backendAllowed ||
              (selected?.reasonRequired && !reason.trim()) ||
              !purchaseDetailsValid || !dispatchValid || !deliveryValid
            }

            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 ${
              selected?.type === "cancel"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#0062a0] hover:bg-[#004c80]"
            }`}
          >
            {updating && <Loader2 size={16} className="animate-spin" />}

            {updating ? "Updating..." : "Confirm Update"}
          </button>
        </div>
        <AnimatePresence>
          {lotDeleteModal && <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-lot-title"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 id="delete-lot-title" className="text-lg font-bold text-slate-900">Remove Lot {lotDeleteModal.lotNo}?</h3>
                  <p className="mt-1 text-sm text-slate-500">Its quantity will return to pending sale order confirmation.</p>
                </div>
                <button type="button" aria-label="Close delete lot dialog" disabled={updating} onClick={() => setLotDeleteModal(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><X size={18} /></button>
              </div>
              <label htmlFor="delete-lot-reason" className="block text-sm font-semibold text-slate-700">Reason for rollback <span className="text-red-600">*</span></label>
              <textarea
                id="delete-lot-reason"
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={updating}
                placeholder="Why should this lot be removed?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0062a0]"
              />
              <label htmlFor="delete-lot-remarks" className="mt-4 block text-sm font-semibold text-slate-700">Remarks (optional)</label>
              <textarea
                id="delete-lot-remarks"
                rows={2}
                maxLength={500}
                value={lotDeleteRemarks}
                onChange={(event) => setLotDeleteRemarks(event.target.value)}
                disabled={updating}
                placeholder="Add any additional details"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0062a0]"
              />
              {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" disabled={updating} onClick={() => setLotDeleteModal(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-40">Cancel</button>
                <button type="button" disabled={updating || !reason.trim()} onClick={() => onConfirm(lotDeleteModal, reason.trim(), { remarks: lotDeleteRemarks.trim() })} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40">
                  {updating && <Loader2 size={16} className="animate-spin" />}
                  {updating ? "Removing..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>}
        </AnimatePresence>
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
  const [selectedLotNo, setSelectedLotNo] = useState(null);

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

        const received =
          statusesResult.status === "fulfilled"
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

  // Collect action details, then ask for confirmation before applying the change.
  const requestStatusConfirmation = (selectedDefinition, reason = "", details = {}) => {
    if (!selectedDefinition || updating || submittingRef.current) return;
    if (selectedDefinition.type === "current") return;
    if (selectedDefinition.reasonRequired && !reason.trim()) {
      setUpdateError(
        "Please provide a reason for this status action.",
      );
      return;
    }
    setUpdateError("");
    if (selectedDefinition.selectedAction === "LOT_DELETE") {
      submitStatus(selectedDefinition, reason.trim(), details);
      return;
    }
    setPendingStatus({ definition: selectedDefinition, reason: reason.trim(), details });
    setConfirmationOpen(true);
  };

  const closeStatusModal = () => {
    if (updating) return;
    setConfirmationOpen(false);
    setPendingStatus(null);
    setStatusModal(false);
    setUpdateError("");
  };

  const submitStatus = async (selectedDefinition, reason = "", details = {}) => {
    if (!rowId || !selectedDefinition || submittingRef.current) return;
    const currentStatus = Number(order?.orderStatus ?? order?.status);
    const nextStatus = Number(selectedDefinition.value);
    if (selectedDefinition.type === "current" || !selectedDefinition.selectedAction) {
      setUpdateError("This status action is not supported by the API definitions.");
      return;
    }
    if (selectedDefinition.reasonRequired && !reason.trim()) {
      setUpdateError(
        "Please provide a reason for this status action.",
      );
      return;
    }
    submittingRef.current = true;
    setUpdating(true);
    setUpdateError("");
    setStatusSuccess("");
    try {
      if (selectedDefinition.selectedAction === "LOT_DELETE") {
        const result = await order_processing_deleteLot(rowId, selectedDefinition.lotNo, {
          reason: reason.trim(),
          ...(details.remarks ? { remarks: details.remarks } : {}),
        });
        if (result?.data?.success === false) {
          throw new Error(result?.data?.data?.message || result?.data?.message || "Lot removal failed.");
        }
        setStatusModal(false);
        setUpdateError("");
        setStatusSuccess(`Lot ${selectedDefinition.lotNo} removed and returned to pending quantity.`);
        reload();
        return;
      }
      const payload = {
        orderStatus: nextStatus,
        ...(selectedDefinition.lotNo != null ? { lotNo: selectedDefinition.lotNo } : {}),
        ...(selectedDefinition.reasonRequired ? { reason: reason.trim() } : {}),
        ...(selectedDefinition.type === "next" && currentStatus === 2 && nextStatus === 3 ? {
          expectedDate: details.expectedDate,
          ...(Number(order?.items?.[0]?.itemSBQ) > 0
            ? { confirmedBoxQuantity: details.allocations?.[0]?.confirmedBoxQuantity }
            : { confirmedQuantity: details.allocations?.[0]?.confirmedQuantity }),
        } : {}),
        ...(selectedDefinition.selectedAction === "DISPATCH" ? {
          transporter: details.transporter,
          docketNumber: details.docketNumber,
          deliveryDate: details.deliveryDate,
          invoiceNumber: details.invoiceNumber,
          invoiceDate: details.invoiceDate,
          invoiceCopy: details.invoiceCopy || [],
          lrCopy: details.lrCopy || [],
          inspectionReport: details.inspectionReport || [],
        } : {}),
        ...(selectedDefinition.selectedAction === "DELIVER" ? {
          grnNumber: details.grnNumber,
          grnDate: details.grnDate,
          ...(details.receivedQuantity !== "" ? { receivedQuantity: Number(details.receivedQuantity) } : {}),
          grnAttachment: details.grnAttachment ? [details.grnAttachment] : [],
        } : {}),
      };
      const result = await order_processing_updateStatus(rowId, payload);
      if (result?.data?.success === false) {
        throw new Error(
          result?.data?.data?.message ||
            result?.data?.message ||
            "Status update failed.",
        );
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
    () => (Array.isArray(order?.items) ? order.items : []),

    [order],
  );

  const logs = useMemo(
    () => (Array.isArray(order?.orderLogs) ? order.orderLogs : []),

    [order],
  );

  const status = order?.orderStatus ?? order?.status;
  const expandedLotNo = selectedLotNo ?? order?.lots?.[0]?.lotNo ?? null;

  const statusLabel =
    stages.find((stage) => Number(stage.value) === Number(status))?.label ||
    order?.orderStatusLabel ||
    "-";

  const quantity = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),

    0,
  );

  const payment =
    order?.paymentStatus == null
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
              <h2 className="text-xl font-bold mb-7">Order information</h2>

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
              <h2 className="text-xl font-bold mb-6">Delivery information</h2>

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

                        "Order Quantity",

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

            <section className="rounded-2xl border border-slate-100 bg-white p-4 md:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold">Lots</h2>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#0062a0]">{Array.isArray(order.lots) ? order.lots.length : 0} total</span>
              </div>
              {Array.isArray(order.lots) && order.lots.length > 0 ? (
                <div className="space-y-4">
                  {order.lots.map((lot) => {
                    const expanded = expandedLotNo === lot.lotNo;
                    const lotTracking = (Array.isArray(lot.tracking) ? lot.tracking : [])
                      .filter((entry) => entry.trackingScope === "LOT" || Number(entry.lotNo) === Number(lot.lotNo));
                    const lotMilestones = [3, 4, 5].map((value) => {
                      const stage = stages.find((entry) => Number(entry.value) === value);
                      const event = [...lotTracking].reverse().find((entry) => Number(entry.status) === value);
                      return { value, label: stage?.label || ({ 3: "Sale Order", 4: "Dispatched", 5: "Delivered" }[value]), event };
                    });
                    const lastTrackedStage = [...lotTracking].reverse().find((entry) => [3, 4, 5].includes(Number(entry.status)));
                    const lotProgressStatus = Number(lot.lotStatus) === 6
                      ? Number(lastTrackedStage?.status || 3)
                      : Number(lot.lotStatus || 3);
                    const lotProgress = Math.max(0, Math.min(100, ((lotProgressStatus - 3) / 2) * 100));
                    return <article key={lot.lotNo} className={`overflow-hidden rounded-2xl border transition-colors ${expanded ? "border-[#0062a0] bg-sky-50/40" : "border-slate-200 bg-white"}`}>
                      <label className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 md:p-5">
                        <span className="flex min-w-0 items-center gap-3">
                          <input type="radio" name="order-lot-details" value={lot.lotNo} checked={expanded} onChange={() => setSelectedLotNo(lot.lotNo)} className="h-4 w-4 accent-[#0062a0]" />
                          <span className="min-w-0">
                            <span className="block font-bold text-slate-900">Lot {lot.lotNo}{lot.saleOrderNumber ? ` · ${lot.saleOrderNumber}` : ""}</span>
                            <span className="mt-1 block text-sm text-slate-500">{lot.lotStatusLabel || stages.find((stage) => Number(stage.value) === Number(lot.lotStatus))?.label || `Status ${lot.lotStatus ?? "-"}`}</span>
                          </span>
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{Number(lot.quantity || 0).toLocaleString("en-IN")} units{lot.boxQuantity != null ? ` · ${lot.boxQuantity} boxes` : ""}</span>
                      </label>
                      <AnimatePresence initial={false}>
                      {expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeInOut" }} className="overflow-hidden">
                      <div className="border-t border-slate-200 p-4 md:p-5">
                      <div className="mb-5 rounded-xl border border-slate-100 bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-800">Lot progress</h4>
                          {Number(lot.lotStatus) === 6 && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Cancelled</span>}
                        </div>
                        <div className="relative mb-4 h-5" aria-label={`Lot progress ${lotProgress}%`}>
                          <div className="absolute inset-x-0 top-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: lotProgress / 100 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            style={{ originX: 0 }}
                          />
                          </div>
                          <motion.span
                            className="absolute top-0 z-10 -translate-x-1/2 text-[#0062a0]"
                            initial={{ left: "0%" }}
                            animate={{ left: `${lotProgress}%` }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            aria-hidden="true"
                          >
                            <Truck size={18} strokeWidth={2.5} className="rounded-sm bg-white drop-shadow-sm" />
                          </motion.span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {lotMilestones.map((milestone, index) => {
                            const active = Number(lot.lotStatus) === milestone.value;
                            const completed = lotProgressStatus > milestone.value || (Number(lot.lotStatus) === 6 && Boolean(milestone.event));
                            return <div key={milestone.value} className="relative flex items-start gap-3">
                              <motion.span
                                initial={false}
                                animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                transition={active ? { duration: 1.8, repeat: Infinity } : { duration: 0.2 }}
                                className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-[#0062a0] text-white" : completed ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                <AnimatePresence mode="wait" initial={false}>
                                  {completed ? <motion.span key="done" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}><Check size={14} /></motion.span> : <motion.span key="number" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>{index + 1}</motion.span>}
                                </AnimatePresence>
                              </motion.span>
                              <span className="min-w-0">
                                <span className={`block text-sm font-semibold ${active || completed ? "text-slate-800" : "text-slate-400"}`}>{milestone.label}</span>
                                <span className="mt-1 block text-xs text-slate-500">{milestone.event?.changedAt ? formatDate(milestone.event.changedAt) : active ? "In progress" : "Not reached"}</span>
                              </span>
                            </div>;
                          })}
                        </div>
                        {lotTracking.length > 0 && <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lot activity</p>
                          {[...lotTracking].reverse().slice(0, 4).map((entry, index) => <div key={`${entry.changedAt}-${index}`} className="text-xs">
                            <p className="font-semibold text-slate-700">{entry.statusLabel || stages.find((stage) => Number(stage.value) === Number(entry.status))?.label || `Status ${entry.status}`} · {formatDate(entry.changedAt)}</p>
                            {(entry.remarks || entry.reason) && <p className="mt-0.5 text-slate-500">{entry.remarks}{entry.reason ? ` · Reason: ${entry.reason}` : ""}</p>}
                          </div>)}
                        </div>}
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoItem label="Expected date" value={formatDate(lot.expectedDate)} />
                        <InfoItem label="Sale order confirmed" value={formatDate(lot.saleOrderConfirmedAt)} />
                        <InfoItem label="Confirmed by" value={lot.confirmedBy || "-"} />
                        <InfoItem label="Dispatched" value={formatDate(lot.dispatchedAt || lot.dispatch?.dispatchedAt)} />
                        {lot.dispatch?.transporter && <InfoItem label="Transporter" value={lot.dispatch.transporter} />}
                        {lot.dispatch?.docketNumber && <InfoItem label="Docket number" value={lot.dispatch.docketNumber} />}
                        {lot.dispatch?.deliveryDate && <InfoItem label="Delivery date" value={formatDate(lot.dispatch.deliveryDate)} />}
                        {lot.dispatch?.invoiceNumber && <InfoItem label="Invoice number" value={lot.dispatch.invoiceNumber} />}
                        {lot.dispatch?.invoiceDate && <InfoItem label="Invoice date" value={formatDate(lot.dispatch.invoiceDate)} />}
                        {lot.grnNumber && <InfoItem label="GRN number" value={lot.grnNumber} />}
                        {lot.grnDate && <InfoItem label="GRN date" value={formatDate(lot.grnDate)} />}
                        {lot.receivedQuantity != null && <InfoItem label="Received quantity" value={Number(lot.receivedQuantity).toLocaleString("en-IN")} />}
                        {lot.cancelReason && <InfoItem label="Cancellation reason" value={lot.cancelReason} />}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                        <DocumentLinks label="Invoice copies" files={lot.dispatch?.invoiceCopy} />
                        <DocumentLinks label="LR copies" files={lot.dispatch?.lrCopy} />
                        <DocumentLinks label="Inspection reports" files={lot.dispatch?.inspectionReport} />
                        <DocumentLinks label="GRN attachments" files={lot.grnAttachment} />
                      </div>
                      {Array.isArray(lot.cancelledDispatches) && lot.cancelledDispatches.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-sm font-semibold text-amber-900">Cancelled dispatches</p>
                          {lot.cancelledDispatches.map((dispatch, index) => <p key={`${dispatch.cancelledAt || index}`} className="mt-1 text-xs text-amber-800">{dispatch.reason || "Dispatch cancelled"}{dispatch.cancelledAt ? ` · ${formatDate(dispatch.cancelledAt)}` : ""}</p>)}
                        </div>
                      )}
                      </div>
                      </motion.div>}
                      </AnimatePresence>
                    </article>;
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No lots have been confirmed yet.</p>
              )}
              {Number(order.pendingQuantity) > 0 && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Pending confirmation: {Number(order.pendingQuantity).toLocaleString("en-IN")} units{order.pendingBoxQuantity != null ? ` · ${order.pendingBoxQuantity} boxes` : ""}</p>}
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

              order={order}

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

            order={order}
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
          const { definition, reason, details } = pendingStatus;
          setConfirmationOpen(false);
          setPendingStatus(null);
          submitStatus(definition, reason, details);
        }}
        title={
          pendingStatus?.definition?.type === "cancel"
            ? "Cancel Order?"
            : "Confirm Status Update?"
        }
        message={
          pendingStatus
            ? `${pendingStatus.definition.actionDescription || `Change order status from ${statusLabel} to ${pendingStatus.definition.label}`}?${pendingStatus.definition.appliesTo ? ` (${pendingStatus.definition.appliesTo})` : ""}${pendingStatus.reason ? ` Reason: ${pendingStatus.reason}` : ""}`
            : ""
        }
        btnText={
          pendingStatus?.definition?.type === "cancel"
            ? "Yes, Cancel Order"
            : "Yes, Update"
        }
        isActive={true}
      />
    </motion.div>
  );
}
