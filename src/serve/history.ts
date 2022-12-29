import {ajax} from "./index";

export function add_history(data: any) {
    return ajax({
        url: 'php/history/add.php',
        data,
    })
}

export function get_history(userId: number) {
    return ajax({
        url: 'php/history/get.php',
        data: {
            userId
        }
    })
}

export function delete_history(historyId: number) {
    return ajax({
        url: 'php/history/delete.php',
        data: {
            historyId
        }
    })
}

export function update_history(data: any) {
    return ajax({
        url: 'php/history/update.php',
        data
    })
}
