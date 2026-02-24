import axios from "axios";

const api = axios.create({
  baseURL: "/api/2/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Basic ZGl0dG86ZGl0dG8=", // ditto:ditto
  },
});

export default api;
