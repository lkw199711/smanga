import {get_img} from "@/serve";
import store from '../store';

/**
 * 获取海报
 * @param arr
 */
export async function get_poster(arr: any[], running: string) {
    for (let i = 0; arr.length > i; i++) {
        // 请求加载海报图片文件 使用await 顺序请求
        const b = await get_img({params: {file: arr[i].poster}});
        // 生成blob链接
        arr[i].blob = URL.createObjectURL(b.data);
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
export function array_sort(arr: any[]) {
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
export function array_sort_name(arr: any[]) {
    arr.sort((a: any, b: any) => {
        const valueA: any = a.name.match(/\d+(?=\b)/);
        const valueB: any = b.name.match(/\d+(?=\b)/);

        return valueA - valueB;
    })
}

