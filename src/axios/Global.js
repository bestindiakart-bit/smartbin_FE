import axios from "./AxiosInstance";
import axiosLib from "axios";
import { APIURLS } from "./Config";

export const getApiMethod = async ({ queryKey, signal }) => {
  const [, apiConstant, query_string] = queryKey;
  const api = `${APIURLS.baseUrl}${apiConstant}${query_string || ""}`;
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const config = { signal, headers: { Authorization: token } };
  const response = await axios.get(api, config);

  return response.data;
};

export const getPublicApiMethod = async ({ queryKey, signal }) => {
  const [, apiConstant, query_string] = queryKey;
  const api = `${APIURLS.baseUrl}${apiConstant}${query_string || ""}`;
  const response = await axios.get(api, { signal });

  return response.data;
};

export const fetchApi = async (apiConstant, query_string = "") => {
  const api = `${APIURLS.baseUrl}${apiConstant}${query_string}`;
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const config = { headers: { Authorization: token } };
  const response = await axios.get(api, config);

  return response.data;
};

export const postApiMethod = async (apiUrl, body) => {
  const url = `${APIURLS.baseUrl}${apiUrl}`;

  try {
    const response = await axios.post(url, body);
    return response.data;
  } catch (error) {
    console.error("POST error:", error);
    throw error;
  }
};

export const putApiMethod = async (apiUrl, body) => {
  const url = `${APIURLS.baseUrl}${apiUrl}`;

  try {
    const response = await axios.put(url, body);
    return response.data;
  } catch (error) {
    console.error("PUT error:", error);
    throw error;
  }
};

export const patchApiMethod = async (apiUrl, body) => {
  const url = `${APIURLS.baseUrl}${apiUrl}`;

  try {
    const response = await axios.patch(url, body);
    return response.data;
  } catch (error) {
    console.error("PATCH error:", error);
    throw error;
  }
};

export const apiMethod = async (method, apiUrl, body) => {
  try {
    const response = await axios({
      method,
      url: `${APIURLS.baseUrl}${apiUrl}`,
      data: body,
    });

    return response.data;
  } catch (error) {
    console.error(`${method.toUpperCase()} error at ${apiUrl}:`, error);
    throw error;
  }
};

export const postVideoMethod = async (
  apiUrl,
  file,
  onUploadProgress,
  controller,
) => {
  const url = `${APIURLS.baseUrl}${apiUrl}`;
  const formData = new FormData();
  const param = new URL(url).searchParams.get("type");
  const fieldName =
    param === "course-attachments" ? "attachment" : "lectureFiles";

  formData.append(fieldName, file);

  try {
    const config = {
      signal: controller?.signal,
      onUploadProgress: (event) => {
        if (event.total) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onUploadProgress?.(progress);
        }
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(url, formData, config);
    return response.data;
  } catch (error) {
    if (axiosLib.isCancel?.(error)) {
      console.warn("Upload canceled by user");
    } else {
      console.error("Video upload failed:", error);
    }
    throw error;
  }
};