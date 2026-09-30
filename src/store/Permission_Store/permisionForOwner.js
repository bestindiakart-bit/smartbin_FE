import { createSlice } from "@reduxjs/toolkit";

/* =========================================
   Decode JWT
========================================= */
const getDecodedToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    console.error("Invalid token");
    return null;
  }
};

/* =========================================
   Build State From Token
========================================= */
const buildAuthState = () => {
  const decoded = getDecodedToken();
  const userData = decoded?.data || {};

  return {
    isAuthenticated: !!decoded,
    userId: userData?._id || null,
    customerId: userData?.customerId || null,
    role: userData?.role || null,
    owner: userData?.owner ?? false,
    permissions: userData?.permissions || [],
    url: userData?.url || null,
  };
};

const initialState = buildAuthState();

/* =========================================
   Slice
========================================= */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    refreshAuth: (state) => {
      Object.assign(state, buildAuthState());
    },

    logout: (state) => {
      localStorage.removeItem("accessToken");

      Object.assign(state, {
        isAuthenticated: false,
        userId: null,
        customerId: null,
        role: null,
        owner: false,
        permissions: [],
        url: null,
      });
    },
  },
});

export const { refreshAuth, logout } = authSlice.actions;
export default authSlice.reducer;
