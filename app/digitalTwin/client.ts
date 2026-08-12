import axios from "axios";

export const digitalTwinApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DIGITAL_TWIN_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.NEXT_PUBLIC_DIGITAL_TWIN_API_KEY,
  },
});
