import { globalData } from "@/store";
import { GlobalData } from "@/store/type";

/**
 * 回到顶部
 */
export function window_go_top() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}

/**
 * 设置缓存
 * @param key
 * @param value
 */
export function global_set<T extends keyof GlobalData>
    (key: T, value: GlobalData[T] & any) {

    globalData[key] = value;
    Cookies.set(key, value);

    return value;
}


// export function saveFormField<T extends keyof FormField>(
//     key: T,  value: FormField[T]
// )
/**
 * 设置json缓存
 * @param key
 * @param value
 */
export function global_set_json<T extends keyof GlobalData>
    (key: T, value: GlobalData[T]) {
    globalData[key] = value;
    Cookies.set(key, JSON.stringify(value));
}

/**
 * 获取缓存
 * @param key
 */
export function global_get(key: keyof typeof globalData) {
    return globalData[key] ? globalData[key] : localStorage.getItem(key);
}

/**
 * 获取缓存数组
 * @param key
 */
export function global_get_array(key: keyof typeof globalData) {
    const arr = globalData[key];

    // 内存中有值 从内存中取值
    if (!Array.isArray(arr)) return false;
    if (arr.length !== 0) {
        return arr;
    }

    // cookie有值
    const json = Cookies.get(key);

    if (json) {
        return JSON.parse(json);
    }

    // 都没有值 返回默认值
    return [];
}

/*
    * cookie的封装方法
    * getCookie
    * setCookie
    * removeCookie
    *
     */

export const Cookies = {
    /**
     * 设置cookie
     * @param key
     * @param value
     * @param time 过期时间，单位为天
     */
    set: function (key: string, value: string, time = 365) {
        // return localStorage.setItem(key, value);
        const cookiesTime = new Date(Date.now() + time * 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = key + '=' + encodeURIComponent(value) + ';expires=' + cookiesTime + ';path=/';
        return value;
    },
    /**
     * 获取cookie
     * @param key
     */
    get: function (key: string) {
        // return localStorage.getItem(key);
        const arr = document.cookie.match(new RegExp("\\b" + key + "=([^;]+)(;|$)"));
        return arr ? decodeURIComponent(arr[1]) : ''
    },
    /**
     * 移除cookie
     * @param key
     */
    remove: function (key: string) {
        Cookies.set(key, '', -1);
        return key;
    },

    /**
     * 设置token
     * @param token
     * @param time
     */
    setToken: function (token: string, time = 365) {
        const serverKey = Cookies.get('smanga-server-key');
        if (!serverKey) return false;
        return Cookies.set(serverKey + '-smanga-token', token, time);
    },

    /**
     * 获取token
     */
    getToken: function () {
        const serverKey = Cookies.get('smanga-server-key');
        if (!serverKey) return '';
        return Cookies.get(serverKey + '-smanga-token');
    },

    /**
     * 移除token
     */
    removeToken: function () {
        const serverKey = Cookies.get('smanga-server-key');
        if (!serverKey) return false;
        return Cookies.remove(serverKey + '-smanga-token');
    },

   /**
     * 设置角色
    * @param role 
    * @param time 
    * @returns 
    */
    setRole: function (role: string, time = 365) {
        const serverKey = Cookies.get('smanga-server-key');
        if (!serverKey) return false;
        return Cookies.set(serverKey + '-smanga-role', role, time);
    },
    /**
     * 获取角色
     */
    getRole: function () {
        const serverKey = Cookies.get('smanga-server-key');
        if (!serverKey) return '';
        return Cookies.get(serverKey + '-smanga-role');
    },
    /**
     * 设置带前缀的cookie
     * @param serverKey 前缀
     * @param key cookie键名
     * @param value cookie值
     * @param time 过期时间，单位为天
     */
    smangaSet: function (serverKey: string, key: string, value: string, time = 365) {
        const fullKey = serverKey ? `${serverKey}_${key}` : key;
        return Cookies.set(fullKey, value, time);
    },
    /**
     * 获取带前缀的cookie
     * @param serverKey 前缀
     * @param key cookie键名
     */
    smangaGet: function (serverKey: string, key: string) {
        const fullKey = serverKey ? `${serverKey}_${key}` : key;
        return Cookies.get(fullKey);
    },
    /**
     * 移除带前缀的cookie
     * @param serverKey 前缀
     * @param key cookie键名
     */
    smangaRemove: function (serverKey: string, key: string) {
        const fullKey = serverKey ? `${serverKey}_${key}` : key;
        return Cookies.remove(fullKey);
    },
}

export function get_cookie(key: string) {
    const arr = document.cookie.match(new RegExp("\\b" + key + "=([^;]+)(;|$)"));
    return arr ? decodeURIComponent(arr[1]) : '';
}


/**
 * 
 * @param ms 延迟的时间，单位为毫秒
 * @description: 延迟函数，使用Promise实现
 * @returns 
 */
export async function delay(ms: number) {
    return new Promise(resolve => {
        const now = new Date().getTime();
        const target = now + ms;

        while (new Date().getTime() < target) {
            continue;
        }

        resolve(true); // 延时结束，返回结果
    });
};

/**
 * 
 * @param filename 文件名
 * @description: 获取文件名不带扩展名的部分
 * @returns 
 */
export function getFileNameWithoutExtension(filename: string): string {
    // 方法1：使用lastIndexOf和substring
    return filename.substring(0, filename.lastIndexOf('.')) || filename;

    // 方法2：使用split和pop
    // return filename.split('.').slice(0, -1).join('.') || filename;

    // 方法3：使用正则表达式
    // return filename.replace(/\.[^/.]+$/, "");
}
