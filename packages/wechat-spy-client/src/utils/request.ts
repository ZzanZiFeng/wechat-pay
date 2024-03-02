import axios from "axios";
import { message } from "antd";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface RequestInterceptors {
  // 请求拦截
  requestInterceptors?: (config: any) => any;
  requestInterceptorsCatch?: (err: any) => any;
  // 响应拦截
  responseInterceptors?: (
    response: AxiosResponse
  ) => Promise<AxiosResponse<any>>;
  responseInterceptorsCatch?: (err: any) => any;
}
// 自定义传入的参数
export interface RequestConfig extends AxiosRequestConfig {
  interceptors?: RequestInterceptors;
}
class Request {
  // axios 实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors;

  constructor(config: RequestConfig) {
    this.instance = axios.create(config);
    this.interceptorsObj = config.interceptors;
    //# 使用全局拦截器
    this.instance.interceptors.request.use(
      this.interceptorsObj!.requestInterceptors, //^通过
      this.interceptorsObj?.requestInterceptorsCatch //!错误
    );

    //# 全局响应拦截器
    this.instance.interceptors.response.use(
      this.interceptorsObj?.responseInterceptors, //^通过
      this.interceptorsObj?.responseInterceptorsCatch //!错误
    );
  }
  fetch<T>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this.instance
        .request<any, T>(config)
        .then((res) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}

const request = new Request({
  // baseURL: import.meta.env.BASE_URL,
  baseURL: "http://127.0.0.1:3000",
  timeout: 1000 * 60 * 5,
  interceptors: {
    // 请求拦截器
    requestInterceptors: (config) => {
      console.log("实例请求拦截器");

      return config;
    },
    // requestInterceptorsCatch: (err) => {
    //   console.log("实例请求拦截器错误");
    //   return Promise.reject(err);
    // },
    // 响应拦截器
    responseInterceptors: (result) => {
      if (result.status === 200) {
        return Promise.resolve(result.data);
      } else {
        return Promise.reject(result);
      }
    },
    responseInterceptorsCatch: (err) => {
      const networkErrMap: any = {
        "400": "错误的请求", // token 失效
        "401": "未授权，请重新登录",
        "403": "拒绝访问",
        "404": "请求错误，未找到该资源",
        "405": "请求方法未允许",
        "408": "请求超时",
        "500": "服务器端出错",
        "501": "网络未实现",
        "502": "网络错误",
        "503": "服务不可用",
        "504": "网络超时",
        "505": "http版本不支持该请求",
      };

      if (err?.response?.status) {
        message.error(
          networkErrMap[err.response.status] ??
            `其他连接错误 --${err.response.status}`
        );
        return Promise.reject(err);
      }

      message.error("无法连接到服务器！");
    },
  },
});
export { request };
