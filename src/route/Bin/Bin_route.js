import Bin_Configuration from "../../pages/SubComponents/Bin/Bin_Configuration/Bin_Configuration";
import Bin_Configuration_Main from "../../pages/SubComponents/Bin/Bin_Configuration/Bin_Configuration_Main";
import Bin_Create from "../../pages/SubComponents/Bin/Bin_Configuration/Bin_Create";
import SmartBin_Dashboard from "../../pages/SubComponents/Bin/SmartBin_Dashboard/SmartBin_Dashboard";
import SmartBin_Main from "../../pages/SubComponents/Bin/SmartBin_Dashboard/SmartBin_Main";

export const Bin_Route = [
  {
    path: "bin-dashboard",
    Component: SmartBin_Main,
    children: [
      {
        index: true,
        Component: SmartBin_Dashboard,
      },
    ],
  },
  {
    path: "bin-config",
    Component: Bin_Configuration_Main,
    children: [
      {
        index: true,
        Component: Bin_Configuration,
      },
      {
        path: "bin-create",
        Component: Bin_Create,
      },
    ],
  },
];
