import {ajax} from "./index";

/**
 * 获取章节记录
 * @param imagePath
 */
export function get_chapter_images(imagePath: string) {
    return ajax({
        url: 'php/get-image-list.php',
        data: {imagePath}
    })
}
