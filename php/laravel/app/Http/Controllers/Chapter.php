<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-19 02:23:05
 * @FilePath: /php/laravel/app/Http/Controllers/Chapter.php
 */

namespace App\Http\Controllers;

use App\Jobs\Compress;
use App\Models\ChapterSql;
use App\Models\CompressSql;
use App\Models\UserSql;
use Illuminate\Http\Request;

class Chapter extends Controller
{
    /**
     * @description: 获取漫画章节
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        // 接受参数
        $userId = $request->post('userId');
        $mangaId = $request->post('mangaId');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');
        $order = $request->post('order');

        // 默认排序规则
        if (!$order) $order = 'id';

        // 获取媒体库权限
        $mediaLimit = UserSql::get_media_limit($userId);

        if ($mangaId) {
            // 通过媒体库获取漫画
            return ChapterSql::get($mangaId, $page, $pageSize, $order);
        } else {
            // 获取全部漫画
            return ChapterSql::get_nomanga($mediaLimit, $page, $pageSize, $order);
        }
    }
    /**
     * @description: 修改漫画信息
     * @param {Request} $request
     * @return {*}
     */
    public function update(Request $request)
    {
        $chapterId = $request->post('chapterId');
        $chapterName = $request->post('chapterName');
        $chapterPath = $request->post('chapterPath');
        $chapterCover = $request->post('chapterCover');

        $data = ['chapterName' => $chapterName, 'chapterPath' => $chapterPath, 'chapterCover' => $chapterCover];

        return ChapterSql::chapter_update($chapterId, $data);
    }
    /**
     * @description: 移除漫画信息
     * @param {Request} $request
     * @return {*}
     */
    public function delete(Request $request)
    {
        $chapterId = $request->post('chapterId');

        return ChapterSql::chapter_delete($chapterId);
    }
    public function image_list(Request $request)
    {
        $userId = $request->post('userId');
        $chapterId = $request->post('chapterId');
        $chapterPath = $request->post('chapterPath');
        $chapterType = $request->post('chapterType');

        if (Utils::is_compressed($chapterType)) {

            $compressInfo = CompressSql::compress_get_by_chapter($chapterId);

            if ($compressInfo) {
                if (array_search($compressInfo->compressStatus, ['compressing', 'compressed']) !== false) {
                    $list = Utils::get_file_list($compressInfo->compressPath);
                    return ['code' => 0, 'list' => $list, 'status' => $compressInfo->compressStatus];
                }else{
                    return ['code' => 0, 'list' => [], 'status' => $compressInfo->compressStatus];
                }
            } else {
                Compress::dispatch($userId, $chapterId)->onQueue('compress');
                return ['code' => 0, 'message' => '正在进行压缩转换', 'status' => 'uncompressed'];
            }
        } else {
            $list = Utils::get_file_list($chapterPath);
            return ['code' => 0, 'list' => $list, 'status' => 'success'];
        }
    }
}
