import {globalData} from "@/store";
import {GlobalData} from "@/store/type";

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
    localStorage.setItem(key, value);

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
    localStorage.setItem(key, JSON.stringify(value));
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

    // storage有值
    const json = localStorage.getItem(key);

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
        document.cookie = key + '=' + value + ';expires=' + cookiesTime;
        return value;
    },
    /**
     * 获取cookie
     * @param key
     */
    get: function (key: string) {
        // return localStorage.getItem(key);
        const arr = document.cookie.match(new RegExp("\\b" + key + "=([^;]+)(;|$)"));
        return arr ? arr[1] : '';
    },
    /**
     * 移除cookie
     * @param key
     */
    remove: function (key: string) {
        return localStorage.removeItem(key);
        Cookies.set(key, '', -1);
        return key;
    },
}

export function get_cookie(key: string) {
    const arr = document.cookie.match(new RegExp("\\b" + key + "=([^;]+)(;|$)"));
    return arr ? arr[1] : '';
}
