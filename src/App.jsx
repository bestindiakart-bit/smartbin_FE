// import { AnimatePresence } from "framer-motion";
// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import Side_Bar from "./pages/side_bar/Side_Bar";
// import TopHeader from "./pages/side_bar/TopHeader";

// const App = () => {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for smoothness

//   return (
//     <>
//       <AnimatePresence>
//       </AnimatePresence>

//       <div className="flex h-screen bg-[#f8fdff] overflow-hidden font-sans">
//         {/* Sidebar Component */}
//         <Side_Bar
//           isMobileOpen={isMobileOpen}
//           setIsMobileOpen={setIsMobileOpen}
//           isCollapsed={isCollapsed}
//           setIsCollapsed={setIsCollapsed}
//         />

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           <TopHeader
//             toggleMobileSidebar={() => setIsMobileOpen(true)}
//             isCollapsed={isCollapsed}
//           />
//           <main className="flex-1 overflow-y-auto p-4 md:p-8">
//             <Outlet />
//           </main>
//         </div>

//         {/* Mobile Overlay */}
//         {isMobileOpen && (
//           <div
//             className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
//             onClick={() => setIsMobileOpen(false)}
//           />
//         )}
//       </div>
//     </>
//   );
// };

// export default App;

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Side_Bar from "./pages/side_bar/Side_Bar";
import TopHeader from "./pages/side_bar/TopHeader";

// Skeleton component for the Main Outlet Content
const MainSkeleton = () => {
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-pulse">
      {/* Skeleton Header Area */}
      <div className="h-8 bg-gray-200 rounded-md w-48 mb-2"></div>

      {/* Skeleton Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>

      {/* Skeleton Large Chart/Table Area */}
      <div className="flex-1 min-h-[400px] bg-gray-200 rounded-xl mt-4"></div>
    </div>
  );
};

const App = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for smoothness
  const [isLoading, setIsLoading] = useState(true);

  // Simulate global loading or fetch initial necessary data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Set this to actual API loading dependency in real implementation

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence></AnimatePresence>

      <div className="flex h-screen bg-[#f8fdff] overflow-hidden font-sans">
        {/* Sidebar Component */}
        <Side_Bar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isLoading={isLoading} // Added skeleton prop
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopHeader
            toggleMobileSidebar={() => setIsMobileOpen(true)}
            isCollapsed={isCollapsed}
            isLoading={isLoading} // Added skeleton prop
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {isLoading ? <MainSkeleton /> : <Outlet />}
          </main>
        </div>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default App;
