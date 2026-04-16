import axios from "axios";

export const api = axios.create({
  baseURL: "http://138.201.137.244:5500/api/2/",
  // baseURL: "http://localhost:8080/api/2",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Basic ZGl0dG86ZGl0dG8=", // ditto:ditto
  },
});
