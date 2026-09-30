// import { createBrowserRouter } from "react-router-dom";
// import App from "../../App";
// import Dashboard from "../../pages/SubComponents/Dashboard/Dashboard";
// import OverAll_Report from "../../pages/SubComponents/OverAll_Report/OverAll_Report/OverAll_Report";
// import { Bin_Route } from "../Bin/Bin_route";
// import { ForeCast_Route } from "../ForeCast/ForeCast_Route";
// import { Login_Routes } from "../Login/Login_Routes";
// import { Master_Route } from "../Master/Master_Route";
// import { Orders_Route } from "../Orders/Orders_Route";

// export const router =createBrowserRouter([
//     ...Login_Routes,
//     {
//         path:"/",
//         Component:App,
//         children:[
//             {
//                     index:true,
//                     Component:Dashboard,
//                 },
//                 ...Master_Route,
//                 ...Orders_Route,
//                 ...Bin_Route,
//                 ...ForeCast_Route,

//                 {
//                     path:"overall-report",
//                     Component:OverAll_Report,
//                 }
//         ]
//     },

// ])

import { createBrowserRouter, redirect } from "react-router-dom";
import App from "../../App";
import Dashboard from "../../pages/SubComponents/Dashboard/Dashboard";
import OverAll_Report from "../../pages/SubComponents/OverAll_Report/OverAll_Report/OverAll_Report";
import { Bin_Route } from "../Bin/Bin_route";
import { ForeCast_Route } from "../ForeCast/ForeCast_Route";
import { Login_Routes } from "../Login/Login_Routes";
import { Master_Route } from "../Master/Master_Route";
import { Orders_Route } from "../Orders/Orders_Route";

// Import the ErrorPage component
import ErrorPage from "../../component/NotFoundPage/ErrorPag";

// 1. Create wrapper components to avoid using JSX syntax < />
const Page404 = () => ErrorPage({ type: "404" });
const Page500 = () => ErrorPage({ type: "500" });
const PageNetwork = () => ErrorPage({ type: "network" });

// 2. Define the Guard Loader
const protectedLoader = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    // No token found? Block access and force them to the login page.
    return redirect("/login");
  }

  // Token found? Allow them to proceed to the requested route.
  return null;
};

export const router = createBrowserRouter([
  // Public Login Routes
  ...Login_Routes,

  // Dedicated Error Routes using 'Component' instead of 'element'
  {
    path: "/404",
    Component: Page404,
  },

  {
    path: "/500",
    Component: Page500,
  },

  {
    path: "/network-error",
    Component: PageNetwork,
  },

  {
    path: "/",
    Component: App,
    loader: protectedLoader,
    children: [
      {
        index: true,
        loader: () => redirect("/dashboard"),
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      ...Master_Route,
      ...Orders_Route,
      ...Bin_Route,
      ...ForeCast_Route,
      {
        path: "overall-report",
        Component: OverAll_Report,
      },
    ],
  },

  // Catch-all
  {
    path: "*",
    loader: () => redirect("/404"),
  },
]);
