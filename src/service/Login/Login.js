import axios from "axios";

const Base_Url = import.meta.env.VITE_API_URL;

// 1️ Create axios instance
const api = axios.create({
  baseURL: Base_Url,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// 2️ Request Interceptor (Attach Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 3️ Response Interceptor (API Errors Only — No Redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: null,
      });
    }

    const { status, data } = error.response;

    // Optional: Handle 401 globally (without redirect)
    if (status === 401) {
      localStorage.removeItem("accessToken");
    }

    return Promise.reject({
      message: data?.message || "Something went wrong",
      status: status,
      data: data,
    });
  }
);



// --------------------
//  API EXPORTS
// --------------------

export const loginAPI = (payload) => {
  return api.post("/User/login", payload);
};

export const loginMeAPI = () => {
  return api.get("/customer-master/me/");
};

export const user_verify = (data) => {
  return api.post("/User/verify-otp/", data);
};

export const FirstTime_PasswordChange = (data) => {
  return api.post("/User/change-password/", data);
};

export const Forgot_password = (data) => {
  return api.post("/User/forgot-password/", data);
};

export const Forgot_Change_Password = (data) => {
  return api.post("/User/reset-password/", data);
};

export default api;