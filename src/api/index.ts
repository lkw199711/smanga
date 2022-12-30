import Axios from "axios";
import Qs from "qs";
import store from '../store';
import {Md5} from 'ts-md5/dist/md5';
import {ElMessage} from "element-plus";

// 接口路径的设置
const url = process.env.NODE_ENV === 'development' ? '/cms' + "/" : '/';

/**
 * 创建默认接口请求设置
 * 传参接收使用json
 * 默认传参 userid 时间戳 密钥
 * @type {Axios}
 */
const ajax = Axios.create({
    baseURL: url,
    timeout: 10 * 1000,
    method: "post",
    params: {},
    headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    transformRequest: [
        data => {
            // 获取时间戳
            const timestamp = new Date().getTime();
            // 初始化传参
            data = data || {};
            // 加入时间戳与密钥
            data = Object.assign(data, {timestamp, keyword: get_key_word(timestamp)});
            // 返回json
            return Qs.stringify(data);
        },
    ],
    transformResponse: [
        function (data) {
            data = data || {};

            if (typeof data === 'string') data = JSON.parse(data);

            if (data.message) {
                let type: string;
                switch (data.code) {
                    case 0:
                        type = 'success';
                        break;
                    case 1:
                        type = 'error';
                        break;
                    default:
                        type = 'info';
                        break;
                }

                ElMessage({
                    message: data.message,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    type: type
                });
            }

            return data;
        },
    ]
});

/**
 * 文件 图片请求
 * @type {Axios}
 */
const img = Axios.create({
    baseURL: url + "php/get-file-flow.php",
    timeout: 5 * 1000,
    method: "post",
    responseType: "blob", // 设置接收格式为blob格式
    params: {},
    headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    transformRequest: [
        data => {
            // 获取时间戳
            const timestamp = new Date().getTime();
            // 初始化传参
            data = data || {};
            // 加入时间戳与密钥
            data = Object.assign(data, {timestamp, keyword: get_key_word(timestamp)});
            // 返回json
            return Qs.stringify(data);
        },
    ],
    transformResponse: [
        function (data) {
            data = data || {};

            return URL.createObjectURL(data)
        },
    ]
});

/**
 * 获取文件里
 * @param file
 */
function get_image_blob(file: string) {
    return img({
        data: {file}
    })
}

/**
 * 生成密钥
 * 时间戳 + 密文,经过md5加密后形成
 * @param time 时间戳 以毫秒为单位
 * @returns {*}
 */
function get_key_word(time: number) {
    // 密钥文本使用数组拆分
    const keyArr = ['s', 'u', 'n', 'l', 'i', 'g', 'h', 't'];
    const tailArr = ['-', 'm', 'a', 'n', 'g', 'a'];

    // 合并密钥文本与时间戳,使用md5加密
    // 返回密钥
    return Md5.hashStr(time + keyArr.join('') + tailArr.join(''));
}

/**
 * 获取海报
 * @param arr
 * @param running
 */
async function get_poster(arr: any[], running: string) {
    for (let i = 0; arr.length > i; i++) {
        // 请求加载海报图片文件 使用await 顺序请求
        const b = await get_image_blob(arr[i].mangaCover || arr[i].chapterCover);
        // 生成blob链接
        arr[i].blob = b.data;
        // 加载完成标识
        arr[i].finish = true;

        if (!store.state[running]) {
            store.commit('switch_await', {running, bool: true});
            break;
        }
    }
}

/**
 * 将加载到的list进行排序
 * @param arr
 */
function array_sort(arr: any[]) {
    arr.sort((a: any, b: any) => {
        const valueA: any = a.match(/\d+(?=\b)/);
        const valueB: any = b.match(/\d+(?=\b)/);

        return valueA - valueB;
    })
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
    })
}

export {ajax,get_poster,get_image_blob,array_sort,array_sort_name};





