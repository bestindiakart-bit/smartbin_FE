import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

const Confirmation_Popup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  btnText = "Confirm",
  isActive,
}) => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.32, 0.72, 0, 1] };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={transition}
            className="relative w-full max-w-[340px] bg-white rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                >
                  <HelpCircle size={32} className="text-[#0062a0]" />
                </motion.div>
              </motion.div>

              {/* Animated Text */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ...transition }}
                className="text-lg font-bold text-gray-900 mb-1"
              >
                {title || "Confirm"}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...transition }}
                className="text-sm text-gray-500 mb-6 px-2"
              >
                {message}
              </motion.p>

              {/* Action Buttons */}
              <div className="flex w-full gap-2">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, ...transition }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, ...transition }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className={`flex-[1.5] py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 ${
                    isActive
                      ? "bg-[#0062a0] shadow-lg shadow-blue-900/20"
                      : "bg-[#0062a0] hover:bg-[#005285] shadow-md"
                  }`}
                >
                  {btnText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Confirmation_Popup;
