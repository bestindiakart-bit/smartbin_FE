import Bin_Configuration from "../../pages/SubComponents/Bin/Bin_Configuration/Bin_Configuration";
import Bin_Configuration_Main from "../../pages/SubComponents/Bin/Bin_Configuration/Bin_Configuration_Main";
import Bin_Create from "../../pages/SubComponents/Bin/Bin_Configuration/Bin_Create";
import SmartBin_Dashboard from "../../pages/SubComponents/Bin/SmartBin_Dashboard/SmartBin_Dashboard";
import SmartBin_Main from "../../pages/SubComponents/Bin/SmartBin_Dashboard/SmartBin_Main";

import ForCast_Editor from "../../pages/SubComponents/ForeCast/Forcast_Editor/ForCast_Editor";
import Forcast_Main from "../../pages/SubComponents/ForeCast/Forcast_Main";
import ForCast_Table from "../../pages/SubComponents/ForeCast/ForCast_Table/ForCast_Table";
import ForCast_View from "../../pages/SubComponents/ForeCast/ForCast_Table/ForCast_View";

export const ForeCast_Route = [
  {
    path: "forecast-viewer",
    Component: Forcast_Main,
    handle: {
      viewerType: "forecast",
      title: "Forecast",
      description: "Manage and monitor forecasts",
      apiEndpoint: "/forecast",
      idLabel: "Forecast Id",
      createLabel: "Create Forecast",
      editorTitle: "Forecast Editor",
      editTitle: "Edit Forecast",
      monthLabel: "Forecast Month",
      quantityLabel: "Production Quantity",
      updateLabel: "Update Forecast",
      searchPlaceholder:
        "Search by Forecast ID, Customer, Project, or BOM...",
    },
    children: [
      {
        index: true,
        Component: ForCast_Table,
      },
      {
        path: "forecast-editor",
        Component: ForCast_Editor,
      },
      {
        path: "view",
        Component: ForCast_View,
      },
    ],
  },

  {
    path: "consumption-viewer",
    Component: Forcast_Main,
    handle: {
      viewerType: "consumption",
      title: "Consumption",
      description: "Manage and monitor consumption",
      apiEndpoint: "/project-consumption",
      idLabel: "Consumption Id",
      createLabel: "Create Consumption",
      editorTitle: "Consumption Editor",
      editTitle: "Edit Consumption",
      monthLabel: "Consumption Month",
      quantityLabel: "Consumption Quantity",
      updateLabel: "Update Consumption",
      searchPlaceholder:
        "Search by Consumption ID, Customer, Project, or BOM...",
    },
    children: [
      {
        index: true,
        Component: ForCast_Table,
      },
      {
        path: "consumption-editor",
        Component: ForCast_Editor,
      },
      {
        path: "view",
        Component: ForCast_View,
      },
    ],
  },

  {
    path: "forecast-accuracy-report",
    Component: SmartBin_Main,
    handle: {
      viewerType: "forecastAccuracy",
      title: "Forecast Accuracy",
      description: "Forecast vs Consumption Accuracy",
      apiEndpoint: "/forecast/dashboard",
    },
    children: [
      {
        index: true,
        Component: SmartBin_Dashboard,
      },
    ],
  },
];

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
