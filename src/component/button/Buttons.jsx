import clsx from "clsx";
import { motion } from "framer-motion";
import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      onClick,
      variant = "primary",
      size = "md",
      isActive = false,
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    //  Base Styles - removed cursor-pointer from here since it will be conditionally applied
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0062a0] overflow-hidden group select-none";

    //  Size Variants
    const sizes = {
      sm: "text-sm px-4 py-2",
      md: "text-[15px] px-6 py-2.5",
      lg: "text-base px-8 py-3",
    };

    //  Variant Styles
    const variants = {
      primary: clsx(
        "text-white",
        isActive
          ? "bg-[#0062a0] shadow-lg shadow-blue-900/20"
          : "bg-[#0062a0] hover:bg-[#005285] shadow-md"
      ),

      secondary: clsx(
        isActive
          ? "bg-blue-100 text-[#0062a0]"
          : "bg-transparent text-[#0062a0] hover:bg-blue-100/50"
      ),

      outline:
        "border-2 border-[#0062a0] text-[#0062a0] hover:bg-[#0062a0] hover:text-white",
    };

    //  Animation Settings
    const motionProps = {
      whileHover: !isDisabled
        ? { scale: 1.03 }
        : undefined,
      whileTap: !isDisabled
        ? { scale: 0.97 }
        : undefined,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      },
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={!isDisabled ? onClick : undefined}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={clsx(
          baseStyles,
          sizes[size],
          variants[variant],
          isDisabled && "opacity-60 cursor-not-allowed",
          !isDisabled && "cursor-pointer", 
          className
        )}
        {...motionProps}
        {...props}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <motion.span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
          ) : (
            <>
              {leftIcon && <span>{leftIcon}</span>}
              {children}
              {rightIcon && <span>{rightIcon}</span>}
            </>
          )}
        </span>

        {/* Premium Soft Hover Glow */}
        {!isDisabled && (
          <motion.div
            className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;