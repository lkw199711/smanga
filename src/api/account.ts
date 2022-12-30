import {ajax} from "./index";

export function register(data: any){
    return ajax({
        url: 'php/account/register.php',
        data
    })
}

export function get_account() {
    return ajax({
        url: 'php/account/get.php',
    })
}

export function delete_account(userId: number) {
    return ajax({
        url: 'php/account/delete.php',
        data: {
            userId
        }
    })
}

export function update_account(data: any) {
    return ajax({
        url: 'php/account/update.php',
        data
    })
}

export function login(data: any){
    return ajax({
        url: 'php/account/login.php',
        data
    })
}
