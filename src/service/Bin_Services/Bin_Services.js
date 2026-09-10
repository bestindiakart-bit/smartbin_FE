import axios from "axios";

const Base_Url = import.meta.env.VITE_API_URL;

// 1. Create axios instance
const api = axios.create({
  baseURL: Base_Url,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// 2. Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("Network error or server unreachable");
      window.location.href = "/network-error";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);


/* =========================================================
   BIN DASHBOARD
========================================================= */

export const bin_dashboard_create = (data) => {
  return api.post("/bin/", data);
};


export const bin_dashboard_getById = (id) => {
  return api.get(`/bin/${id}`);
};


export const bin_dashboard_deleteById = (id) => {
  return api.delete(`/bin/${id}`);
};


export const bin_dashboard_Edit = (id, data) => {
  return api.put(`/bin/${id}`, data);
};


/* =========================================================
   CUSTOMER
========================================================= */

export const bin_customerName_get = () => {
  return api.get("/customer-master/");
};


/* =========================================================
   PROJECT
========================================================= */

export const bin_ProjectName_get = (customerId) => {
  return api.get(`/project/by-customer/${customerId}`);
};


/* =========================================================
   ITEM MASTER
========================================================= */

export const bin_item_master_get = () => {
  return api.get("/item-master/");
};


/* =========================================================
   BIN DASHBOARD GET
========================================================= */

export const bin_dashboard_get = (
  page = 1,
  limit = 10
) => {
  return api.get("/bin/", {
    params: {
      page,
      limit,
    },
  });
};


/* =========================================================
   CUSTOMER ID
========================================================= */

export const customer_id = () => {
  return api.get("/customer-master/get/all");
};


/* =========================================================
   WAREHOUSE BY CUSTOMER
========================================================= */

export const get_warehouse_byCustomer = (
  customerId
) => {
  return api.get(
    `/warehouse/customer/${customerId}`
  );
};


/* =========================================================
   ITEMS BY WAREHOUSE
========================================================= */

export const get_items_byWarehouse = (
  warehouseId
) => {
  return api.get(
    `/warehouse/${warehouseId}/items`
  );
};


/* =========================================================
   SMARTBIN DASHBOARD
========================================================= */

export const smartbinDashboard_getall = (
  page = 1,
  limit = 10
) => {
  return api.get(
    "/bin-dashboard/dashboard/",
    {
      params: {
        page,
        limit,
      },
    }
  );
};


export const smartbinDashboard_create = (
  payload
) => {
  return api.post(
    "/bin-dashboard/iot/update/",
    payload
  );
};


export const binDashboard_dynamicGet = (
  page = 1,
  limit = 10
) => {
  return api.get(
    "/bin-dashboard/iot/live-status/",
    {
      params: {
        page,
        limit,
      },
    }
  );
};


export const bindashboard_moreView = (
  customerMasterId,
  itemMasterId
) => {
  return api.get(
    `/warehouse/transation?itemMasterId=${itemMasterId}&customerId=${customerMasterId}`
  );
};