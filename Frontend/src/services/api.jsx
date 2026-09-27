import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: configuredApiUrl
    ? (configuredApiUrl.startsWith("http") ? configuredApiUrl : `https://${configuredApiUrl}`)
    : "http://127.0.0.1:8000",
});

export default api;