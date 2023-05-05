import { ajax } from "./index";

export function database_check(data: any) {
    return ajax({
        url: 'php/dosql/test.php',
        data,
    })
}

export function database_set(data: any) {
    return ajax({
        url: 'php/dosql/set.php',
        data,
    })
}

export function database_get() {
    return ajax({
        url: 'php/dosql/get-setting.php'
    })
}