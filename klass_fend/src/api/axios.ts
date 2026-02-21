import axios from "axios";

const api = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
    baseURL: "http://localhost:5091/api",
    withCredentials: true, // ✅ important!
});

export default api;
