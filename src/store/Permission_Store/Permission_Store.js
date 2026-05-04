import { configureStore } from '@reduxjs/toolkit';
import permissionReducer from './Permission_Slice';
import authReducer from "./permisionForOwner";
import forecatEdit from "../Api_slice/Forecast_Slice"


const store = configureStore({
  reducer: {
    permissions: permissionReducer,
     auth: authReducer,
     forecast:forecatEdit,
  },
});

export default store;