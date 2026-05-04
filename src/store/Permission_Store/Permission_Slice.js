import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginMeAPI } from '../../service/Login/Login';


export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loginMeAPI();
      return response?.data?.data?.permissions; 
     

    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch permissions");
    }
  }
);


const initialState = {
  permissions: [],
  loading: false,
  error: null,
};

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // Standard reducers for manual updates if needed
    clearPermissions: (state) => {
      state.permissions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload; // Sets the array you provided
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;

// Selector to check permission for a specific module easily
export const selectModulePermission = (state, moduleName) => 
  state.permissions.permissions.find(p => p.module === moduleName);