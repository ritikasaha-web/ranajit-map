import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/2/things", // your API base URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Basic ZGl0dG86ZGl0dG8=", // optional
  },
});

export default api;
