const BASE_URL = process.env.REACT_APP_BASE_URL;

export const APIURLS = {
    baseUrl: BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/",
    imageUrl: BASE_URL,
};

export const API_CONFIG = {
    name: "",
    appMode: process.env.REACT_APP_MODE,
}

export const API_ENDPOINTS = {
    GET_USERS: "users",
}

