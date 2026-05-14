import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});
API.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log("API ERROR:", error.response?.data);

    alert(error.response?.data || "Something went wrong ❌");

    return Promise.reject(error);
  }
);
export default API;