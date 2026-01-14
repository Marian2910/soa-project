import axios from "axios";

const authApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

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
      console.error("Network error - Backend unreachable");
    }

    return Promise.reject(error);
  }
);

export default authApi;
