import {ajax} from "./index";

export function get_compress() {
    return ajax({
        url: 'php/compress/get.php'
    })
}

export function delete_compress(compressId: number) {
    return ajax({
        url: 'php/compress/delete.php',
        data: {
            compressId
        }
    })
}
