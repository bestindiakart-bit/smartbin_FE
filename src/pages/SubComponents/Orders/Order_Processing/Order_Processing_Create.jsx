import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import Confirmation_Popup from "../../../../component/Popup_Models/Confirmation_Popup";
import Success_Popup from "../../../../component/Popup_Models/Success_Popup";
import ErrorMessage_Popup from "../../../../component/Popup_Models/ErrorMessage_Popup";
import ReUsableInput_Fields from "../../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import { customer_id, get_warehouse_byCustomer, get_items_byWarehouse } from "../../../../service/Bin_Services/Bin_Services";
import { order_processing_create, order_processing_getById, order_processing_edit } from "../../../../service/Orders_Services/Oreder_Services";

const emptyOption = (label) => [{ label, value: "" }];
const idOf = (value) => value == null ? "" : String(typeof value === "object" ? value._id ?? value.id ?? value.itemMasterId?._id ?? "" : value);
const errorText = (error) => error?.response?.data?.data?.message || error?.response?.data?.message || error?.message || "Unable to save the order.";
const unpackOrder = (res) => res?.data?.data?.record || res?.data?.data?.order || res?.data?.data || res?.data;
const asList = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return payload && typeof payload === "object" && payload._id ? [payload] : [];
};
const newRow = (key, itemId = "", quantity = "") => ({ key, itemId, quantity });
const animation = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const appear = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

// Connect this to your application's authenticated role source if it differs.
const getLoggedInRole = () => {
  for (const key of ["user", "userData", "authUser", "loginUser"]) {
    try {
      const record = JSON.parse(localStorage.getItem(key) || "null");
      const value = record?.role?.name ?? record?.role?.roleName ?? record?.role ?? record?.userType ?? record?.user?.role?.name ?? record?.user?.role;
      if (value) return String(value).toUpperCase().replace(/[\s-]+/g, "_");
    } catch { /* ignore invalid storage */ }
  }
  return "";
};

export default function Order_Processing_Create() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.mode === "edit";
  const rowId = location.state?.rowId || location.state?.rowID;
  const nextKey = useRef(1);
  const submitLock = useRef(false);
  const originalIds = useRef({ customerId: "", warehouseId: "" });
  const [role] = useState(getLoggedInRole);
  const isSuperAdmin = ["SUPER_ADMIN", "SUPERADMIN"].includes(role);
  const [form, setForm] = useState({ customerId: "", warehouseId: "", warehouseCode: "", expectedDate: "", shippingAddress: "", remarks: "" });
  const [items, setItems] = useState([newRow(0)]);
  const [orderType, setOrderType] = useState("");
  const [warehouseRecords, setWarehouseRecords] = useState([]);
  const [customers, setCustomers] = useState(emptyOption("Loading Customers..."));
  const [singleCustomer, setSingleCustomer] = useState(false);
  const [warehouses, setWarehouses] = useState(emptyOption("Select Warehouse"));
  const [itemOptions, setItemOptions] = useState(emptyOption("Select Item"));
  const [fetchingOrder, setFetchingOrder] = useState(isEditMode);
  const [orderLoaded, setOrderLoaded] = useState(!isEditMode);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const showError = (message) => { setErrorMessage(message); setErrorOpen(true); };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await customer_id();
        const records = asList(res?.data?.data, ["customers", "records", "items"]);
        if (!active) return;
        // owner:true marks the SmartBin / platform-owned customer in your sample.
        // Super admin sees all; customer accounts don't see platform-owned records.
        // A customer-super-admin response can be a single customer object.
        // The platform super admin normally receives an array of customers.
        const isSingleRecord = !Array.isArray(res?.data?.data) && Boolean(res?.data?.data?._id);
        const visible = isSingleRecord || isSuperAdmin
          ? records
          : records.filter((entry) => entry.owner !== true && entry.isMainAdmin !== true);
        const choices = visible.filter((entry) => entry._id).map((entry) => ({
          label: [entry.companyName, entry.customerName].filter(Boolean).join(" - ") || entry.customerId || "Unnamed Customer",
          value: String(entry._id),
        }));
        const onlyOne = choices.length === 1;
        setSingleCustomer(onlyOne);
        setCustomers(onlyOne ? choices : [{ label: "Select Customer", value: "" }, ...choices]);
        // Auto-select the sole customer only when creating. Edit mode is hydrated
        // from the saved order, and must not be overwritten by this API response.
        if (onlyOne && !isEditMode) {
          setForm((prev) => prev.customerId ? prev : {
            ...prev, customerId: choices[0].value, warehouseId: "", warehouseCode: "",
          });
        }
      } catch (error) {
        if (active) { setCustomers(emptyOption("No Customers Found")); showError(errorText(error)); }
      }
    })();
    return () => { active = false; };
  }, [isSuperAdmin, isEditMode]);

  useEffect(() => {
    let active = true;
    if (!isEditMode) { setOrderLoaded(true); setFetchingOrder(false); return undefined; }
    if (!rowId) { setFetchingOrder(false); showError("Order ID is missing."); return undefined; }
    setFetchingOrder(true);
    setOrderLoaded(false);
    (async () => {
      try {
        const res = await order_processing_getById(rowId);
        const data = unpackOrder(res);
        if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("Order not found.");
        if (!active) return;
        const customerId = idOf(data.customerId);
        const warehouseId = idOf(data.warehouseId);
        const warehouseCode = typeof data.warehouseId === "object" && data.warehouseId
          ? String(data.warehouseId.warehouseId ?? data.warehouseId.code ?? data.warehouseCode ?? "")
          : String(data.warehouseCode ?? "");
        originalIds.current = { customerId, warehouseId };
        setForm({ customerId, warehouseId, warehouseCode, expectedDate: data.expectedDate ? String(data.expectedDate).slice(0, 10) : "", shippingAddress: data.shippingAddress ?? "", remarks: data.remarks ?? "" });
        setOrderType(String(data.orderType || ""));
        setItems(Array.isArray(data.items) && data.items.length
          ? data.items.map((item) => newRow(nextKey.current++, idOf(item.itemId ?? item.itemMasterId), item.quantity ?? ""))
          : [newRow(nextKey.current++)]);
        setOrderLoaded(true);
      } catch (error) { if (active) showError(errorText(error)); }
      finally { if (active) setFetchingOrder(false); }
    })();
    return () => { active = false; };
  }, [isEditMode, rowId]);

  useEffect(() => {
    let active = true;
    if (!form.customerId || !orderLoaded) { setWarehouses(emptyOption("Select Warehouse")); setWarehouseRecords([]); return undefined; }
    setLoadingWarehouses(true);
    setWarehouses(emptyOption("Loading Warehouses..."));
    (async () => {
      try {
        const res = await get_warehouse_byCustomer(form.customerId);
        const records = asList(res?.data?.data, ["warehouses", "records"]);
        if (!active) return;
        const choices = records.filter((w) => w?._id && w?.warehouseId).map((w) => ({
          label: w.warehouseName || w.name || w.warehouseId,
          value: String(w._id), warehouseCode: String(w.warehouseId),
        }));
        setWarehouseRecords(records);
        setWarehouses([{ label: "Select Warehouse", value: "" }, ...choices]);
        setForm((prev) => {
          const match = choices.find((w) => w.value === prev.warehouseId || w.warehouseCode === prev.warehouseCode);
          return match && (prev.warehouseId !== match.value || prev.warehouseCode !== match.warehouseCode)
            ? { ...prev, warehouseId: match.value, warehouseCode: match.warehouseCode }
            : prev;
        });
      } catch (error) { if (active) { setWarehouses(emptyOption("No Warehouses Found")); showError(errorText(error)); } }
      finally { if (active) setLoadingWarehouses(false); }
    })();
    return () => { active = false; };
  }, [form.customerId, orderLoaded]);

  // Warehouse endpoint already includes items. Only fall back to the
  // separate item endpoint when its records don't contain an items array.
  useEffect(() => {
    let active = true;
    if (!form.warehouseId || !form.warehouseCode || !orderLoaded) {
      setItemOptions(emptyOption("Select Item"));
      return undefined;
    }
    const load = async () => {
      setLoadingItems(true);
      setItemOptions(emptyOption("Loading Items..."));
      try {
        const warehouse = warehouseRecords.find((entry) => idOf(entry) === form.warehouseId);
        let records = Array.isArray(warehouse?.items) ? warehouse.items : null;
        if (!records) {
          const result = await get_items_byWarehouse(form.warehouseCode);
          records = asList(result?.data?.data, ["items", "records"]);
        }
        if (!active) return;
        const unique = new Map();
        records.forEach((entry) => {
          const master = entry?.itemMasterId ?? entry?.itemId ?? entry;
          if (!master?._id) return;
          unique.set(String(master._id), {
            label: `${master.itemName || "Unnamed Item"} (${master.partNumber || "-"})`,
            value: String(master._id),
          });
        });
        setItemOptions([{ label: "Select Item", value: "" }, ...unique.values()]);
      } catch (error) {
        if (active) { setItemOptions(emptyOption("No Items Found")); showError(errorText(error)); }
      } finally {
        if (active) setLoadingItems(false);
      }
    };
    load();
    return () => { active = false; };
  }, [form.warehouseId, form.warehouseCode, orderLoaded, warehouseRecords]);

  const handleField = (event) => {
    const { name, value } = event.target;
    if (name === "customerId") {
      if (value === form.customerId) return;
      setForm((prev) => ({ ...prev, customerId: value, warehouseId: "", warehouseCode: "" }));
      setWarehouses(emptyOption("Select Warehouse"));
      setWarehouseRecords([]);
      setItemOptions(emptyOption("Select Item"));
      setItems([newRow(nextKey.current++)]);
      return;
    }
    if (name === "warehouseId") {
      if (value === form.warehouseId) return;
      const selected = warehouses.find((w) => String(w.value) === String(value));
      setForm((prev) => ({ ...prev, warehouseId: value, warehouseCode: selected?.warehouseCode || "" }));
      setItemOptions(emptyOption("Select Item"));
      setItems([newRow(nextKey.current++)]);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItem = (key, event) => {
    const { name, value } = event.target;
    if (name === "itemId" && value && items.some((row) => row.key !== key && row.itemId === value)) {
      showError("This item is already selected. Choose a different item.");
      return;
    }
    setItems((prev) => prev.map((row) => row.key === key ? { ...row, [name]: value } : row));
  };
  const addRow = () => { if (canAdd && !saving) setItems((prev) => [...prev, newRow(nextKey.current++)]); };
  const removeRow = (key) => setItems((prev) => prev.length > 1 ? prev.filter((row) => row.key !== key) : prev);
  const itemChoicesFor = (key) => {
    const used = new Set(items.filter((row) => row.key !== key && row.itemId).map((row) => row.itemId));
    return itemOptions.filter((option) => !option.value || !used.has(String(option.value)));
  };
  const canAdd = Boolean(form.warehouseCode) && !loadingItems && items.length < itemOptions.filter((opt) => opt.value).length;
  const changedIds = useMemo(() => ({
    customer: form.customerId !== originalIds.current.customerId,
    warehouse: form.warehouseId !== originalIds.current.warehouseId,
  }), [form.customerId, form.warehouseId]);

  const validate = () => {
    if (isEditMode && !orderLoaded) return "Order details have not loaded.";
    if (!form.customerId) return "Select a customer.";
    if (loadingWarehouses || loadingItems) return "Please wait for the dropdowns to load.";
    if (!form.warehouseId || !form.warehouseCode || !warehouses.some((w) => w.value === form.warehouseId)) return "Select a valid warehouse.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expectedDate) || Number.isNaN(Date.parse(`${form.expectedDate}T00:00:00`))) return "Select a valid expected date.";
    if (!form.shippingAddress.trim()) return "Enter a shipping address.";
    if (!items.length) return "Add at least one item.";
    const used = new Set();
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      if (!row.itemId) return `Select Item ${i + 1}.`;
      if (!itemOptions.some((choice) => choice.value === row.itemId)) return `Item ${i + 1} is unavailable in the selected warehouse.`;
      if (used.has(row.itemId)) return "Duplicate items are not allowed.";
      used.add(row.itemId);
      if (!Number.isSafeInteger(Number(row.quantity)) || Number(row.quantity) < 1 || String(row.quantity).trim() === "") return `Enter a valid positive quantity for Item ${i + 1}.`;
    }
    return "";
  };

  const buildPayload = () => {
    const common = {
      items: items.map((row) => ({ itemId: row.itemId, quantity: Number(row.quantity) })),
      expectedDate: form.expectedDate,
      shippingAddress: form.shippingAddress.trim(),
      remarks: form.remarks.trim(),
    };
    if (!isEditMode) return { customerId: form.customerId, warehouseId: form.warehouseId, ...common };
    // Backend PUT must support these fields to persist customer/warehouse changes.
    return {
      ...common,
      ...(changedIds.customer ? { customerId: form.customerId } : {}),
      ...(changedIds.warehouse ? { warehouseId: form.warehouseId } : {}),
    };
  };

  const askSubmit = () => { const issue = validate(); if (issue) showError(issue); else setConfirm(true); };
  const submit = async () => {
    if (submitLock.current) return;
    const issue = validate();
    if (issue) { setConfirm(false); showError(issue); return; }
    submitLock.current = true;
    setSaving(true);
    try {
      const result = isEditMode ? await order_processing_edit(rowId, buildPayload()) : await order_processing_create(buildPayload());
      if (result?.data?.success === false) throw new Error(errorText({ response: { data: result.data } }));
      // A successful PUT may ignore unrecognized customerId/warehouseId: verify returned record.
      if (isEditMode && (changedIds.customer || changedIds.warehouse)) {
        const latest = unpackOrder(await order_processing_getById(rowId));
        if (changedIds.customer && idOf(latest?.customerId) !== form.customerId || changedIds.warehouse && idOf(latest?.warehouseId) !== form.warehouseId) {
          throw new Error("The order was saved, but the backend did not apply the customer/warehouse change. Please update the PUT /order/:id endpoint to accept these fields.");
        }
      }
      setSuccessMessage(result?.data?.data?.message || result?.data?.message || (isEditMode ? "Order Updated Successfully!" : "Order Created Successfully!"));
      setConfirm(false);
      setSuccess(true);
    } catch (error) { setConfirm(false); showError(errorText(error)); }
    finally { setSaving(false); submitLock.current = false; }
  };

  if (fetchingOrder) return <div className="min-h-screen flex items-center justify-center gap-3 text-[#0062a0]"><Loader2 className="animate-spin" /> Loading Order Details...</div>;

  return (
    <motion.div variants={animation} initial="hidden" animate="visible" className="min-h-screen bg-[#fcfdfe] p-4 md:p-8">
      <div className="max-w-full mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-10">
        <motion.div variants={appear} className="flex items-center gap-4 mb-10">
          <button type="button" onClick={() => navigate(-1)} className="p-3 hover:bg-blue-50 text-[#0062a0] rounded-2xl" aria-label="Go back"><ArrowLeft size={24} /></button>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl md:text-3xl font-semibold text-slate-800">{isEditMode ? "Edit" : "Create"} Order Processing</h1>{isEditMode && orderType && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold tracking-wide text-[#0062a0] border border-blue-100">{orderType} ORDER</span>}</div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          <motion.div variants={appear}><ReUsableInput_Fields label="Customer" name="customerId" type="select" options={customers} value={form.customerId} onChange={handleField} disabled={!orderLoaded || saving || singleCustomer} /></motion.div>
          <motion.div variants={appear}><ReUsableInput_Fields label="Warehouse Name" name="warehouseId" type="select" options={warehouses} value={form.warehouseId} onChange={handleField} disabled={!form.customerId || loadingWarehouses || saving} /></motion.div>
          <motion.div variants={appear}><ReUsableInput_Fields label="Expected Due Date" name="expectedDate" type="date" value={form.expectedDate} onChange={handleField} /></motion.div>
          <motion.div variants={appear}><ReUsableInput_Fields label="Shipping Address" name="shippingAddress" value={form.shippingAddress} onChange={handleField} /></motion.div>
          <motion.div variants={appear} className="md:col-span-2"><ReUsableInput_Fields label="Remarks" name="remarks" value={form.remarks} onChange={handleField} /></motion.div>
        </div>
        <motion.div variants={appear} className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><div className="flex items-center gap-3"><h2 className="text-2xl md:text-3xl font-bold text-slate-800">Add Items</h2><span className="text-sm text-slate-500">{items.length} item(s)</span></div><button type="button" onClick={addRow} disabled={!canAdd || saving} className="inline-flex items-center gap-2 bg-blue-50 text-[#0062a0] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Add another item"><Plus size={18} /> Add Item</button></div>
          <div className="space-y-4"><AnimatePresence mode="popLayout">{items.map((item) => (
            <motion.div key={item.key} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0"><ReUsableInput_Fields label="Item Name" name="itemId" type="select" options={itemChoicesFor(item.key)} value={item.itemId} onChange={(event) => handleItem(item.key, event)} disabled={!form.warehouseCode || loadingItems || saving} /></div>
              <div className="flex-1 min-w-0"><ReUsableInput_Fields label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(event) => handleItem(item.key, event)} disabled={saving} /></div>
              <div className="flex gap-2 md:pt-4">
                <button type="button" onClick={() => removeRow(item.key)} disabled={items.length <= 1 || saving} className="bg-red-50 text-red-600 p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Remove item"><Trash2 size={24} /></button>
              </div>
            </motion.div>
          ))}</AnimatePresence></div>
        </motion.div>
        <motion.div variants={appear} className="flex justify-end gap-6 mt-16 mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="primary" onClick={askSubmit} disabled={saving || !orderLoaded}>{saving ? "Processing..." : isEditMode ? "Update" : "Create"}</Button>
        </motion.div>
      </div>
      <Confirmation_Popup isOpen={confirm} onClose={() => { if (!saving) setConfirm(false); }} onConfirm={submit} message={`Are you sure you want to ${isEditMode ? "Update" : "Create"} Order Processing?`} />
      <Success_Popup isOpen={success} onClose={() => { setSuccess(false); navigate(-1); }} message={successMessage} />
      <ErrorMessage_Popup isOpen={errorOpen} onClose={() => setErrorOpen(false)} message={errorMessage} />
    </motion.div>
  );
}
