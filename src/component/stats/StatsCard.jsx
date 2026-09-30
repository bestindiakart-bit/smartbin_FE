import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect } from "react";

const StatsCard = ({
  id, // Added id to use as a unique reference
  title = "Total Order Processing",
  count = 0,
  footerText = "OverAll",
  icon: Icon,
  className = "",
}) => {
  const countValue = useMotionValue(0);

  // Parses the count prop (e.g., "4,500" -> 4500)
  const numericValue =
    typeof count === "string" ? parseFloat(count.replace(/,/g, "")) : count;

  const rounded = useTransform(countValue, (latest) =>
    Math.round(latest).toLocaleString(),
  );

  useEffect(() => {
    // Reset the count to 0 before animating to the new value
    countValue.set(0);
    const controls = animate(countValue, numericValue, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [numericValue, countValue]);

  return (
    <motion.div
      // Providing a key here ensures that if the ID changes,
      // the whole card re-runs its entry animation
      key={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-[#f0faff] p-4 rounded-xl border border-blue-50 shadow-sm min-w-[220px] flex flex-col justify-between ${className}`}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start">
        <h3 className="text-[#1e3a5f] font-semibold text-[15px] leading-snug max-w-[140px]">
          {title}
        </h3>

        {/* Safety check: Only clone if Icon is a valid React element */}
        {Icon && React.isValidElement(Icon) && (
          <div className="bg-[#def2ff] p-2 rounded-lg text-[#0062a0] flex items-center justify-center shrink-0">
            {React.cloneElement(Icon, { size: 18 })}
          </div>
        )}
      </div>

      {/* The Running Number */}
      <div className="my-1">
        <motion.span className="text-[#0062a0] text-3xl font-bold tracking-tight">
          {rounded}
        </motion.span>
      </div>

      {/* Footer Text */}
      <div>
        <span className="text-gray-400 font-medium text-[14px]">
          {footerText}
        </span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
