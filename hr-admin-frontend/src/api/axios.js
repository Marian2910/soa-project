import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:5062/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach token to every request
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 and network errors
authApi.interceptors.response.use(
  (response) => {
    // If the server returned a token in this response, save it
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },
  (error) => {
    const { response } = error;

    // Unauthorized or network errors → log out
    if (response && response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (
      !response &&
      (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;
