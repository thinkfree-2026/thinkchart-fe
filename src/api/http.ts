import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

export type ApiResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  result: T;
};

export const httpClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

httpClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status}:`, error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await httpClient.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  post: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await httpClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  put: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await httpClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  patch: async <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await httpClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await httpClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  },
};
