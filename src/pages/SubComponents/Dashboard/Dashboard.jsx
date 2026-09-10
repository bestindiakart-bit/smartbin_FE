// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   FolderKanban,
//   Users,
//   UserRound,
//   Boxes,
//   Package,
//   Warehouse,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react";

// const Dashboard = () => {
//   const [dashboardData, setDashboardData] = useState({
//     totalProject: 0,
//     totalCustomer: 0,
//     totalUser: 0,
//     totalBom: 0,
//     totalBin: 0,
//     totalWarehouse: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const Base_Url = import.meta.env.VITE_API_URL;

//   const fetchDashboardOverview = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("accessToken");

//       const response = await axios.get(
//         `${Base_Url}/dashboard/overview`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "ngrok-skip-browser-warning": "true",
//             ...(token
//               ? {
//                   Authorization: `Bearer ${token}`,
//                 }
//               : {}),
//           },
//         }
//       );

//       console.log("Dashboard Overview API Response:", response.data);

//       if (response?.data?.success) {
//         setDashboardData({
//           totalProject:
//             response?.data?.data?.totalProject ?? 0,

//           totalCustomer:
//             response?.data?.data?.totalCustomer ?? 0,

//           totalUser:
//             response?.data?.data?.totalUser ?? 0,

//           totalBom:
//             response?.data?.data?.totalBom ?? 0,

//           totalBin:
//             response?.data?.data?.totalBin ?? 0,

//           totalWarehouse:
//             response?.data?.data?.totalWarehouse ?? 0,
//         });
//       } else {
//         setError(
//           response?.data?.message ||
//             "Failed to fetch dashboard data"
//         );
//       }
//     } catch (err) {
//       console.error(
//         "Dashboard Overview Error:",
//         err
//       );

//       if (err?.response?.status === 401) {
//         const token = localStorage.getItem("accessToken");

//         if (!token) {
//           localStorage.clear();
//           window.location.href = "/login";
//           return;
//         }
//       }

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Unable to load dashboard data"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardOverview();
//   }, []);

//   const cards = [
//     {
//       title: "Total Projects",
//       value: dashboardData.totalProject,
//       icon: FolderKanban,
//       description: "Total projects",
//     },
//     {
//       title: "Total Customers",
//       value: dashboardData.totalCustomer,
//       icon: Users,
//       description: "Registered customers",
//     },
//     {
//       title: "Total Users",
//       value: dashboardData.totalUser,
//       icon: UserRound,
//       description: "System users",
//     },
//     {
//       title: "Total BOM",
//       value: dashboardData.totalBom,
//       icon: Boxes,
//       description: "Bill of materials",
//     },
//     {
//       title: "Total Bins",
//       value: dashboardData.totalBin,
//       icon: Package,
//       description: "Available bins",
//     },
//     {
//       title: "Total Warehouses",
//       value: dashboardData.totalWarehouse,
//       icon: Warehouse,
//       description: "Registered warehouses",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8">
//       <div className="max-w-[1600px] mx-auto">

//         {/* =====================================================
//             HEADER
//         ====================================================== */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
//               Dashboard
//             </h1>

//             <p className="text-sm text-slate-500 mt-1">
//               Overview of your SmartBin system
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={fetchDashboardOverview}
//             disabled={loading}
//             className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             <RefreshCw
//               size={17}
//               className={loading ? "animate-spin" : ""}
//             />

//             Refresh
//           </button>
//         </div>

//         {/* =====================================================
//             ERROR
//         ====================================================== */}
//         {error && (
//           <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100">
//                 <AlertCircle
//                   size={19}
//                   className="text-red-600"
//                 />
//               </div>

//               <div>
//                 <p className="text-sm font-semibold text-red-700">
//                   Unable to load dashboard
//                 </p>

//                 <p className="text-xs text-red-600 mt-0.5">
//                   {error}
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={fetchDashboardOverview}
//               className="text-sm font-semibold text-red-600 hover:text-red-700"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {/* =====================================================
//             STAT CARDS
//         ====================================================== */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//           {cards.map((card) => {
//             const Icon = card.icon;

//             return (
//               <div
//                 key={card.title}
//                 className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-200"
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <p className="text-sm font-medium text-slate-500">
//                       {card.title}
//                     </p>

//                     {loading ? (
//                       <div className="mt-3 h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
//                     ) : (
//                       <p className="mt-2 text-3xl font-bold text-slate-800">
//                         {card.value.toLocaleString()}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
//                     <Icon
//                       size={22}
//                       className="text-[#0062a0]"
//                     />
//                   </div>
//                 </div>

//                 <p className="text-xs text-slate-400 mt-4">
//                   {card.description}
//                 </p>
//               </div>
//             );
//           })}
//         </div>

//         {/* =====================================================
//             SUMMARY
//         ====================================================== */}
//         {/* <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800">
//                 System Overview
//               </h2>

//               <p className="text-sm text-slate-500 mt-1">
//                 Current SmartBin system statistics
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {cards.map((card) => (
//               <div
//                 key={`summary-${card.title}`}
//                 className="p-4 rounded-xl bg-slate-50 border border-slate-100"
//               >
//                 <p className="text-xs text-slate-500">
//                   {card.title}
//                 </p>

//                 <p className="text-xl font-bold text-slate-800 mt-1">
//                   {loading
//                     ? "..."
//                     : card.value.toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div> */}

//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  FolderKanban,
  Users,
  UserRound,
  Boxes,
  Package,
  Warehouse,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/* =========================================================
   Animated Number
   Starts from 0 and smoothly counts to API value
========================================================= */
const AnimatedNumber = ({ value }) => {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const targetValue = Number(value) || 0;

    const controls = animate(count, targetValue, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });

    const unsubscribe = count.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count]);

  return <span>{displayValue.toLocaleString()}</span>;
};

/* =========================================================
   Dashboard
========================================================= */
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProject: 0,
    totalCustomer: 0,
    totalUser: 0,
    totalBom: 0,
    totalBin: 0,
    totalWarehouse: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const Base_Url = import.meta.env.VITE_API_URL;

  /* =========================================================
     Fetch Dashboard Overview
  ========================================================= */
  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${Base_Url}/dashboard/overview`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      console.log(
        "Dashboard Overview API Response:",
        response.data
      );

      if (response?.data?.success) {
        setDashboardData({
          totalProject:
            response?.data?.data?.totalProject ?? 0,

          totalCustomer:
            response?.data?.data?.totalCustomer ?? 0,

          totalUser:
            response?.data?.data?.totalUser ?? 0,

          totalBom:
            response?.data?.data?.totalBom ?? 0,

          totalBin:
            response?.data?.data?.totalBin ?? 0,

          totalWarehouse:
            response?.data?.data?.totalWarehouse ?? 0,
        });
      } else {
        setError(
          response?.data?.message ||
            "Failed to fetch dashboard data"
        );
      }
    } catch (err) {
      console.error(
        "Dashboard Overview Error:",
        err
      );

      if (err?.response?.status === 401) {
        const token =
          localStorage.getItem("accessToken");

        if (!token) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Initial API Call
  ========================================================= */
  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  /* =========================================================
     Dashboard Cards
  ========================================================= */
  const cards = [
    {
      title: "Total Projects",
      value: dashboardData.totalProject,
      icon: FolderKanban,
      description: "Total projects",
    },
    {
      title: "Total Customers",
      value: dashboardData.totalCustomer,
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser,
      icon: UserRound,
      description: "System users",
    },
    {
      title: "Total BOM",
      value: dashboardData.totalBom,
      icon: Boxes,
      description: "Bill of materials",
    },
    {
      title: "Total Bins",
      value: dashboardData.totalBin,
      icon: Package,
      description: "Available bins",
    },
    {
      title: "Total Warehouses",
      value: dashboardData.totalWarehouse,
      icon: Warehouse,
      description: "Registered warehouses",
    },
  ];

  /* =========================================================
     Card Animation Variants
  ========================================================= */
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      scale: 0.96,
    },

    show: {
      opacity: 1,
      y: 0,
      scale: 1,

      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  /* =========================================================
     Render
  ========================================================= */
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">

        {/* =====================================================
            Header
        ===================================================== */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <motion.h1
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
              className="text-2xl md:text-3xl font-bold text-slate-800"
            >
              Dashboard
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              className="text-sm text-slate-500 mt-1"
            >
              Overview of your SmartBin system
            </motion.p>
          </div>

          {/* =================================================
              Refresh Button
          ================================================= */}
          <motion.button
            type="button"
            onClick={fetchDashboardOverview}
            disabled={loading}
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.96,
            }}
            transition={{
              duration: 0.2,
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </motion.button>
        </motion.div>

        {/* =====================================================
            Error Message
        ===================================================== */}
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mb-6 flex items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center gap-3">

              <motion.div
                initial={{
                  scale: 0.5,
                  rotate: -20,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                }}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100"
              >
                <AlertCircle
                  size={19}
                  className="text-red-600"
                />
              </motion.div>

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Unable to load dashboard
                </p>

                <p className="text-xs text-red-600 mt-0.5">
                  {error}
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={fetchDashboardOverview}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {/* =====================================================
            Dashboard Cards
        ===================================================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                variants={cardVariants}

                /* Card Hover */
                whileHover={{
                  y: -7,
                  scale: 1.015,
                  transition: {
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}

                /* Card Press */
                whileTap={{
                  scale: 0.985,
                }}

                className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-xl hover:border-slate-300 transition-shadow duration-300"
              >
                <div className="flex items-start justify-between gap-3">

                  {/* =================================================
                      Card Text
                  ================================================= */}
                  <div>
                    <motion.p
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.4,
                        delay:
                          index * 0.12 + 0.15,
                      }}
                      className="text-sm font-medium text-slate-500"
                    >
                      {card.title}
                    </motion.p>

                    {/* =================================================
                        Loading Skeleton / Animated Number
                    ================================================= */}
                    {loading ? (
                      <motion.div
                        initial={{
                          opacity: 0,
                          scaleX: 0.7,
                        }}
                        animate={{
                          opacity: 1,
                          scaleX: 1,
                        }}
                        transition={{
                          duration: 0.5,
                          delay:
                            index * 0.08,
                        }}
                        className="mt-3 h-9 w-20 bg-slate-100 rounded-lg animate-pulse"
                      />
                    ) : (
                      <motion.p
                        initial={{
                          opacity: 0,
                          scale: 0.7,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.5,
                          delay:
                            index * 0.1 + 0.2,
                          type: "spring",
                          stiffness: 180,
                          damping: 15,
                        }}
                        className="mt-2 text-3xl font-bold text-slate-800"
                      >
                        <AnimatedNumber
                          value={card.value}
                        />
                      </motion.p>
                    )}
                  </div>

                  {/* =================================================
                      Animated Icon
                  ================================================= */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.4,
                      rotate: -25,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.12 + 0.25,
                      duration: 0.6,
                      type: "spring",
                      stiffness: 180,
                      damping: 11,
                    }}
                    whileHover={{
                      scale: 1.12,
                      rotate: 6,
                    }}
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300"
                  >
                    <Icon
                      size={22}
                      className="text-[#0062a0]"
                    />
                  </motion.div>
                </div>

                {/* =================================================
                    Description
                ================================================= */}
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.12 + 0.45,
                    duration: 0.4,
                  }}
                  className="text-xs text-slate-400 mt-4"
                >
                  {card.description}
                </motion.p>

                {/* =================================================
                    Bottom Animated Line
                ================================================= */}
                <motion.div
                  initial={{
                    scaleX: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scaleX: 1,
                    opacity: 1,
                  }}
                  transition={{
                    delay:
                      index * 0.12 + 0.5,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className="origin-left mt-4 h-[2px] w-12 bg-[#0062a0] rounded-full"
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* =====================================================
            Summary Section - Kept Commented As Requested
        ===================================================== */}

        {/*
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          ...
        </div>
        */}

      </div>
    </div>
  );
};

export default Dashboard;