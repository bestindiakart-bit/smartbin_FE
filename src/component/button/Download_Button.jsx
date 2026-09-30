import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Download_Button = ({
  onSelect,
  tooltipText = "Export Data",
  className = "",
  options = [
    { label: "Excel", value: "xlsx", icon: <FileSpreadsheet size={16} /> },
    { label: "CSV", value: "csv", icon: <FileJson size={16} /> },
    { label: "PDF", value: "pdf", icon: <FileText size={16} /> },
  ],
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseStyle =
    "h-11 px-4 flex items-center gap-2 rounded-xl bg-white text-[#0062a0] border border-blue-100 shadow-sm transition-all duration-300 cursor-pointer hover:bg-blue-50 hover:border-blue-200 group";

  const continuousDance = {
    y: [0, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    // Added dynamic z-index here: z-50 when open/hovered to stay above cards
    <div
      className={`relative inline-flex items-center justify-center ${isOpen || isHovered ? "z-[100]" : "z-10"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={menuRef}
    >
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, x: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 5, x: "-50%", scale: 0.95 }}
            className="absolute bottom-full mb-3 px-3 py-1.5 bg-[#0062a0] text-white text-[12px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[110] left-1/2"
          >
            {tooltipText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#0062a0]" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={isOpen ? { scale: 1 } : continuousDance}
        whileTap={{ scale: 0.95 }}
        className={`${baseStyle} ${className}`}
      >
        <Download
          size={18}
          strokeWidth={2.5}
          className={isOpen ? "rotate-12" : ""}
        />
        <span className="text-sm font-bold">Export</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 w-40 bg-white border border-blue-50 rounded-2xl shadow-2xl z-[120] overflow-hidden p-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(opt.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-[#0062a0] rounded-xl transition-colors"
              >
                <span className="text-blue-400">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Download_Button;
