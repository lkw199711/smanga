/*
 * @Author: 梁楷文 lkw199711@163.com
 * @Date: 2024-05-29 14:56:36
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 15:03:01
 * @FilePath: \smanga\src\type\response.d.ts
 */
export type ApiResponse<TData = unknown, TError = unknown> = {
  code: number;
  message: string;
  data?: TData;
  error?: TError;
  status?: string;
};

export type ApiListResponse<TItem = unknown, TError = unknown> = {
  code: number;
  message: string;
  list: TItem[];
  count: number;
  error?: TError;
  status?: string;
};

type Response = ApiResponse<any, any> & Partial<ApiListResponse<any, any>>;

export default Response;
