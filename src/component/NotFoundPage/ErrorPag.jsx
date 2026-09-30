import { motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoSmartBin from "../../assets/LogoSmartBin.svg";

const ErrorPage = ({ type = "404" }) => {
  const navigate = useNavigate();

  const is404 = type === "404";
  const is500 = type === "500";
  const isNetwork = type === "network";

  const errorConfigs = {
    404: {
      sub: "404",
      title: "Sorry, part not found",
      desc: "The sector you are scanning is empty. The link may be broken, or the component was removed.",
      action: () => navigate("/login"),
      symbols: ["?", "#", "+", "?", "#", "+"],
    },
    500: {
      sub: "500",
      title: "Mechanism Jammed",
      desc: "Our server gears are grinding. We're actively recalibrating the system. Please try again.",
      buttonText: "Restart System",
      action: () => window.location.reload(),
      symbols: ["!", "⚙", "⚠", "!", "⚙", "⚠"],
    },
    network: {
      sub: "OFFLINE",
      title: "Power Connection Lost",
      desc: "Connection to the mainframe is severed. Please check your internet connection.",
      action: () => window.location.reload(),
      symbols: ["~", "...", "x", "~", "...", "x"],
    },
  };

  const config = errorConfigs[type] || errorConfigs["404"];

  // --- REUSABLE 3D MECHANICAL PARTS ---
  const HorizontalBolt = ({ isGray }) => (
    <div className="flex items-center shadow-xl drop-shadow-xl z-10">
      {/* Bolt Head */}
      <div
        className={`w-10 md:w-14 h-20 md:h-28 rounded-l-xl border-y border-l flex flex-col justify-between overflow-hidden ${isGray ? "bg-slate-400 border-slate-500" : "bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border-slate-400"}`}
      >
        <div className="h-[20%] border-b border-black/10 bg-black/5" />
        <div className="h-[60%] border-b border-black/10 bg-white/40 relative">
          <div className="absolute inset-y-0 left-[30%] w-[20%] bg-white/50 skew-x-[15deg]" />
        </div>
        <div className="h-[20%] bg-black/5" />
      </div>
      {/* Bolt Shaft */}
      <div
        className={`w-28 md:w-40 h-12 md:h-16 border-y rounded-r-sm relative overflow-hidden ${isGray ? "bg-slate-300 border-slate-400" : "bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border-slate-400"}`}
      >
        <svg className="w-full h-full absolute inset-0">
          <defs>
            <pattern
              id={`h-threads-${type}`}
              x="0"
              y="0"
              width="16"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M4,0 L20,64 L16,64 L0,0 Z"
                fill={
                  isGray ? "rgba(100, 116, 139, 0.3)" : "rgba(71, 85, 105, 0.4)"
                }
              />
              <path
                d="M5,0 L21,64 L20,64 L4,0 Z"
                fill={isGray ? "transparent" : "rgba(255, 255, 255, 0.7)"}
              />
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#h-threads-${type})`}
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent pointer-events-none" />
      </div>
    </div>
  );

  const HorizontalNut = ({ isGray }) => (
    <div
      className={`w-14 md:w-20 h-24 md:h-32 rounded-[4px] shadow-[8px_8px_16px_rgba(0,0,0,0.3)] border flex flex-col overflow-hidden z-20 ${isGray ? "border-slate-500" : "border-[#004a7a]"}`}
    >
      <div
        className={`h-[20%] border-b border-black/20 ${isGray ? "bg-gradient-to-b from-slate-500 to-slate-600" : "bg-gradient-to-b from-[#004a7a] to-[#005a94]"}`}
      />
      <div
        className={`h-[60%] relative border-b border-black/20 ${isGray ? "bg-gradient-to-b from-slate-400 via-slate-500 to-slate-400" : "bg-gradient-to-b from-[#0062a0] via-[#2a8bc9] to-[#0062a0]"}`}
      >
        <div
          className={`absolute top-[25%] bottom-[25%] left-0 w-full skew-y-[15deg] ${isGray ? "bg-white/10" : "bg-white/25"}`}
        />
      </div>
      <div
        className={`h-[20%] ${isGray ? "bg-gradient-to-b from-slate-600 to-slate-700" : "bg-gradient-to-b from-[#005a94] to-[#003b60]"}`}
      />
    </div>
  );

  // --- FLOATING BACKGROUND SYMBOLS ---
  const FloatingSymbols = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {config.symbols.map((sym, i) => {
        // Randomize positions slightly based on index
        const top = `${15 + i * 12}%`;
        const left = `${10 + (i % 2 === 0 ? i * 15 : 80 - i * 10)}%`;
        const color = is404
          ? "text-blue-300"
          : is500
            ? "text-amber-400/60"
            : "text-slate-300";

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 0.6,
              y: [-10, 10, -10],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute text-3xl md:text-5xl font-black ${color}`}
            style={{ top, left }}
          >
            {sym}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#fcfdfe] flex flex-col font-sans relative overflow-hidden">
      {/* Header */}
      <header className="w-full p-6 md:p-10 relative z-20 flex justify-between items-center">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={LogoSmartBin}
          alt="SmartBin Logo"
          className="h-8 md:h-10"
        />
        {isNetwork && <WifiOff className="text-slate-400" size={24} />}
        {is500 && <AlertTriangle className="text-amber-500" size={24} />}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-5xl mx-auto overflow-hidden p-6">
        {/* TOP: Huge Error Code */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-[6rem] md:text-[10rem] font-black leading-none mb-4 md:mb-8 tracking-tighter ${isNetwork ? "text-slate-300" : is500 ? "text-amber-500" : "text-[#0062a0]"}`}
        >
          {config.sub}
        </motion.h1>

        {/* MIDDLE: The Illustration Area */}
        <div className="relative w-full h-48 md:h-64 flex items-center justify-center mb-8 md:mb-12">
          <FloatingSymbols />

          {/* 404 Layout: Disconnected */}
          {is404 && (
            <div className="flex items-center justify-center gap-12 md:gap-24 w-full relative">
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <HorizontalBolt isGray={false} />
              </motion.div>
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <HorizontalNut isGray={false} />
              </motion.div>
            </div>
          )}

          {/* 500 Layout: Jammed & Broken */}
          {is500 && (
            <div className="relative flex items-center justify-center w-full">
              <HorizontalBolt isGray={false} />
              <motion.div
                className="absolute left-[50%] ml-[-20px] md:ml-[-10px]"
                animate={{
                  rotate: [12, -8, 15, -10, 12],
                  x: [-3, 3, -2, 4, -3],
                  y: [2, -2, 3, -1, 2],
                }}
                transition={{ duration: 0.15, repeat: Infinity }}
              >
                <HorizontalNut isGray={false} />
              </motion.div>
              {/* Warning Spark Overlay */}
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-400/20 blur-2xl rounded-full"
              />
            </div>
          )}

          {/* Network Layout: Connected but Offline */}
          {isNetwork && (
            <div className="relative flex items-center justify-center w-full grayscale opacity-70">
              <HorizontalBolt isGray={true} />
              <div className="absolute left-[40%] md:left-[45%]">
                <HorizontalNut isGray={true} />
              </div>
              {/* Disconnected Line / Slash */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-32 md:h-48 bg-red-500/50 rotate-45" />
            </div>
          )}
        </div>

        {/* BOTTOM: Text and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center w-full px-4"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
            {config.title}
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-10 text-[1rem] md:text-[1.1rem] leading-relaxed">
            {config.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <ChevronLeft size={20} />
              Go Back
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      {/* <footer className="p-6 md:p-8 text-center text-slate-400 text-sm font-medium relative z-20">
         © {new Date().getFullYear()} SmartBin System
      </footer> */}
    </div>
  );
};

export default ErrorPage;
