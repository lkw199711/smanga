import {ajax} from "./index";
import {useRouter,useRoute} from "vue-router";
import {Cookies} from "@/utils";

const route = useRoute();
const router = useRouter();
console.log(useRoute);

export function check_login() {
    console.log(route);
    // const id = Cookies.get('userId');
    // const name = Cookies.get('userName');
    // console.log(123);
    // router.push('/login');
    //
    // if (!name || !id) {
    //     router.push('/login');
    // }
}
