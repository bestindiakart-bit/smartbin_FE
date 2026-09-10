import axios from "axios";
import APIURLS from "./Config";

const axios_instance = axios.create({
    baseURL: APIURLS.baseURL,
})

axios_instance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers["ngrok-skip-browser-warning"] = "true";

    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
})

axios_instance.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Token expired or unauthorized")

            localStorage.removeItem("token");

            window.location.href = "/";
        }
        return Promise.reject(error);
    }
)

export default axios_instance;