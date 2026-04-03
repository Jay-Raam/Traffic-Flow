import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;

    if (!original) {
      return Promise.reject(error);
    }

    if (!original._retryCount) {
      original._retryCount = 0;
    }

    if (status >= 500 && original._retryCount < 2) {
      original._retryCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 500 * original._retryCount));
      return api(original);
    }

    const message =
      status === 429
        ? "Too many requests. Please wait before trying again."
        : error?.response?.data?.detail || "Unable to process request right now.";

    return Promise.reject(new Error(message));
  }
);
