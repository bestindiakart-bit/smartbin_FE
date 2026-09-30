import Bill_Create from "../../pages/SubComponents/Orders/Bill_Of_Matarials/Bill_Create";
import Bill_Metarial_Main from "../../pages/SubComponents/Orders/Bill_Of_Matarials/Bill_Metarial_Main";
import Bill_Of_Metarials from "../../pages/SubComponents/Orders/Bill_Of_Matarials/Bill_Of_Metarials";
import Bill_View_page from "../../pages/SubComponents/Orders/Bill_Of_Matarials/Bill_View_page";
import Order_Processing from "../../pages/SubComponents/Orders/Order_Processing/Order_Processing";
import Order_Processing_Create from "../../pages/SubComponents/Orders/Order_Processing/Order_Processing_Create";
import Order_Processing_Main from "../../pages/SubComponents/Orders/Order_Processing/Order_Processing_Main";
import Order_Processing_View from "../../pages/SubComponents/Orders/Order_Processing/Order_Processing_View";
import Warehouse_Create from "../../pages/SubComponents/Orders/WaterHouse_Orders/Warehouse_Create";
import WareHouse_Main from "../../pages/SubComponents/Orders/WaterHouse_Orders/WareHouse_Main";
import WareHouse_Orders from "../../pages/SubComponents/Orders/WaterHouse_Orders/WareHouse_Orders";

export const Orders_Route = [
  {
    path: "warehouse-orders",
    Component: WareHouse_Main,
    children: [
      {
        index: true,
        Component: WareHouse_Orders,
      },
      {
        path: "warehouse-create",
        Component: Warehouse_Create,
      },
    ],
  },
  {
    path: "order-processing",
    Component: Order_Processing_Main,
    children: [
      {
        index: true,
        Component: Order_Processing,
      },
      {
        path: "order-prcessing-create",
        Component: Order_Processing_Create,
      },
      {
        path: "order-Processing-view",
        Component: Order_Processing_View,
      },
    ],
  },
  {
    path: "bill-of-materials",
    Component: Bill_Metarial_Main,
    children: [
      {
        index: true,
        Component: Bill_Of_Metarials,
      },
      {
        path: "bill-create",
        Component: Bill_Create,
      },
      {
        path: "bill-view",
        Component: Bill_View_page,
      },
    ],
  },
];
