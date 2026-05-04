import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customer_id } from "../../service/Master_Services/Master_Services";
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
  }
);

// 3. Add a Response Interceptor (Handles Global Errors)
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
    const { status } = error.response;
    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Async thunk for fetching customers
export const fetchCustomerId = createAsyncThunk(
  "customer/fetchCustomerId",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customer_id();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// Async thunk for fetching Project by customer ID
export const fetchProjectApi = createAsyncThunk(
  "customer/fetchProjectApi",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${Base_Url}/project/by-customer/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// Async thunk for fetching BOMs by customer ID and project ID
export const fetchBomApi = createAsyncThunk(
  "customer/fetchBomApi",
  async ({ customerId, projectId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`${Base_Url}/bom/customer/${customerId}/project/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// Async thunk for fetching single BOM details by BOM ID
export const fetchSingleBomApi = createAsyncThunk(
  "customer/fetchSingleBomApi",
  async (bomId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${Base_Url}/bom/${bomId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// Async thunk for creating forecast
export const ForcastPost = createAsyncThunk(
  "forecast/ForcastPost",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(`${Base_Url}/forecast/`, payload);

      return {
        success: true,
        message: response.data?.message || "Forecast created successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      let errorMessage = "Something went wrong";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      return rejectWithValue({
        success: false,
        message: errorMessage,
        data: error.response?.data,
      });
    }
  }
);

//put methos for update forecast
export const ForcastUpdate = createAsyncThunk(
  "forecast/ForcastUpdate",
  async ({id,payload},{ rejectWithValue }) => {
    try {
      const response = await api.put(`${Base_Url}/forecast/${id}`, payload);

      return {
        success: true,
        message: response.data?.message || "Forecast updated successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      let errorMessage = "Something went wrong";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      return rejectWithValue({
        success: false,
        message: errorMessage,
        data: error.response?.data,
      });
    }
  }
);

// Async thunk for fetching forecasts
export const ForcastGet = createAsyncThunk(
  "forecast/ForcastGet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${Base_Url}/forecast/`);
      
      return {
        success: true,
        message: response.data?.message || "Forecast fetched successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      let errorMessage = "Something went wrong";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      return rejectWithValue({
        success: false,
        message: errorMessage,
        data: error.response?.data,
      });
    }
  }
);

// Async thunk for deleting forecast
export const ForcastDelete = createAsyncThunk(
  "forecast/ForcastDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`${Base_Url}/forecast/${id}`);
      
      return {
        success: true,
        message: response.data?.message || "Forecast deleted successfully",
        data: response.data?.data || response.data,
      };
    } catch (error) {
      let errorMessage = "Failed to delete forecast";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue({
        success: false,
        message: errorMessage,
        data: error.response?.data,
      });
    }
  }
);

// Initial state
const initialState = {
  forcastEdit: [],
  bomData: null,
  projectData: null,
  forecastGet: null,
  forecastDeleteResult: null,  
  forecastDeleteError: null,   
  forecastPostResult: null,
  forecastPostError: null,     
  singleBomData: null,
  loading: false,
  error: null,
  postLoading: false,
  deleteLoading: false,  
  forcastUpdate : null,
};

// Slice
const ForecastSlice = createSlice({
  name: "forcastEdit",
  initialState,
  reducers: {
    clearBomData: (state) => {
      state.bomData = null;
    },
    clearProjectData: (state) => {
      state.projectData = null;
    },
    clearSingleBomData: (state) => {
      state.singleBomData = null;
    },
    clearForecastPostResult: (state) => {
      state.forecastPostResult = null;
      state.forecastPostError = null;
    },
    clearForecastDeleteResult: (state) => {  // Added new reducer
      state.forecastDeleteResult = null;
      state.forecastDeleteError = null;
    },
    resetForecastForm: (state) => {
      state.forcastEdit = [];
      state.bomData = null;
      state.projectData = null;
      state.singleBomData = null;
      state.forecastPostResult = null;
      state.forecastPostError = null;
      state.forecastDeleteResult = null;
      state.forecastDeleteError = null;
      state.error = null;
      state.forecastGet = null;
      state,forcastUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Customer ID cases
      .addCase(fetchCustomerId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerId.fulfilled, (state, action) => {
        state.loading = false;
        state.forcastEdit = action.payload;
      })
      .addCase(fetchCustomerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Project API cases
      .addCase(fetchProjectApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectApi.fulfilled, (state, action) => {
        state.loading = false;
        state.projectData = action.payload;
      })
      .addCase(fetchProjectApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // BOM API cases
      .addCase(fetchBomApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBomApi.fulfilled, (state, action) => {
        state.loading = false;
        state.bomData = action.payload;
      })
      .addCase(fetchBomApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single BOM API cases
      .addCase(fetchSingleBomApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleBomApi.fulfilled, (state, action) => {
        state.loading = false;
        state.singleBomData = action.payload;
      })
      .addCase(fetchSingleBomApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forecast Post API cases
      .addCase(ForcastPost.pending, (state) => {
        state.postLoading = true;
        state.forecastPostError = null;
        state.forecastPostResult = null;
      })
      .addCase(ForcastPost.fulfilled, (state, action) => {
        state.postLoading = false;
        state.forecastPostResult = action.payload;
      })
      .addCase(ForcastPost.rejected, (state, action) => {
        state.postLoading = false;
        state.forecastPostError = action.payload;
      })
      
      // Forecast Get API cases
      .addCase(ForcastGet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ForcastGet.fulfilled, (state, action) => {
        state.loading = false;
        state.forecastGet = action.payload;
      })
      .addCase(ForcastGet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forecast Delete API cases
      .addCase(ForcastDelete.pending, (state) => {
        state.deleteLoading = true;
        state.forecastDeleteError = null;
        state.forecastDeleteResult = null;
      })
      .addCase(ForcastDelete.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.forecastDeleteResult = action.payload;
      })
      .addCase(ForcastDelete.rejected, (state, action) => {
        state.deleteLoading = false;
        state.forecastDeleteError = action.payload;
      })

      // Forecast Update API cases
      .addCase(ForcastUpdate.pending, (state) => {
        state.updateLoading = true;
        state.forecastUpdateError = null;
        state.forcastUpdate = null;
      })
      .addCase(ForcastUpdate.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.forcastUpdate = action.payload;
      })
      .addCase(ForcastUpdate.rejected, (state, action) => {
        state.updateLoading = false;
        state.forecastUpdateError = action.payload;
      });
  }
});

// Export actions and reducer
export const { 
  clearBomData, 
  clearProjectData, 
  clearSingleBomData, 
  clearForecastPostResult,
  clearForecastDeleteResult,
  resetForecastForm 
} = ForecastSlice.actions;

export default ForecastSlice.reducer;