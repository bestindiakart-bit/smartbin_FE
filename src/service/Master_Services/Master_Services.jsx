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
  }
);

// 3. Add a Response Interceptor (Handles Global Errors)
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Case 1: Network Error / Server is Down (No response object)
    if (!error.response) {
      console.error("Network error or server unreachable");
      window.location.href = "/network-error";
      return Promise.reject(error);
    }

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
    else if (status === 404) {
      // You can choose to redirect to 404 here or handle it in the component
      // window.location.href = "/404";
    }

    return Promise.reject(error);
  }
);

//////////////////////////////////////////////////////////////////////////////////// User Permissions ///////////////////////////////////////////////////////////////////////////
// 1. Get all user-types (Used in User_Permission_Master)
export const user_Permission_get = () => {
    return api.get('/user-type');
};

// 2. Get user-type by ID (Used in User_ViewPage)
export const user_Permission_view = (id) => {
    return api.get(`/user-type/${id}`);
};

// 3. Update user-type (PUT)
export const user_Permission_update = (id, data) => {
    return api.put(`/user-type/${id}`, data);
};

// 4. Soft delete user-type (DELETE)
export const user_Permission_delete = (id) => {
    return api.delete(`/user-type/${id}`);
};

// 5. Create new user-type (POST)
export const user_Permission_create = (data) => {
    return api.post('/user-type', data);
};

//////////////////////////////////////////////////////////////////////////// User Master ///////////////////////////////////////////////////////////////////////////////////////////

export const user_master_get = (page = 1, limit = 10) => {
  return api.get('/user',{
    params: { page, limit }
  })
}


export const user_delete = (id) => {
  return api.delete(`/user/${id}`)
}

export const user_master_getID = (id) => {
  return api.get(`/user/${id}`)
}

export const user_create =(data) => {
  return api.post('/user/',data)
}

export const user_create_edit = (id,data) => {
  return api.put(`/user/${id}`,data);
}

export const user_type_get = () => {
  return api.get('/user-type/');
}
export const user_type_getid = (id) => {
  return api.get(`/user-type/${id}`);
}
export const user_type_patch = (id,data) => {
  return api.put(`/user-type/${id}`,data);
}
export const user_type_delete = (id) => {
  return api.delete(`/user-type/${id}`);
}

export const user_type_post = (data) =>{
  return api.post('/user-type/',data)
}

export const customer_id = () => {
  return api.get('/customer-master/get/all');
}

export const get_customer_byUser = (customerId) => {
  return api.get(`/user/by-customer/${customerId}`);
}



export const user_export = (format) => {
  return api.post(`/export/user_master?format=${format}`, {}, { 
    responseType: 'blob' 
  });
};

/////////////////////////////////////////////////////////////////////////// Custommer Master ///////////////////////////////////////////////////////////////////////////////////////////


export const customer_get_Type = ()=>{
  return api.get('/customer-type/')
}

export const customer_post_Type = (data)=>{
  return api.post('/customer-type/',data)
}
export const customer_patch_Type = (id,data)=>{
  return api.put(`/customer-type/${id}`,data)
}
export const customer_delete_Type = (id)=>{
  return api.delete(`/customer-type/${id}`)
}

export const customer_create = (data)=>{
  return api.post('/customer-master/',data)
}

export const customer_get = (page = 1, limit = 10) => {
  return api.get(`/customer-master`, {
    params: { page, limit }
  });
};

export const customer_view = (id) => {
  return api.get(`/customer-master/${id}`)
}

export const customer_PUI = (customerId) => {
  return api.get(`/customer-master/get/data?customerId=${customerId}`)
}

export const customer_create_edit = (id,data) => {
  return api.put(`/customer-master/${id}`,data)
}


export const customer_delete = (id) => {
  return api.delete(`/customer-master/${id}`)
}

export const customer_export = (format) => {
  return api.post(`/export/customer_master?format=${format}`, {}, { 
    responseType: 'blob' 
  });
};


/////////////////////////////////////////////////////////////////////////////////////Project Master //////////////////////////////////////////////////////////////////////////////////

export const project_master_get = (page = 1, limit = 10) => {
  return api.get('/project',{
    params: { page, limit }
  })
}

export const project_patch_row = (id,data) => {
  return api.put(`/project/${id}`,data)
}

export const project_master_delete = (id) => {
  return api.delete(`/project/${id}`)
}

export const project_create = (data) => {
  return api.post('/project/',data)
}

export const userDropdown = () => {
  return api.get("/user/")
}

export const project_create_edit = (id,data)=> {
  return api.put(`/project/${id}`,data)
}

export const project_master_getID = (id) => {
  return api.get(`/project/${id}`)
}

export const project_export = (format) => {
  return api.post(`/export/project_master?format=${format}`, {}, { 
    responseType: 'blob' 
  });
};


/////////////////////////////////////////////////////////////////////////// Item Master //////////////////////////////////////////////////////////////////////////////////


export const item_master_get = (page=1, limit=10) => {
  return api.get('/item-master/', {
    params: { page, limit }
  })
}


// UPDATE THIS: Added headers to override global application/json
export const Item_create = (data) => {
  return api.post('/item-master/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// UPDATE THIS: Added headers to override global application/json
export const item_create_edit = (id, data) => {
  return api.put(`/item-master/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const item_master_getID = (id) => {
  return api.get(`/item-master/${id}`)
}

export const Item_category_get = (id) =>{
  return api.get(`/item-master/${id}`)
}

export const item_category_create = (data) => {
  return api.post('/item-category/',data)
}

export const item_category_gets = () => {
  return api.get('/item-category/')
}

export const item_category_getsId = (id) => {
  return api.get(`/item-category/${id}`)
}
export const item_category_patch = (id,data) => {
  return api.put(`/item-category/${id}`,data)
}
export const item_category_delete = (id) => {
  return api.delete(`/item-category/${id}`)
}

export const item_export = (format) => {
  return api.post(`/export/item_master?format=${format}`, {}, { 
    responseType: 'blob' 
  });
};



export default api;