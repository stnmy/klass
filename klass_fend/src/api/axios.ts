import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5091/api",
    withCredentials: true, // ✅ important!
});

export default api;
