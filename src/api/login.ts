import { ajax } from "./index";
import { useRoute } from "vue-router";
import router from "@/router";
import { Cookies } from "@/utils";

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

export function system_init() {
    return ajax({
        url: 'php/public/init.php'
    })
}
