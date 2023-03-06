import { ajax } from "./index";
import { useRouter, useRoute } from "vue-router";
import { Cookies } from "@/utils";

const route = useRoute();
const router = useRouter();

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
