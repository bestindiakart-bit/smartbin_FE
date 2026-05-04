import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Success_Popup from "../../../component/Popup_Models/Success_Popup";
import ReUsableInput_Fields from "../../../component/ReUsableInput_Fields/ReUsableInput_Fields";
import Button from "../../../component/button/Buttons";
import {
  bin_dashboard_get,
  binDashboard_dynamicGet,
  smartbinDashboard_create,
} from "../../../service/Bin_Services/Bin_Services";

const IotCreate = () => {
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [binData, setBinData] = useState([]);
  const navigate = useNavigate();

  // Track hovered field for clear icon (parentIndex, childIndex, fieldName)
  const [hoveredField, setHoveredField] = useState(null);

  const defaultBin = {
    _id: "",
    binId: "",
    weight: "",
    weightPerUnit: 0,
    time: "",
    binStatus: "",
    piecesRemaining: "",
    safetyStockLimit: "",
    reorder: "",
    isReloaded: false,
    reloadaedquantity: 0,
  };

  const defaultMaster = {
    masterID: "",
    masterStatus: "Active",
    bins: [{ ...defaultBin }],
  };

  const [data, setData] = useState([{ ...defaultMaster }]);

  // ---------- Fetch existing configurations (update mode) ----------
  const handleFetchData = async () => {
    setLoadingFetch(true);
    try {
      const res = await binDashboard_dynamicGet(1, 100);
      console.log("Raw API response:", res);

      const records = res?.data?.data || [];

      if (!records.length) {
        alert("No data found.");
        return;
      }

      const grouped = records.reduce((acc, item) => {
        const masterId = item.masterId || "UNKNOWN_MASTER";

        if (!acc[masterId]) {
          acc[masterId] = {
            masterID: masterId,
            masterStatus: item.masterStatus || "Active",
            bins: [],
          };
        }

        const selectedBin = binData.find((b) => b.binId === item.binId);
        const perUnit = Number(selectedBin?.itemMasterId?.weightPerUnit) || 0;
        const safetyStock = selectedBin?.safetyStockQuantity || 0;
        const reorderLevel = selectedBin?.rol || 0;

        acc[masterId].bins.push({
          _id: item._id || "",
          binId: item.binId || "",
          weight: item.currentWeight || "",
          weightPerUnit: perUnit,
          time: item.updatedAt || "",
          binStatus: item.binStatus?.toLowerCase() || "online",
          piecesRemaining: item.currentQuantity || 0,
          safetyStockLimit: safetyStock,
          reorder: reorderLevel,
          isReloaded: false,
          reloadaedquantity: 0,
        });

        return acc;
      }, {});

      const newData = Object.values(grouped).map((master) => ({
        ...defaultMaster,
        ...master,
        bins: master.bins.map((bin) => ({ ...defaultBin, ...bin })),
      }));

      setData(newData);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to load existing data. Check console for details.");
    } finally {
      setLoadingFetch(false);
    }
  };

  // ---------- Reset form to default ----------
  const handleReset = () => {
    setData([{ ...defaultMaster }]);
  };

  // ---------- Handlers for parent (master) ----------
  const handleAddParent = () => {
    setData([...data, { ...defaultMaster, bins: [{ ...defaultBin }] }]);
  };

  const handleParentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [name]: value };
    setData(updatedData);
  };

  const handleRemoveParent = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  // ---------- Handlers for child (bin) ----------
  const handleAddChild = (parentIndex) => {
    const updatedData = [...data];
    updatedData[parentIndex].bins.push({ ...defaultBin });
    setData(updatedData);
  };

  const handleChildChange = (parentIndex, childIndex, e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = [...data];
    const updatedBins = [...updatedData[parentIndex].bins];
    const currentBin = { ...updatedBins[childIndex] };

    const val = type === "checkbox" ? checked : value;
    currentBin[name] = val;

    if (name === "binId") {
      const selectedBin = binData.find((item) => item.binId === value);
      if (selectedBin) {
        updatedData[parentIndex].masterID = selectedBin.masterId || "";
        currentBin.safetyStockLimit = selectedBin.safetyStockQuantity || 0;
        currentBin.reorder = selectedBin.rol || 0;
        const perUnit = Number(selectedBin.itemMasterId?.weightPerUnit) || 0;
        currentBin.weightPerUnit = perUnit;
        if (currentBin.weight) {
          const totalWeight = Number(currentBin.weight);
          currentBin.piecesRemaining =
            perUnit > 0 ? Math.floor(totalWeight / perUnit) : 0;
        }
      } else {
        currentBin.weightPerUnit = 0;
        currentBin.piecesRemaining = 0;
      }
    }

    if (name === "weight") {
      const totalWeight = Number(value);
      const perUnit = Number(currentBin.weightPerUnit);
      currentBin.piecesRemaining =
        perUnit > 0 && totalWeight > 0 ? Math.floor(totalWeight / perUnit) : 0;
    }

    if (name === "isReloaded" && !checked) {
      currentBin.reloadaedquantity = 0;
    }

    updatedBins[childIndex] = currentBin;
    updatedData[parentIndex].bins = updatedBins;
    setData(updatedData);
  };

  const handleRemoveChild = (parentIndex, childIndex) => {
    const updatedData = [...data];
    updatedData[parentIndex].bins.splice(childIndex, 1);
    setData(updatedData);
  };

  // ---------- Clear a specific field ----------
  const handleClearField = (parentIndex, childIndex, fieldName) => {
    const updatedData = [...data];
    const bin = updatedData[parentIndex].bins[childIndex];

    const defaults = {
      binId: "",
      binStatus: "online",
      safetyStockLimit: 0,
      reorder: 0,
      isReloaded: false,
      reloadaedquantity: 0,
    };

    if (fieldName in defaults) {
      bin[fieldName] = defaults[fieldName];

      if (fieldName === "binId") {
        bin.weightPerUnit = 0;
        bin.piecesRemaining = 0;
      }
      if (fieldName === "isReloaded" && !bin.isReloaded) {
        bin.reloadaedquantity = 0;
      }
    }

    setData(updatedData);
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedData = data.map((master) => ({
        ...master,
        bins: master.bins.map((bin) => ({
          ...bin,
          _id: bin._id || undefined,
          weight: Number(bin.weight),
          piecesRemaining: Number(bin.piecesRemaining),
          safetyStockLimit: Number(bin.safetyStockLimit),
          reorder: Number(bin.reorder),
          reloadaedquantity: Number(bin.reloadaedquantity),
          time: bin.time
            ? new Date(bin.time).toISOString()
            : new Date().toISOString(),
        })),
      }));

      const payload = { data: formattedData };
      console.log("Final Payload:", payload);

      const response = await smartbinDashboard_create(payload);
      if (response.status === 200 || response.status === 201) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate(-1);
        }, 2000);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to create configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown options for binId
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bin_dashboard_get();
        setBinData(res?.data?.data?.records || []);
      } catch (err) {
        console.log("Error fetching bins:", err);
      }
    };
    fetchData();
  }, []);

  // Helper to render a field with optional clear icon (only if editable and not weight)
  const renderFieldWithClear = (
    parentIndex,
    childIndex,
    fieldName,
    label,
    componentProps,
    editable = true // whether the field is currently editable
  ) => {
    if (fieldName === "weight") {
      // Weight never gets a clear icon
      return <ReUsableInput_Fields {...componentProps} />;
    }

    const isHovered =
      hoveredField &&
      hoveredField.parentIndex === parentIndex &&
      hoveredField.childIndex === childIndex &&
      hoveredField.fieldName === fieldName;

    return (
      <div
        className="relative"
        onMouseEnter={() =>
          setHoveredField({ parentIndex, childIndex, fieldName })
        }
        onMouseLeave={() => setHoveredField(null)}
      >
        <ReUsableInput_Fields {...componentProps} />
        {editable && isHovered && (
          <button
            type="button"
            onClick={() => handleClearField(parentIndex, childIndex, fieldName)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center shadow"
            title={`Clear ${label}`}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            IoT Configuration Manager
          </h2>
          <div className="flex gap-3">
            <Button onClick={handleReset} variant="secondary">
              Reset Form
            </Button>
            <Button
              onClick={handleFetchData}
              loading={loadingFetch}
              variant="secondary"
            >
              Load Existing Data
            </Button>
            <Button onClick={handleSubmit} loading={loading} variant="primary">
              Submit Configuration
            </Button>
          </div>
        </div>

        {data.map((master, parentIndex) => (
          <div
            key={parentIndex}
            className="mb-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-medium uppercase tracking-wider">
                Master Section {parentIndex + 1}
              </h3>
              {data.length > 1 && (
                <button
                  onClick={() => handleRemoveParent(parentIndex)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors"
                >
                  Remove Master
                </button>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ReUsableInput_Fields
                  label="Master ID"
                  name="masterID"
                  value={master.masterID}
                  disabled={true}
                />
                <ReUsableInput_Fields
                  label="Master Status"
                  name="masterStatus"
                  type="select"
                  options={[
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                  value={master.masterStatus}
                  onChange={(e) => handleParentChange(parentIndex, e)}
                  placeholder="Active / Inactive"
                />
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-600 uppercase">
                    Bin Configurations
                  </h4>
                  <Button
                    onClick={() => handleAddChild(parentIndex)}
                    variant="secondary"
                  >
                    + Add New Bin
                  </Button>
                </div>

                <div className="space-y-4">
                  {master.bins.map((bin, childIndex) => {
                    // Determine if this bin is from fetched data (has _id)
                    const isFetched = !!bin._id;

                    return (
                      <div
                        key={childIndex}
                        className="p-5 border border-dashed border-gray-300 rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-[#0062a0] uppercase">
                            BIN #{childIndex + 1}
                          </span>
                          {master.bins.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveChild(parentIndex, childIndex)
                              }
                              className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                              Remove Bin
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                          {/* Bin ID - disabled if fetched, editable otherwise */}
                          {renderFieldWithClear(
                            parentIndex,
                            childIndex,
                            "binId",
                            "Bin ID",
                            {
                              label: "Bin ID",
                              name: "binId",
                              type: "select",
                              value: bin.binId,
                              options: [
                                { label: "Select Bin", value: "" },
                                ...binData.map((item) => ({
                                  label: item.binId,
                                  value: item.binId,
                                })),
                              ],
                              onChange: (e) =>
                                handleChildChange(parentIndex, childIndex, e),
                              disabled: isFetched, // disable if from fetched data
                            },
                            !isFetched // editable only if not fetched
                          )}

                          {/* Weight - always editable, no clear icon */}
                          <ReUsableInput_Fields
                            label="Weight (g)"
                            type="number"
                            name="weight"
                            value={bin.weight}
                            onChange={(e) =>
                              handleChildChange(parentIndex, childIndex, e)
                            }
                          />

                          {/* Bin Status - disabled if fetched, editable otherwise */}
                          {renderFieldWithClear(
                            parentIndex,
                            childIndex,
                            "binStatus",
                            "Bin Status",
                            {
                              label: "Bin Status",
                              name: "binStatus",
                              type: "select",
                              options: [
                                { label: "Online", value: "online" },
                                { label: "Offline", value: "offline" },
                              ],
                              value: bin.binStatus,
                              onChange: (e) =>
                                handleChildChange(parentIndex, childIndex, e),
                              placeholder: "Online / Offline",
                              disabled: isFetched,
                            },
                            !isFetched
                          )}

                          {/* Pieces Remaining - always disabled */}
                          <ReUsableInput_Fields
                            label="Pieces Remaining"
                            type="number"
                            name="piecesRemaining"
                            value={bin.piecesRemaining}
                            disabled={true}
                          />

                          {/* Safety Stock - always disabled */}
                          <ReUsableInput_Fields
                            label="Safety Stock"
                            type="number"
                            name="safetyStockLimit"
                            value={bin.safetyStockLimit}
                            onChange={(e) =>
                              handleChildChange(parentIndex, childIndex, e)
                            }
                            disabled={true}
                          />

                          {/* Reorder Level - always disabled */}
                          <ReUsableInput_Fields
                            label="Reorder Level"
                            type="number"
                            name="reorder"
                            value={bin.reorder}
                            onChange={(e) =>
                              handleChildChange(parentIndex, childIndex, e)
                            }
                            disabled={true}
                          />

                          {/* Reloaded quantity (conditional) - editable, with clear icon */}
                          {bin.isReloaded &&
                            renderFieldWithClear(
                              parentIndex,
                              childIndex,
                              "reloadaedquantity",
                              "Reloaded Qty",
                              {
                                label: "Reloaded Qty",
                                type: "number",
                                name: "reloadaedquantity",
                                value: bin.reloadaedquantity,
                                onChange: (e) =>
                                  handleChildChange(parentIndex, childIndex, e),
                              },
                              true // always editable when visible
                            )}

                          {/* Checkbox for isReloaded - always editable, with clear icon */}
                          <div
                            className="flex flex-col gap-1 relative"
                            onMouseEnter={() =>
                              setHoveredField({
                                parentIndex,
                                childIndex,
                                fieldName: "isReloaded",
                              })
                            }
                            onMouseLeave={() => setHoveredField(null)}
                          >
                            <label className="text-sm font-semibold text-gray-700">
                              Is Reloaded?
                            </label>
                            <div className="flex items-center h-full">
                              <input
                                type="checkbox"
                                name="isReloaded"
                                checked={bin.isReloaded}
                                onChange={(e) =>
                                  handleChildChange(parentIndex, childIndex, e)
                                }
                                className="w-5 h-5 cursor-pointer accent-[#0062a0]"
                              />
                              <span className="ml-2 text-sm text-gray-600">
                                {bin.isReloaded ? "Yes" : "No"}
                              </span>
                            </div>
                            {hoveredField &&
                              hoveredField.parentIndex === parentIndex &&
                              hoveredField.childIndex === childIndex &&
                              hoveredField.fieldName === "isReloaded" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleClearField(
                                      parentIndex,
                                      childIndex,
                                      "isReloaded"
                                    )
                                  }
                                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                                  title="Clear Is Reloaded"
                                >
                                  ✕
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddParent}
          className="w-full py-4 border-2 border-dashed border-[#0062a0] text-[#0062a0] rounded-xl font-bold hover:bg-blue-50 transition-colors flex justify-center items-center gap-2 mb-10"
        >
          <span className="text-xl">+</span> Add New Master Section
        </button>
      </div>

      <Success_Popup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Configuration Submitted Successfully!"
      />
    </div>
  );
};

export default IotCreate;