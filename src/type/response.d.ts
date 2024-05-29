/*
 * @Author: 梁楷文 lkw199711@163.com
 * @Date: 2024-05-29 14:56:36
 * @LastEditors: 梁楷文 lkw199711@163.com
 * @LastEditTime: 2024-05-29 15:03:01
 * @FilePath: \smanga\src\type\response.d.ts
 */
type Response = {
    code: number;
    message: string;
    data: any;
    list?: any[];
    error?: string;
}

export default Response;