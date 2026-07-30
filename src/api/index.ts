import Axios from 'axios';
import {Cookies} from '@/utils';
import router from '@/router';
import {themeState} from '@/themes/store';
import Response from '@/type/response';

// 接口路径的设置
const url = import.meta.env.DEV ? import.meta.env.VITE_APP_PROXY_HTTP_URL : import.meta.env.VITE_APP_PATH;

/**
 * 创建默认接口请求设置
 * 传参接收使用json
 * 默认传参 userid 时间戳 密钥
 * @type {Axios}
 */
const ajax = Axios.create({
  baseURL: url,
  timeout: 10 * 1000,
  params: {},
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
  transformRequest: [
    (data, headers) => {
      // 设置请求头
      headers['token'] = Cookies.getToken();

      // 判断是否为FormData或不需要JSON转换的情况
      const contentType = headers['Content-Type'] || headers['content-type'];
      const isFormData = data instanceof FormData;
      const isJsonType = contentType && contentType.includes('json');

      // 只有在不是FormData且是JSON类型的情况下才进行数据处理和JSON转换
      if (!isFormData && isJsonType) {
        // 获取时间戳
        const timestamp = new Date().getTime();
        // 初始化传参
        data = data || {};
        // 加入时间戳与密钥
        data = Object.assign(data, {
          timestamp,
        });

        // 删除多余参数
        if (data.data && data.data.createTime) {
          delete data.data.createTime;
        }
        if (data.data && data.data.updateTime) {
          delete data.data.updateTime;
        }

        // 返回json
        return JSON.stringify(data);
      } else {
        // 对于FormData或非JSON类型，直接返回原始数据
        return data;
      }
    },
  ],
  transformResponse: [
    function (response: Response) {
      // 修复类型错误，确保response符合Response类型
      response = response || {code: 200, message: '', data: null};

      if (typeof response === 'string') response = JSON.parse(response);

      if (response.message) {
        let type: string;
        const code = Number(response.code);
        if (code >= 200 && code < 300) type = 'success';
        else if (code >= 500) type = 'error';
        else if (code >= 400) type = 'warning';
        else {
          switch (response.code) {
            case 0:
              type = 'success';
              break;
            case 1:
              type = 'error';
              break;
            case 2:
              type = 'warning';
              break;
            default:
              type = 'info';
              break;
          }
        }

        ElMessage({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          message: response.message,
          type: type,
        });
      }

      // 初次部署
      if (response.status === 'first deploy') {
        router.push('/init');
      }

      // 登录信息错误：按当前皮肤分流到对应登录页。
      if (response.status === 'token error') {
        router.push(themeState.current === 'Legacy' ? '/login' : '/t/login');
      }

      // 处理时间格式 —— 兼容:ISO字符串、Date对象、数字/字符串形式的毫秒或秒级时间戳
      // 无效时间不要覆盖成 "Invalid Date" 字符串
      const toValidDate = (v: any): Date | null => {
        if (v === null || v === undefined || v === '') return null;
        if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
        // 数字或纯数字字符串 => 时间戳
        if (typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v))) {
          let n = Number(v);
          if (!isFinite(n)) return null;
          // 10位视为秒级时间戳,转成毫秒
          if (String(Math.trunc(n)).length <= 10) n = n * 1000;
          const d = new Date(n);
          return isNaN(d.getTime()) ? null : d;
        }
        if (typeof v !== 'string') return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
      };

      // 命名匹配:createTime / updateTime / readTime / lastTime / xxxTime / xxxAt
      const TIME_KEY_RE = /^(?:.*T|t)ime$|^(?:.*A|a)t$|^(?:create|update|read|last|start|end|finish)Time$/;
      // 递归规范化对象中的时间字段;限制深度避免环形引用/巨大对象性能问题
      const normalizeTimes = (node: any, depth = 0): void => {
        if (!node || depth > 6) return;
        if (Array.isArray(node)) {
          for (const it of node) normalizeTimes(it, depth + 1);
          return;
        }
        if (typeof node !== 'object') return;
        for (const key of Object.keys(node)) {
          const val = node[key];
          if (val && typeof val === 'object') {
            normalizeTimes(val, depth + 1);
            continue;
          }
          if (TIME_KEY_RE.test(key) && val !== null && val !== undefined && val !== '') {
            const d = toValidDate(val);
            node[key] = d ? d.toLocaleString() : '';
          }
        }
      };

      if (response.list) normalizeTimes(response.list);
      if (response.data) normalizeTimes(response.data);

      return response;
    },
  ],
});

/**
 * 将加载到的list进行排序
 * @param arr
 */
function array_sort(arr: any[]) {
  arr.sort((a: any, b: any) => {
    const valueA: any = a.match(/\d+(?=\b)/);
    const valueB: any = b.match(/\d+(?=\b)/);

    return valueA - valueB;
  });
}

/**
 * 将加载到的list进行排序
 * @param arr
 */
function array_sort_name(arr: any[]) {
  arr.sort((a: any, b: any) => {
    const valueA: any = a.name.match(/\d+(?=\b)/);
    const valueB: any = b.name.match(/\d+(?=\b)/);

    return valueA - valueB;
  });
}

export {ajax, url, array_sort, array_sort_name};
