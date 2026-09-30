import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../component/button/Buttons";
import { project_master_getID } from "../../../../service/Master_Services/Master_Services";

/**
 * Reusable component for the label-value pairs inside the modal
 */
const InfoField = ({ label, value }) => (
  <div className="flex flex-col gap-1 mb-8">
    <span className="text-[13px] text-gray-400 font-medium uppercase tracking-wider">
      {label}
    </span>
    <span className="text-[16px] font-bold text-gray-900">{value || "—"}</span>
  </div>
);

const Project_Master_View = ({ isOpen, onClose, rowId }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- FETCH DATA BY ID ---
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!rowId || !isOpen) return;
      try {
        setLoading(true);
        const res = await project_master_getID(rowId);
        // Based on your JSON structure, we access res.data.data
        setData(res?.data?.data);
      } catch (err) {
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [rowId, isOpen]);

  // Helper to format date strings to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* --- BACKDROP --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* --- MODAL CONTAINER --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-[850px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#0062a0]" size={40} />
                <p className="text-slate-500 font-medium">
                  Fetching details...
                </p>
              </div>
            ) : (
              <>
                {/* Header Section */}
                <div className="flex items-center justify-between p-8 pb-4">
                  <h2 className="text-[24px] md:text-[32px] font-bold text-slate-800">
                    <span className="text-[#0062a0]">
                      View {data?.projectId || "Project"}
                    </span>{" "}
                    <span
                      className={
                        data?.status === 1 ? "text-[#10b981]" : "text-red-500"
                      }
                    >
                      ({data?.status === 1 ? "Active" : "Inactive"})
                    </span>
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
                  >
                    <X size={28} className="cursor-pointer" />
                  </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-8 pt-4 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                    <InfoField label="Project Name" value={data?.projectName} />

                    {/* UPDATED: Path to Customer Name based on nested API structure */}
                    <InfoField
                      label="Customer Name"
                      value={
                        data?.customerId?.customerName || data?.companyName
                      }
                    />

                    <InfoField label="Project Head" value={data?.projectHead} />
                    <InfoField
                      label="Project Manager"
                      value={data?.projectManager}
                    />
                    <InfoField
                      label="Start Date"
                      value={formatDate(data?.startDate)}
                    />
                    <InfoField
                      label="End Date"
                      value={formatDate(data?.endDate)}
                    />
                  </div>

                  {/* Description Section */}
                  <div className="mt-2">
                    <span className="text-[13px] text-gray-400 font-medium uppercase tracking-wider">
                      Description
                    </span>
                    <p className="mt-4 text-[15px] text-gray-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                      {data?.projectDescription ||
                        "No description provided for this project."}
                    </p>
                  </div>
                </div>

                {/* Footer / Action Button */}
                <div className="p-8 flex justify-end bg-gray-50/50 border-t border-gray-100 gap-3">
                  <Button onClick={onClose} variant="secondary">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      onClose();
                      navigate("project-create", {
                        state: { rowId: data?._id, mode: "edit" },
                      });
                    }}
                    variant="primary"
                    className="px-12 py-3 text-[16px] font-bold"
                  >
                    Edit Project
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Project_Master_View;
