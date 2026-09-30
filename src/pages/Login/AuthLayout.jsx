// import { motion } from "framer-motion";
// import LogoSmartBin from "../../assets/LogoSmartBin.svg";

// const AuthLayout = ({ children, title, subtitle }) => {
//   return (
//     <div className="min-h-screen bg-[#f8fdff] flex items-center justify-center p-4 md:p-10 font-sans overflow-hidden">
//       {/* Background Decorative Hexagons */}
//       <div className="fixed inset-0 pointer-events-none opacity-20">
//         <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl" />
//         <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-[1100px] bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 flex flex-col md:flex-row overflow-hidden border border-blue-50"
//       >
//         {/* LEFT SIDE: INDUSTRIAL GRAPHICS */}
//         <div className="hidden md:flex w-1/2 bg-[#0062a0] relative overflow-hidden p-12 flex-col justify-between">
//           {/* Floating Mechanical Elements */}
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//             className="absolute -top-20 -right-20 w-80 h-80 border-[40px] border-white/5 rounded-full"
//           />
//           <motion.div
//              animate={{ y: [0, -20, 0] }}
//              transition={{ duration: 4, repeat: Infinity }}
//              className="absolute top-1/4 left-1/4 opacity-10"
//           >
//             <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
//               <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" /> {/* Hex Nut Shape */}
//             </svg>
//           </motion.div>

//           <div className="relative z-10">
//             <img src={LogoSmartBin} alt="SmartBin" className="w-40 brightness-0 invert" />
//             <h2 className="text-white text-4xl font-bold mt-10 leading-tight">
//               Smart Inventory <br /> <span className="text-blue-200">Management System.</span>
//             </h2>
//           </div>

//           <div className="relative z-10">
//             <p className="text-blue-100 text-sm font-medium tracking-wide">
//               Optimizing your supply chain with precision-engineered hardware solutions.
//             </p>
//           </div>

//           {/* Threaded Line Decoration */}
//           <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20 flex flex-col gap-2">
//             {[...Array(6)].map((_, i) => (
//               <div key={i} className="h-[2px] bg-white w-full" style={{ marginLeft: i * 10 }} />
//             ))}
//           </div>
//         </div>

//         {/* RIGHT SIDE: FORM AREA */}
//         <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
//           <div className="mb-10">
//             <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
//             <p className="text-slate-400 mt-2 font-medium">{subtitle}</p>
//           </div>
//           {children}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default AuthLayout;

import { motion } from "framer-motion";
import LogoSmartBin from "../../assets/LogoSmartBin.svg";

const AuthLayout = ({ children, title, subtitle }) => {
  // Shared motion curve with the sidebar for "Full Smoothness"
  const smoothTransition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] };

  return (
    <div className="min-h-screen bg-[#f8fdff] flex items-center justify-center p-4 md:p-10 font-sans overflow-hidden">
      {/* BACKGROUND DECORATION: Matching the Soft Blue Theme */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={smoothTransition}
        className="w-full max-w-[1150px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,98,160,0.1)] flex flex-col md:flex-row overflow-hidden border border-blue-50 relative"
      >
        {/* LEFT SIDE: BRAND PANEL (Matches Side_Bar Background) */}
        <div className="hidden md:flex w-[45%] bg-[#0062a0] relative overflow-hidden p-14 flex-col justify-between">
          {/* MECHANICAL ANIMATIONS: Synced with "Masters" vibe */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 border-[45px] border-white/5 rounded-full"
          />

          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-10"
          >
            <svg width="120" height="120" viewBox="0 0 100 100" fill="white">
              <path d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z" />
            </svg>
          </motion.div>

          {/* BRANDING */}
          <div className="relative z-10">
            <motion.img
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, ...smoothTransition }}
              src={LogoSmartBin}
              alt="SmartBin"
              className="w-44 brightness-0 invert"
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, ...smoothTransition }}
              className="mt-12"
            >
              <h2 className="text-white text-4xl font-bold leading-tight">
                Precision <br />
                <span className="text-blue-300">Inventory Control.</span>
              </h2>
              <div className="w-16 h-1.5 bg-blue-400 mt-6 rounded-full" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative z-10 text-blue-100/80 text-sm font-medium tracking-wide max-w-xs"
          >
            Powered by Smart Bin IoT technology for industrial excellence.
          </motion.p>

          {/* DECORATIVE LINES (Like the sidebar border/structure) */}
          <div className="absolute bottom-10 left-0 w-full opacity-10 flex flex-col gap-3">
            <div className="h-[1px] bg-white w-[80%]" />
            <div className="h-[1px] bg-white w-[60%]" />
            <div className="h-[1px] bg-white w-[40%]" />
          </div>
        </div>

        {/* RIGHT SIDE: FORM AREA (Matches Main Content Background) */}
        <div className="w-full md:w-[55%] p-8 md:p-20 flex flex-col justify-center bg-white relative">
          {/* SUBTLE NOTCH DESIGN: Mimicking the Sidebar Active State icon area */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-24 bg-[#0062a0] rounded-r-full hidden md:block opacity-20" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ...smoothTransition }}
          >
            <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-[#0062a0] tracking-tight">
                {title}
              </h1>
              <p className="text-slate-400 mt-3 text-lg font-medium">
                {subtitle}
              </p>
            </div>

            {/* Form Fields go here */}
            <div className="relative">{children}</div>
          </motion.div>

          {/* Footer Branding for Mobile */}
          <div className="mt-12 md:hidden flex justify-center">
            <img
              src={LogoSmartBin}
              alt="SmartBin"
              className="w-28 opacity-50"
            />
          </div>
        </div>
      </motion.div>

      {/* Version Tag (Optional bottom decoration) */}
      <div className="fixed bottom-6 text-slate-300 text-xs font-bold tracking-widest uppercase">
        SmartBin System v2.0
      </div>
    </div>
  );
};

export default AuthLayout;
