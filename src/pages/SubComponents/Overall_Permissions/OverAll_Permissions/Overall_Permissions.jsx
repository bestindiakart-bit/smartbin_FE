import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, ShieldCheck, Square } from "lucide-react";

const Overall_Permissions = ({ permissions = [], setPermissions }) => {
  // 1. Toggle a single permission (view, create, edit, or delete)
  const togglePermission = (index, field) => {
    const updated = [...permissions];
    updated[index] = {
      ...updated[index],
      [field]: !updated[index][field],
    };
    setPermissions(updated);
  };

  // 2. Toggle the entire row (Parent Checkbox logic)
  const toggleRow = (index) => {
    const item = permissions[index];
    const allChecked = item.create && item.view && item.edit && item.delete;

    const updated = [...permissions];
    updated[index] = {
      ...updated[index],
      create: !allChecked,
      view: !allChecked,
      edit: !allChecked,
      delete: !allChecked,
    };
    setPermissions(updated);
  };

  // 3. Toggle ALL permissions for ALL rows (Master Checkbox logic)
  const toggleAllPermissions = () => {
    // Check if EVERY single permission is already true
    const isGloballyChecked = permissions.every(
      (item) => item.create && item.view && item.edit && item.delete,
    );

    // If globally checked, make everything false. Otherwise, make everything true.
    const updated = permissions.map((item) => ({
      ...item,
      create: !isGloballyChecked,
      view: !isGloballyChecked,
      edit: !isGloballyChecked,
      delete: !isGloballyChecked,
    }));

    setPermissions(updated);
  };

  // Format the module name (e.g., "customer_master" -> "Customer Master")
  const formatModuleName = (name) => {
    if (!name) return "";
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  // Safety check to prevent crash if permissions is undefined
  if (!permissions || permissions.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400 italic">
        No modules available to display.
      </div>
    );
  }

  // Determine if the master checkbox should be checked
  const isGloballyChecked = permissions.every(
    (item) => item.create && item.view && item.edit && item.delete,
  );

  return (
    <div className="bg-white rounded-2xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6 p-4 border-b border-slate-50"
      >
        <div className="p-2 bg-blue-50 rounded-xl">
          <ShieldCheck className="text-[#0062a0]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Module Access Control
          </h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Configure permissions for each system module
          </p>
        </div>
      </motion.div>

      {/* Table Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="overflow-hidden"
      >
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {/* Master "Select All" Header */}
                <th className="p-5 w-24 text-center">
                  <div className="flex flex-col items-center gap-1 justify-center">
                    <button
                      onClick={toggleAllPermissions}
                      className="text-slate-300 hover:text-[#0062a0] transition-all transform active:scale-90 cursor-pointer"
                      title="Select/Deselect All Permissions"
                    >
                      {isGloballyChecked ? (
                        <CheckSquare size={22} className="text-[#0062a0]" />
                      ) : (
                        <Square size={22} className="text-slate-400" />
                      )}
                    </button>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">
                      All
                    </span>
                  </div>
                </th>
                <th className="p-5 text-slate-700 font-bold uppercase text-xs tracking-widest border-r border-slate-100 align-bottom pb-6">
                  Module Name
                </th>
                {["Create", "View", "Edit", "Delete"].map((head) => (
                  <th
                    key={head}
                    className="p-5 text-slate-700 font-bold text-center border-r last:border-r-0 border-slate-100 uppercase text-xs tracking-widest align-bottom pb-6"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {permissions.map((item, index) => {
                  const isAllChecked =
                    item.create && item.view && item.edit && item.delete;

                  return (
                    <motion.tr
                      key={item.module || index}
                      variants={rowVariants}
                      whileHover={{
                        backgroundColor: "rgba(248, 250, 252, 0.8)",
                      }}
                      className="group transition-colors"
                    >
                      {/* Parent Toggle (Row Selector) */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleRow(index)}
                          className="text-slate-200 hover:text-[#0062a0] transition-all transform active:scale-90 cursor-pointer"
                          title={`Toggle all for ${formatModuleName(item.module)}`}
                        >
                          {isAllChecked ? (
                            <CheckSquare size={22} className="text-[#0062a0]" />
                          ) : (
                            <Square size={22} className="text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Module Name */}
                      <td className="p-4 text-slate-700 font-bold border-r border-slate-100 group-hover:text-[#0062a0] transition-colors">
                        {formatModuleName(item.module)}
                      </td>

                      {/* Permission Checkboxes */}
                      {["create", "view", "edit", "delete"].map((field) => (
                        <td
                          key={field}
                          className="p-4 text-center border-r last:border-r-0 border-slate-100"
                        >
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => togglePermission(index, field)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-blue-50 transition-all"
                          >
                            <AnimatePresence mode="wait">
                              {item[field] ? (
                                <motion.div
                                  key="checked"
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.5, opacity: 0 }}
                                >
                                  <CheckSquare
                                    size={22}
                                    className="text-[#0062a0]"
                                  />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="unchecked"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  <Square
                                    size={22}
                                    className="text-slate-200"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Overall_Permissions;
