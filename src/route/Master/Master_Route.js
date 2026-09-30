import CreateSetting from "../../pages/SubComponents/CreateSetting/CreateSetting";
import CreateSettingMain from "../../pages/SubComponents/CreateSetting/CreateSettingMain";
import IotCreate from "../../pages/SubComponents/CreateSetting/IotCreate";
import Customer_Master from "../../pages/SubComponents/Master/Customer_Master/Customer_Master";
import Customer_Master_Create from "../../pages/SubComponents/Master/Customer_Master/Customer_Master_Create";
import Main_Customer from "../../pages/SubComponents/Master/Customer_Master/Main_Customer";
import View_Page from "../../pages/SubComponents/Master/Customer_Master/View_Page";
import Item_Create from "../../pages/SubComponents/Master/Item_Master/Item_Create";
import Item_Master from "../../pages/SubComponents/Master/Item_Master/Item_Master";
import Item_Master_Main from "../../pages/SubComponents/Master/Item_Master/Item_Master_Main";
import Item_View_Page from "../../pages/SubComponents/Master/Item_Master/Item_View_Page";
import Project_Master from "../../pages/SubComponents/Master/Project_Master/Project_Master";
import Project_Master_Create from "../../pages/SubComponents/Master/Project_Master/Project_Master_Create";
import Project_Master_Main from "../../pages/SubComponents/Master/Project_Master/Project_Master_Main";
import User_Master from "../../pages/SubComponents/Master/User_Master/User_Master";
import User_Master_Main from "../../pages/SubComponents/Master/User_Master/User_Master_Main";
import UserMaster_Create from "../../pages/SubComponents/Master/User_Master/UserMaster_Create";
import UserMaster_View from "../../pages/SubComponents/Master/User_Master/UserMaster_View";
import User_Create from "../../pages/SubComponents/Master/User_Permission_Master/User_Create";
import User_Permission_Main from "../../pages/SubComponents/Master/User_Permission_Master/User_Permission_Main";
import User_Permission_Master from "../../pages/SubComponents/Master/User_Permission_Master/User_Permission_Master";
import User_ViewPage from "../../pages/SubComponents/Master/User_Permission_Master/User_ViewPage";

export const Master_Route = [
  {
    path: "customer-master",
    Component: Main_Customer,
    children: [
      {
        index: true,
        Component: Customer_Master,
      },
      {
        path: "create-customer",
        Component: Customer_Master_Create,
      },
      {
        path: "customer-view",
        Component: View_Page,
      },
    ],
  },
  {
    path: "user-master",
    Component: User_Master_Main,
    children: [
      {
        index: true,
        Component: User_Master,
      },
      {
        path: "user-create",
        Component: UserMaster_Create,
      },
      {
        path: "user-view",
        Component: UserMaster_View,
      },
    ],
  },
  {
    path: "user-permission-master",
    Component: User_Permission_Main,
    children: [
      {
        index: true,
        Component: User_Permission_Master,
      },
      {
        path: "user-view",
        Component: User_ViewPage,
      },
      {
        path: "user-create",
        Component: User_Create,
      },
    ],
  },

  {
    path: "project-master",
    Component: Project_Master_Main,
    children: [
      {
        index: true,
        Component: Project_Master,
      },
      {
        path: "project-create",
        Component: Project_Master_Create,
      },
    ],
  },
  {
    path: "item-master",
    Component: Item_Master_Main,
    children: [
      {
        index: true,
        Component: Item_Master,
      },
      {
        path: "item-view",
        Component: Item_View_Page,
      },
      {
        path: "item-create",
        Component: Item_Create,
      },
    ],
  },
  {
    path: "create-setting",
    Component: CreateSettingMain,
    children: [
      {
        index: true,
        Component: CreateSetting,
      },
      {
        path: "iot-create",
        Component: IotCreate,
      },
    ],
  },
];
