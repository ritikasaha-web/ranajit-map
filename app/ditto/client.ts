import axios, { AxiosError } from "axios";

export const dittoApi = axios.create({
  baseURL: "http://localhost:8080/api/2/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Basic ZGl0dG86ZGl0dG8=",
  },
});

export const isDittoNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;
