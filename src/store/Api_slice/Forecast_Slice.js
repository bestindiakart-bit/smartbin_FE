// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { customer_id } from "../../service/Master_Services/Master_Services";
// import axios from "axios";

// const Base_Url = import.meta.env.VITE_API_URL;

// // 1. Create axios instance
// const api = axios.create({
//   baseURL: Base_Url,
//   headers: {
//     "Content-Type": "application/json",
//     "ngrok-skip-browser-warning": "true",
//   },
// });

// // 2. Add a Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // 3. Add a Response Interceptor (Handles Global Errors)
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (!error.response) {
//       console.error("Network error or server unreachable");
//       window.location.href = "/network-error";
//       return Promise.reject(error);
//     }
//     const { status } = error.response;
//     if (status === 401) {
//       localStorage.clear();
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// // Async thunk for fetching customers
// export const fetchCustomerId = createAsyncThunk(
//   "customer/fetchCustomerId",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await customer_id();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Something went wrong"
//       );
//     }
//   }
// );

// // Async thunk for fetching Project by customer ID
// export const fetchProjectApi = createAsyncThunk(
//   "customer/fetchProjectApi",
//   async (customerId, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`${Base_Url}/project/by-customer/${customerId}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Something went wrong"
//       );
//     }
//   }
// );

// // Async thunk for fetching BOMs by customer ID and project ID
// export const fetchBomApi = createAsyncThunk(
//   "customer/fetchBomApi",
//   async ({ customerId, projectId }, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`${Base_Url}/bom/customer/${customerId}/project/${projectId}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Something went wrong"
//       );
//     }
//   }
// );

// // Async thunk for fetching single BOM details by BOM ID
// export const fetchSingleBomApi = createAsyncThunk(
//   "customer/fetchSingleBomApi",
//   async (bomId, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`${Base_Url}/bom/${bomId}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Something went wrong"
//       );
//     }
//   }
// );

// // Async thunk for creating forecast
// export const ForcastPost = createAsyncThunk(
//   "forecast/ForcastPost",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const response = await api.post(`${Base_Url}/forecast/`, payload);

//       return {
//         success: true,
//         message: response.data?.message || "Forecast created successfully",
//         data: response.data?.data || response.data,
//       };
//     } catch (error) {
//       let errorMessage = "Something went wrong";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (typeof error.response?.data === 'string') {
//         errorMessage = error.response.data;
//       }

//       return rejectWithValue({
//         success: false,
//         message: errorMessage,
//         data: error.response?.data,
//       });
//     }
//   }
// );

// //put methos for update forecast
// export const ForcastUpdate = createAsyncThunk(
//   "forecast/ForcastUpdate",
//   async ({id,payload},{ rejectWithValue }) => {
//     try {
//       const response = await api.put(`${Base_Url}/forecast/${id}`, payload);

//       return {
//         success: true,
//         message: response.data?.message || "Forecast updated successfully",
//         data: response.data?.data || response.data,
//       };
//     } catch (error) {
//       let errorMessage = "Something went wrong";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (typeof error.response?.data === 'string') {
//         errorMessage = error.response.data;
//       }

//       return rejectWithValue({
//         success: false,
//         message: errorMessage,
//         data: error.response?.data,
//       });
//     }
//   }
// );

// // Async thunk for fetching forecasts
// export const ForcastGet = createAsyncThunk(
//   "forecast/ForcastGet",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get(`${Base_Url}/forecast/`);

//       return {
//         success: true,
//         message: response.data?.message || "Forecast fetched successfully",
//         data: response.data?.data || response.data,
//       };
//     } catch (error) {
//       let errorMessage = "Something went wrong";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (typeof error.response?.data === 'string') {
//         errorMessage = error.response.data;
//       }

//       return rejectWithValue({
//         success: false,
//         message: errorMessage,
//         data: error.response?.data,
//       });
//     }
//   }
// );

// // Async thunk for deleting forecast
// export const ForcastDelete = createAsyncThunk(
//   "forecast/ForcastDelete",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await api.delete(`${Base_Url}/forecast/${id}`);

//       return {
//         success: true,
//         message: response.data?.message || "Forecast deleted successfully",
//         data: response.data?.data || response.data,
//       };
//     } catch (error) {
//       let errorMessage = "Failed to delete forecast";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (typeof error.response?.data === 'string') {
//         errorMessage = error.response.data;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       return rejectWithValue({
//         success: false,
//         message: errorMessage,
//         data: error.response?.data,
//       });
//     }
//   }
// );

// // Initial state
// const initialState = {
//   forcastEdit: [],
//   bomData: null,
//   projectData: null,
//   forecastGet: null,
//   forecastDeleteResult: null,  
//   forecastDeleteError: null,   
//   forecastPostResult: null,
//   forecastPostError: null,     
//   singleBomData: null,
//   loading: false,
//   error: null,
//   postLoading: false,
//   deleteLoading: false,  
//   forcastUpdate : null,
// };

// // Slice
// const ForecastSlice = createSlice({
//   name: "forcastEdit",
//   initialState,
//   reducers: {
//     clearBomData: (state) => {
//       state.bomData = null;
//     },
//     clearProjectData: (state) => {
//       state.projectData = null;
//     },
//     clearSingleBomData: (state) => {
//       state.singleBomData = null;
//     },
//     clearForecastPostResult: (state) => {
//       state.forecastPostResult = null;
//       state.forecastPostError = null;
//     },
//     clearForecastDeleteResult: (state) => {  // Added new reducer
//       state.forecastDeleteResult = null;
//       state.forecastDeleteError = null;
//     },
//     resetForecastForm: (state) => {
//       state.forcastEdit = [];
//       state.bomData = null;
//       state.projectData = null;
//       state.singleBomData = null;
//       state.forecastPostResult = null;
//       state.forecastPostError = null;
//       state.forecastDeleteResult = null;
//       state.forecastDeleteError = null;
//       state.error = null;
//       state.forecastGet = null;
//       state,forcastUpdate = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Customer ID cases
//       .addCase(fetchCustomerId.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCustomerId.fulfilled, (state, action) => {
//         state.loading = false;
//         state.forcastEdit = action.payload;
//       })
//       .addCase(fetchCustomerId.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Project API cases
//       .addCase(fetchProjectApi.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProjectApi.fulfilled, (state, action) => {
//         state.loading = false;
//         state.projectData = action.payload;
//       })
//       .addCase(fetchProjectApi.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // BOM API cases
//       .addCase(fetchBomApi.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchBomApi.fulfilled, (state, action) => {
//         state.loading = false;
//         state.bomData = action.payload;
//       })
//       .addCase(fetchBomApi.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Single BOM API cases
//       .addCase(fetchSingleBomApi.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchSingleBomApi.fulfilled, (state, action) => {
//         state.loading = false;
//         state.singleBomData = action.payload;
//       })
//       .addCase(fetchSingleBomApi.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Forecast Post API cases
//       .addCase(ForcastPost.pending, (state) => {
//         state.postLoading = true;
//         state.forecastPostError = null;
//         state.forecastPostResult = null;
//       })
//       .addCase(ForcastPost.fulfilled, (state, action) => {
//         state.postLoading = false;
//         state.forecastPostResult = action.payload;
//       })
//       .addCase(ForcastPost.rejected, (state, action) => {
//         state.postLoading = false;
//         state.forecastPostError = action.payload;
//       })

//       // Forecast Get API cases
//       .addCase(ForcastGet.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(ForcastGet.fulfilled, (state, action) => {
//         state.loading = false;
//         state.forecastGet = action.payload;
//       })
//       .addCase(ForcastGet.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Forecast Delete API cases
//       .addCase(ForcastDelete.pending, (state) => {
//         state.deleteLoading = true;
//         state.forecastDeleteError = null;
//         state.forecastDeleteResult = null;
//       })
//       .addCase(ForcastDelete.fulfilled, (state, action) => {
//         state.deleteLoading = false;
//         state.forecastDeleteResult = action.payload;
//       })
//       .addCase(ForcastDelete.rejected, (state, action) => {
//         state.deleteLoading = false;
//         state.forecastDeleteError = action.payload;
//       })

//       // Forecast Update API cases
//       .addCase(ForcastUpdate.pending, (state) => {
//         state.updateLoading = true;
//         state.forecastUpdateError = null;
//         state.forcastUpdate = null;
//       })
//       .addCase(ForcastUpdate.fulfilled, (state, action) => {
//         state.updateLoading = false;
//         state.forcastUpdate = action.payload;
//       })
//       .addCase(ForcastUpdate.rejected, (state, action) => {
//         state.updateLoading = false;
//         state.forecastUpdateError = action.payload;
//       });
//   }
// });

// // Export actions and reducer
// export const { 
//   clearBomData, 
//   clearProjectData, 
//   clearSingleBomData, 
//   clearForecastPostResult,
//   clearForecastDeleteResult,
//   resetForecastForm 
// } = ForecastSlice.actions;

// export default ForecastSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customer_id } from "../../service/Master_Services/Master_Services";
import axios from "axios";

const Base_Url = import.meta.env.VITE_API_URL;

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
    baseURL: Base_Url,

    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

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

        /*
         * Only redirect to login when the authentication token
         * is actually missing.
         *
         * This prevents a normal API authorization/permission
         * response from unnecessarily destroying the session.
         */

        if (status === 401) {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                localStorage.clear();
                window.location.href = "/login";
            }

            console.error(
                "Unauthorized API request:",
                error.config?.url
            );
        }

        return Promise.reject(error);
    }
);

/*
|--------------------------------------------------------------------------
| Common Error Helper
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
    error,
    defaultMessage = "Something went wrong"
) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.error) {
        return error.response.data.error;
    }

    if (typeof error.response?.data === "string") {
        return error.response.data;
    }

    if (error.message) {
        return error.message;
    }

    return defaultMessage;
};

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

// export const fetchCustomerId = createAsyncThunk(
//     "customer/fetchCustomerId",

//     async (_, { rejectWithValue }) => {
//         try {
//             const response = await customer_id();

//             return response.data;
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data || "Something went wrong"
//             );
//         }
//     }
// );

export const fetchCustomerId = createAsyncThunk(
  "customer/fetchCustomerId",

  async (isConsumption = false, { rejectWithValue }) => {
    try {
      const response = await customer_id(isConsumption);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Project By Customer
|--------------------------------------------------------------------------
*/

export const fetchProjectApi = createAsyncThunk(
    "customer/fetchProjectApi",

    async (customerId, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/project/by-customer/${customerId}`
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

/*
|--------------------------------------------------------------------------
| BOM By Customer + Project
|--------------------------------------------------------------------------
*/

export const fetchBomApi = createAsyncThunk(
    "customer/fetchBomApi",

    async (
        { customerId, projectId },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.get(
                `/bom/customer/${customerId}/project/${projectId}`
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

/*
|--------------------------------------------------------------------------
| Single BOM
|--------------------------------------------------------------------------
*/

export const fetchSingleBomApi = createAsyncThunk(
    "customer/fetchSingleBomApi",

    async (bomId, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/bom/${bomId}`
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

/*
|--------------------------------------------------------------------------
| FORECAST
|--------------------------------------------------------------------------
*/

/*
 * Create Forecast
 */
export const ForcastPost = createAsyncThunk(
    "forecast/ForcastPost",

    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post(
                "/forecast",
                payload
            );

            return {
                success: true,
                message:
                    response.data?.message ||
                    "Forecast created successfully",

                data:
                    response.data?.data ||
                    response.data,
            };
        } catch (error) {
            return rejectWithValue({
                success: false,

                message: getErrorMessage(
                    error,
                    "Failed to create forecast"
                ),

                data: error.response?.data,
            });
        }
    }
);

/*
 * Update Forecast
 */
export const ForcastUpdate = createAsyncThunk(
    "forecast/ForcastUpdate",

    async (
        { id, payload },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.put(
                `/forecast/${id}`,
                payload
            );

            return {
                success: true,

                message:
                    response.data?.message ||
                    "Forecast updated successfully",

                data:
                    response.data?.data ||
                    response.data,
            };
        } catch (error) {
            return rejectWithValue({
                success: false,

                message: getErrorMessage(
                    error,
                    "Failed to update forecast"
                ),

                data: error.response?.data,
            });
        }
    }
);

/*
 * Get Forecast
 */
export const ForcastGet = createAsyncThunk(
    "forecast/ForcastGet",

    async (
        { endpoint = "/forecast" } = {},
        { rejectWithValue }
    ) => {
        try {
            /*
             * IMPORTANT:
             * api already contains baseURL.
             */

            const response = await api.get(
                endpoint
            );

            return {
                success: true,

                message:
                    response.data?.message ||
                    "Forecast fetched successfully",

                data:
                    response.data?.data ||
                    response.data,
            };
        } catch (error) {
            return rejectWithValue({
                success: false,

                message: getErrorMessage(
                    error,
                    "Failed to fetch data"
                ),

                data: error.response?.data,
            });
        }
    }
);

/*
 * Delete Forecast
 */
export const ForcastDelete = createAsyncThunk(
    "forecast/ForcastDelete",

    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/forecast/${id}`
            );

            return {
                success: true,

                message:
                    response.data?.message ||
                    "Forecast deleted successfully",

                data:
                    response.data?.data ||
                    response.data,
            };
        } catch (error) {
            return rejectWithValue({
                success: false,

                message: getErrorMessage(
                    error,
                    "Failed to delete forecast"
                ),

                data: error.response?.data,
            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| PROJECT CONSUMPTION
|--------------------------------------------------------------------------
*/

/*
 * Get All Consumption
 *
 * GET
 * /project-consumption
 */
export const ProjectConsumptionGet = createAsyncThunk(
    "projectConsumption/get",

    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(
                "/project-consumption"
            );

            return {
                success: true,

                message:
                    response.data?.message ||
                    "Project consumption fetched successfully",

                data:
                    response.data?.data ||
                    response.data,
            };
        } catch (error) {
            return rejectWithValue({
                success: false,

                message: getErrorMessage(
                    error,
                    "Failed to fetch project consumption"
                ),

                data: error.response?.data,
            });
        }
    }
);

/*
 * Create Consumption
 *
 * POST
 * /project-consumption
 */
export const ProjectConsumptionPost = createAsyncThunk(
    "projectConsumption/post",

    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post(
                "/project-consumption",
                payload
            );

            return {
                success: true,

                message:
                    response.data?.message ||
                    "Project consumption created successfully",

                data:
                    response.data?.data ||
                    response.data,
            };
        } catch (error) {
            return rejectWithValue({
                success: false,

                message: getErrorMessage(
                    error,
                    "Failed to create project consumption"
                ),

                data: error.response?.data,
            });
        }
    }
);

/*
 * Get Consumption By ID
 *
 * GET
 * /project-consumption/{id}
 */
export const ProjectConsumptionGetById =
    createAsyncThunk(
        "projectConsumption/getById",

        async (id, { rejectWithValue }) => {
            try {
                const response = await api.get(
                    `/project-consumption/${id}`
                );

                return {
                    success: true,

                    message:
                        response.data?.message ||
                        "Project consumption fetched successfully",

                    data:
                        response.data?.data ||
                        response.data,
                };
            } catch (error) {
                return rejectWithValue({
                    success: false,

                    message: getErrorMessage(
                        error,
                        "Failed to fetch project consumption"
                    ),

                    data: error.response?.data,
                });
            }
        }
    );

/*
 * Delete Consumption
 *
 * DELETE
 * /project-consumption/{id}
 */
export const ProjectConsumptionDelete =
    createAsyncThunk(
        "projectConsumption/delete",

        async (id, { rejectWithValue }) => {
            try {
                const response = await api.delete(
                    `/project-consumption/${id}`
                );

                return {
                    success: true,

                    message:
                        response.data?.message ||
                        "Project consumption deleted successfully",

                    data:
                        response.data?.data ||
                        response.data,
                };
            } catch (error) {
                return rejectWithValue({
                    success: false,

                    message: getErrorMessage(
                        error,
                        "Failed to delete project consumption"
                    ),

                    data: error.response?.data,
                });
            }
        }
    );

/*
 * Update Consumption Entry
 *
 * PUT
 * /project-consumption/{id}/entry
 */
export const ProjectConsumptionEntryUpdate =
    createAsyncThunk(
        "projectConsumption/updateEntry",

        async (
            { id, payload },
            { rejectWithValue }
        ) => {
            try {
                const response = await api.put(
                    `/project-consumption/${id}/entry`,
                    payload
                );

                return {
                    success: true,

                    message:
                        response.data?.message ||
                        "Consumption entry updated successfully",

                    data:
                        response.data?.data ||
                        response.data,
                };
            } catch (error) {
                return rejectWithValue({
                    success: false,

                    message: getErrorMessage(
                        error,
                        "Failed to update consumption entry"
                    ),

                    data: error.response?.data,
                });
            }
        }
    );

/*
 * Delete Consumption Item
 *
 * DELETE
 * /project-consumption/{id}/month/{month}/item/{itemId}
 */
export const ProjectConsumptionItemDelete =
    createAsyncThunk(
        "projectConsumption/deleteItem",

        async (
            { id, month, itemId },
            { rejectWithValue }
        ) => {
            try {
                const response = await api.delete(
                    `/project-consumption/${id}/month/${month}/item/${itemId}`
                );

                return {
                    success: true,

                    message:
                        response.data?.message ||
                        "Item consumption entry deleted successfully",

                    data:
                        response.data?.data ||
                        response.data,
                };
            } catch (error) {
                return rejectWithValue({
                    success: false,

                    message: getErrorMessage(
                        error,
                        "Failed to delete item consumption entry"
                    ),

                    data: error.response?.data,
                });
            }
        }
    );

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
    /*
     * Common data
     */
    forcastEdit: [],
    bomData: null,
    projectData: null,
    singleBomData: null,

    /*
     * Forecast
     */
    forecastGet: null,
    forecastDeleteResult: null,
    forecastDeleteError: null,

    forecastPostResult: null,
    forecastPostError: null,

    forcastUpdate: null,
    forecastUpdateError: null,

    /*
     * Consumption
     */
    projectConsumption: null,
    projectConsumptionGetById: null,

    projectConsumptionPostResult: null,
    projectConsumptionPostError: null,

    projectConsumptionDeleteResult: null,
    projectConsumptionDeleteError: null,

    projectConsumptionEntryResult: null,
    projectConsumptionEntryError: null,

    projectConsumptionItemDeleteResult: null,
    projectConsumptionItemDeleteError: null,

    /*
     * Loading
     */
    loading: false,

    postLoading: false,
    deleteLoading: false,
    updateLoading: false,

    projectConsumptionLoading: false,
    projectConsumptionPostLoading: false,
    projectConsumptionDeleteLoading: false,
    projectConsumptionEntryLoading: false,
    projectConsumptionItemDeleteLoading: false,

    /*
     * Error
     */
    error: null,
};

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const ForecastSlice = createSlice({
    name: "forcastEdit",

    initialState,

    reducers: {
        /*
         * BOM
         */
        clearBomData: (state) => {
            state.bomData = null;
        },

        clearProjectData: (state) => {
            state.projectData = null;
        },

        clearSingleBomData: (state) => {
            state.singleBomData = null;
        },

        /*
         * Forecast Post
         */
        clearForecastPostResult: (state) => {
            state.forecastPostResult = null;
            state.forecastPostError = null;
        },

        /*
         * Forecast Delete
         */
        clearForecastDeleteResult: (state) => {
            state.forecastDeleteResult = null;
            state.forecastDeleteError = null;
        },

        /*
         * Consumption Post
         */
        clearProjectConsumptionPostResult: (state) => {
            state.projectConsumptionPostResult = null;
            state.projectConsumptionPostError = null;
        },

        /*
         * Consumption Delete
         */
        clearProjectConsumptionDeleteResult: (state) => {
            state.projectConsumptionDeleteResult = null;
            state.projectConsumptionDeleteError = null;
        },

        /*
         * Consumption Entry
         */
        clearProjectConsumptionEntryResult: (state) => {
            state.projectConsumptionEntryResult = null;
            state.projectConsumptionEntryError = null;
        },

        /*
         * Consumption Item Delete
         */
        clearProjectConsumptionItemDeleteResult: (state) => {
            state.projectConsumptionItemDeleteResult = null;
            state.projectConsumptionItemDeleteError = null;
        },

        /*
         * Reset
         */
        resetForecastForm: (state) => {
            state.forcastEdit = [];

            state.bomData = null;
            state.projectData = null;
            state.singleBomData = null;

            state.forecastGet = null;

            state.forecastPostResult = null;
            state.forecastPostError = null;

            state.forecastDeleteResult = null;
            state.forecastDeleteError = null;

            state.forcastUpdate = null;
            state.forecastUpdateError = null;

            state.projectConsumption = null;
            state.projectConsumptionGetById = null;

            state.projectConsumptionPostResult = null;
            state.projectConsumptionPostError = null;

            state.projectConsumptionDeleteResult = null;
            state.projectConsumptionDeleteError = null;

            state.projectConsumptionEntryResult = null;
            state.projectConsumptionEntryError = null;

            state.projectConsumptionItemDeleteResult = null;
            state.projectConsumptionItemDeleteError = null;

            state.error = null;
        },
    },

    /*
     |--------------------------------------------------------------------------
     | Extra Reducers
     |--------------------------------------------------------------------------
     */

    extraReducers: (builder) => {
        builder

            /*
             * ---------------------------------------------------------------
             * Customer
             * ---------------------------------------------------------------
             */

            .addCase(
                fetchCustomerId.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchCustomerId.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.forcastEdit = action.payload;
                }
            )

            .addCase(
                fetchCustomerId.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Project
             * ---------------------------------------------------------------
             */

            .addCase(
                fetchProjectApi.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchProjectApi.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.projectData = action.payload;
                }
            )

            .addCase(
                fetchProjectApi.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * BOM
             * ---------------------------------------------------------------
             */

            .addCase(
                fetchBomApi.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchBomApi.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.bomData = action.payload;
                }
            )

            .addCase(
                fetchBomApi.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Single BOM
             * ---------------------------------------------------------------
             */

            .addCase(
                fetchSingleBomApi.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchSingleBomApi.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.singleBomData = action.payload;
                }
            )

            .addCase(
                fetchSingleBomApi.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Forecast POST
             * ---------------------------------------------------------------
             */

            .addCase(
                ForcastPost.pending,
                (state) => {
                    state.postLoading = true;
                    state.forecastPostError = null;
                    state.forecastPostResult = null;
                }
            )

            .addCase(
                ForcastPost.fulfilled,
                (state, action) => {
                    state.postLoading = false;
                    state.forecastPostResult = action.payload;
                }
            )

            .addCase(
                ForcastPost.rejected,
                (state, action) => {
                    state.postLoading = false;
                    state.forecastPostError = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Forecast GET
             * ---------------------------------------------------------------
             */

            .addCase(
                ForcastGet.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                ForcastGet.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.forecastGet = action.payload;
                }
            )

            .addCase(
                ForcastGet.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Forecast DELETE
             * ---------------------------------------------------------------
             */

            .addCase(
                ForcastDelete.pending,
                (state) => {
                    state.deleteLoading = true;
                    state.forecastDeleteError = null;
                    state.forecastDeleteResult = null;
                }
            )

            .addCase(
                ForcastDelete.fulfilled,
                (state, action) => {
                    state.deleteLoading = false;
                    state.forecastDeleteResult = action.payload;
                }
            )

            .addCase(
                ForcastDelete.rejected,
                (state, action) => {
                    state.deleteLoading = false;
                    state.forecastDeleteError = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Forecast UPDATE
             * ---------------------------------------------------------------
             */

            .addCase(
                ForcastUpdate.pending,
                (state) => {
                    state.updateLoading = true;
                    state.forecastUpdateError = null;
                    state.forcastUpdate = null;
                }
            )

            .addCase(
                ForcastUpdate.fulfilled,
                (state, action) => {
                    state.updateLoading = false;
                    state.forcastUpdate = action.payload;
                }
            )

            .addCase(
                ForcastUpdate.rejected,
                (state, action) => {
                    state.updateLoading = false;
                    state.forecastUpdateError = action.payload;
                }
            )

            /*
             * ===============================================================
             * CONSUMPTION
             * ===============================================================
             */

            /*
             * ---------------------------------------------------------------
             * Consumption GET
             * ---------------------------------------------------------------
             */

            .addCase(
                ProjectConsumptionGet.pending,
                (state) => {
                    state.projectConsumptionLoading = true;
                    state.error = null;
                }
            )

            .addCase(
                ProjectConsumptionGet.fulfilled,
                (state, action) => {
                    state.projectConsumptionLoading = false;

                    state.projectConsumption =
                        action.payload;
                }
            )

            .addCase(
                ProjectConsumptionGet.rejected,
                (state, action) => {
                    state.projectConsumptionLoading = false;

                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Consumption POST
             * ---------------------------------------------------------------
             */

            .addCase(
                ProjectConsumptionPost.pending,
                (state) => {
                    state.projectConsumptionPostLoading = true;

                    state.projectConsumptionPostError = null;

                    state.projectConsumptionPostResult = null;
                }
            )

            .addCase(
                ProjectConsumptionPost.fulfilled,
                (state, action) => {
                    state.projectConsumptionPostLoading = false;

                    state.projectConsumptionPostResult =
                        action.payload;
                }
            )

            .addCase(
                ProjectConsumptionPost.rejected,
                (state, action) => {
                    state.projectConsumptionPostLoading = false;

                    state.projectConsumptionPostError =
                        action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Consumption GET BY ID
             * ---------------------------------------------------------------
             */

            .addCase(
                ProjectConsumptionGetById.pending,
                (state) => {
                    state.projectConsumptionLoading = true;
                    state.error = null;
                }
            )

            .addCase(
                ProjectConsumptionGetById.fulfilled,
                (state, action) => {
                    state.projectConsumptionLoading = false;

                    state.projectConsumptionGetById =
                        action.payload;
                }
            )

            .addCase(
                ProjectConsumptionGetById.rejected,
                (state, action) => {
                    state.projectConsumptionLoading = false;

                    state.error = action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Consumption DELETE
             * ---------------------------------------------------------------
             */

            .addCase(
                ProjectConsumptionDelete.pending,
                (state) => {
                    state.projectConsumptionDeleteLoading = true;

                    state.projectConsumptionDeleteError = null;

                    state.projectConsumptionDeleteResult = null;
                }
            )

            .addCase(
                ProjectConsumptionDelete.fulfilled,
                (state, action) => {
                    state.projectConsumptionDeleteLoading = false;

                    state.projectConsumptionDeleteResult =
                        action.payload;
                }
            )

            .addCase(
                ProjectConsumptionDelete.rejected,
                (state, action) => {
                    state.projectConsumptionDeleteLoading = false;

                    state.projectConsumptionDeleteError =
                        action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Consumption ENTRY UPDATE
             * ---------------------------------------------------------------
             */

            .addCase(
                ProjectConsumptionEntryUpdate.pending,
                (state) => {
                    state.projectConsumptionEntryLoading = true;

                    state.projectConsumptionEntryError = null;

                    state.projectConsumptionEntryResult = null;
                }
            )

            .addCase(
                ProjectConsumptionEntryUpdate.fulfilled,
                (state, action) => {
                    state.projectConsumptionEntryLoading = false;

                    state.projectConsumptionEntryResult =
                        action.payload;
                }
            )

            .addCase(
                ProjectConsumptionEntryUpdate.rejected,
                (state, action) => {
                    state.projectConsumptionEntryLoading = false;

                    state.projectConsumptionEntryError =
                        action.payload;
                }
            )

            /*
             * ---------------------------------------------------------------
             * Consumption ITEM DELETE
             * ---------------------------------------------------------------
             */

            .addCase(
                ProjectConsumptionItemDelete.pending,
                (state) => {
                    state.projectConsumptionItemDeleteLoading = true;

                    state.projectConsumptionItemDeleteError = null;

                    state.projectConsumptionItemDeleteResult = null;
                }
            )

            .addCase(
                ProjectConsumptionItemDelete.fulfilled,
                (state, action) => {
                    state.projectConsumptionItemDeleteLoading = false;

                    state.projectConsumptionItemDeleteResult =
                        action.payload;
                }
            )

            .addCase(
                ProjectConsumptionItemDelete.rejected,
                (state, action) => {
                    state.projectConsumptionItemDeleteLoading = false;

                    state.projectConsumptionItemDeleteError =
                        action.payload;
                }
            );
    },
});

/*
|--------------------------------------------------------------------------
| Export Actions
|--------------------------------------------------------------------------
*/

export const {
    clearBomData,
    clearProjectData,
    clearSingleBomData,

    clearForecastPostResult,
    clearForecastDeleteResult,

    clearProjectConsumptionPostResult,
    clearProjectConsumptionDeleteResult,
    clearProjectConsumptionEntryResult,
    clearProjectConsumptionItemDeleteResult,

    resetForecastForm,
} = ForecastSlice.actions;

/*
|--------------------------------------------------------------------------
| Export Reducer
|--------------------------------------------------------------------------
*/

export default ForecastSlice.reducer;