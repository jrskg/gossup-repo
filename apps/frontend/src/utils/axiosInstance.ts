import axios from "axios";
import { toast } from "sonner";

const baseUrl = "http://localhost:3000/api/v1";

const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true
});

//will be testing it after deploying
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.message && error.message === "Network Error") {
      toast.error("Network Error. Please check your internet connection");
    }
    return Promise.reject(error);
  }
);

export default instance;