import { motion } from "framer-motion";
import LogoSmartBin from "../../assets/LogoSmartBin.svg";

const PreLoader = () => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#fcfdfe]">
      {/* --- ADVANCED BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0062a0]/10 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-300/30 rounded-full blur-[120px] opacity-70" />
      </div>

      <div className="relative flex flex-col items-center justify-center h-full">
        {/* --- THE MECHANICAL CORE: 3D Nut & Bolt --- */}
        <div className="relative w-32 h-40 flex justify-center mb-8">
          {/* Ground Drop Shadow */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70px] h-[6px] bg-black blur-[4px] rounded-full z-0"
          />

          {/* 1. The Bolt Shaft (Spinning) */}
          <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-[40px] h-[120px] bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-t-md shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] border-x border-t border-slate-400 overflow-hidden z-0">
            {/* Flawless SVG Threading Illusion */}
            <motion.div
              animate={{ y: ["-24px", "0px"] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-[200%]"
            >
              <svg className="w-full h-full">
                <defs>
                  <pattern
                    id="threads"
                    x="0"
                    y="0"
                    width="40"
                    height="12"
                    patternUnits="userSpaceOnUse"
                  >
                    {/* Dark Thread Shadow */}
                    <path
                      d="M0,3 L40,15 L40,12 L0,0 Z"
                      fill="rgba(71, 85, 105, 0.4)"
                    />
                    {/* Metallic Thread Highlight */}
                    <path
                      d="M0,4 L40,16 L40,15 L0,3 Z"
                      fill="rgba(255, 255, 255, 0.7)"
                    />
                  </pattern>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="url(#threads)"
                />
              </svg>
            </motion.div>
            {/* Cylinder Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
          </div>

          {/* 2. The Brand-Colored Nut (Screwing up and down) */}
          <motion.div
            animate={{ y: [0, 80, 0] }} // Perfectly calculates to stop right above the bolt head
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[16px] left-1/2 -translate-x-1/2 z-20 w-[64px] h-[28px] rounded-[3px] shadow-[0_8px_16px_rgba(0,0,0,0.3)] border border-[#004a7a] flex overflow-hidden"
          >
            {/* Left Hex Face */}
            <div className="w-[16px] bg-gradient-to-r from-[#004a7a] to-[#005a94] border-r border-[#003b60]/50 shadow-[inset_-2px_0_5px_rgba(0,0,0,0.15)]" />
            {/* Center Hex Face (Brightest) */}
            <div className="w-[32px] bg-gradient-to-r from-[#0062a0] via-[#2a8bc9] to-[#0062a0] relative border-r border-[#003b60]/50">
              <div className="absolute top-0 bottom-0 left-[25%] w-[30%] bg-white/25 skew-x-[15deg]" />
            </div>
            {/* Right Hex Face (Darkest) */}
            <div className="w-[16px] bg-gradient-to-r from-[#005a94] to-[#003b60] shadow-[inset_2px_0_5px_rgba(0,0,0,0.15)]" />
          </motion.div>

          {/* 3. The Bolt Head (Static base) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[64px] h-[24px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-b-md shadow-[0_5px_10px_rgba(0,0,0,0.2)] border border-slate-400 flex overflow-hidden">
            <div className="w-[16px] border-r border-slate-400/80 bg-black/5" />
            <div className="w-[32px] border-r border-slate-400/80 bg-white/40 relative">
              <div className="absolute top-0 bottom-0 left-[30%] w-[20%] bg-white/50 skew-x-[15deg]" />
            </div>
            <div className="w-[16px] bg-black/5" />
          </div>

          {/* Bonus: High-Tech Laser Scanning Line for "Inventory" theme */}
          <motion.div
            animate={{ y: [16, 120, 16] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[2px] bg-blue-400 shadow-[0_0_8px_#60a5fa] z-30 pointer-events-none opacity-60"
          />
        </div>

        {/* --- BRANDING SECTION --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          {/* Logo with Advanced Reveal & Shine */}
          <div className="relative overflow-hidden group">
            <motion.img
              src={LogoSmartBin}
              alt="SmartBin"
              className="w-40 h-auto md:w-48"
              initial={{ filter: "brightness(1)" }}
              animate={{
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Logo Shine Sweep Effect */}
            <motion.div
              animate={{ left: ["-100%", "200%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
            />
          </div>

          {/* Subtext with High-Tech Loading Bar */}
          <div className="mt-6 flex flex-col items-center w-64">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-[10px] uppercase font-black text-[#0062a0] tracking-[0.4em] opacity-80">
                Optimizing Inventory
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-[3px] bg-slate-200 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="absolute h-full bg-[#0062a0] rounded-full shadow-[0_0_8px_#0062a0]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PreLoader;
