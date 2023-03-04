import { ajax } from "./index";
import { useRouter, useRoute } from "vue-router";
import { Cookies } from "@/utils";

const route = useRoute();
const router = useRouter();

export function check_login() {
    // const id = Cookies.get('userId');
    // const name = Cookies.get('userName');
    // console.log(123);
    // router.push('/login');
    //
    // if (!name || !id) {
    //     router.push('/login');
    // }
}

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