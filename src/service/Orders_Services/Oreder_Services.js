import axios from "axios";

const Base_Url = import.meta.env.VITE_API_URL;

// 1. Create axios instance
const api = axios.create({
  baseURL: Base_Url,
  headers: {
    "Content-Type": "application/json",
    // CRITICAL: This bypasses the ngrok landing page warning (ERR_NGROK_6024)
    "ngrok-skip-browser-warning": "true",
  },
});

// 2. Add a Request Interceptor
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
  },
);

// 3. Add a Response Interceptor (Handles Global Errors)
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Case 1: Network Error / Server is Down (No response object)
    // if (!error.response) {
    //   console.error("Network error or server unreachable");
    //   window.location.href = "/network-error";
    //   return Promise.reject(error);
    // }

    const { status } = error.response;

    // Case 2: Unauthorized (Token expired or invalid)
    if (status === 401) {
      localStorage.clear(); // Clear all data (token, user info)
      window.location.href = "/login";
    }

    // Case 3: Internal Server Error
    // else if (status === 500) {
    //   window.location.href = "/500";
    // }

    // Case 4: Forbidden or Page Not Found (Optional)
    // else if (status === 404) {
    // You can choose to redirect to 404 here or handle it in the component
    // window.location.href = "/404";
    // }

    return Promise.reject(error);
  },
);

export const smart_dashboard_create = (data) => {
  return api.post("/warehouse/", data);
};

export const warehouse_create_edit = (id, data) => {
  return api.put(`/warehouse/${id}`, data);
};
export const smart_dashboard_createId = (id, data) => {
  return api.put(`/warehouse/${id}`, data);
};

export const customer_Name = () => {
  return api.get("/customer-master/");
};

export const Item_Name = () => {
  return api.get("/item-master/");
};

export const warehouse_get = (page = 1, limit = 10) => {
  return api.get("/warehouse", {
    params: { page, limit },
  });
};

export const warehouse_getId = (id) => {
  return api.get(`/warehouse/${id}`);
};

export const warehouse_delete = (id) => {
  // Assuming 0 or 'deleted' is your soft-delete status based on your backend logic
  return api.put(`/warehouse/${id}`, { status: 0 });
};

//////////////////////////////////////////////////////////////////////// oreder Processing////////////////////////////////////////////////////////////////////

export const order_processing_allGet = (page = 1, limit = 10) => {
  return api.get("/order/", {
    params: { page, limit },
  });
};

export const calculateWarehouseStockLevels = (data) => {
  return api.post("/warehouse/calculate-stock-levels", data);
};

////////////////////////////////////////////////////////////////////Bin of Metarials ///////////////////////////////////////////////////////////////////////////

export const getAPI = (endpoint, params = { page: 1, limit: 10 }) => {
  return api.get(endpoint, { params });
};

export const getAPIID = (endpoint, id) => {
  return api.get(`${endpoint}/${id}`);
};

export const postAPI = (endpoint, data) => {
  return api.post(endpoint, data);
};

export const putAPI = (endpoint, data) => {
  return api.put(endpoint, data);
};
export const deleteAPI = (endpoint, id) => {
  return api.delete(endpoint, id);
};
