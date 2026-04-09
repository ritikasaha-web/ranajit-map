import axios from "axios";

export const api_backend = axios.create({
  baseURL: "/api/2/",
  // baseURL: "http://138.201.137.244:5500/api/2/",
  // // baseURL: "http://localhost:8080/api/2",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Basic ZGl0dG86ZGl0dG8=", // ditto:ditto
  },
});
export const api_for_images = axios.create({
  baseURL: "http://localhost:3000/api",
  // baseURL: "http://138.201.137.244:3000/api",

  timeout: 30000,
  headers: {
    Accept: "application/json",
    Authorization: "Basic ZGl0dG86ZGl0dG8=", // ditto:ditto
  },
});
