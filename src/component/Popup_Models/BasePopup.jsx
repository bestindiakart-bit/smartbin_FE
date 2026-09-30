import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const BasePopup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  icon: Icon,
  iconBg,
  iconColor,
  isActive = false,
  showCancel = false,
}) => {
  if (!isOpen) return null;

  // Your specific button styling logic
  const buttonStyle = isActive
    ? "bg-[#0062a0] shadow-lg shadow-blue-900/20"
    : "bg-[#0062a0] hover:bg-[#005285] shadow-md transition-all duration-200";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Popup Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div
              className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${iconBg}`}
            >
              <Icon size={40} className={iconColor} />
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex w-full gap-3">
              {showCancel && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-600 font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {cancelText || "Cancel"}
                </button>
              )}
              <button
                onClick={onConfirm || onClose}
                className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl ${buttonStyle}`}
              >
                {confirmText || "Okay"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BasePopup;
