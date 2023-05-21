<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 11:18:10
 * @FilePath: /php/laravel/app/Http/Controllers/Path.php
 */

namespace App\Http\Controllers;

use App\Jobs\Scan;
use App\Models\UserSql;
use App\Models\PathSql;
use App\Models\MangaSql;
use App\Models\ChapterSql;
use Illuminate\Http\Request;

class Path extends Controller
{
    /**
     * @description: 获取路径信息
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        $userId = $request->post('userId');
        $mediaId = $request->post('mediaId');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');

        $mediaLimit = UserSql::get_media_limit($userId);

        if ($mediaId) {
            // 通过媒体库获取漫画
            return PathSql::get($mediaId, $page, $pageSize);
        } else {
            // 获取全部漫画
            return PathSql::get_nomedia($mediaLimit, $page, $pageSize);
        }
    }

    /**
     * @description: 新增路径
     * @param {Request} $request
     * @return {*}
     */
    public function add(Request $request)
    {
        $mediaId = $request->post('mediaId');
        $path = $request->post('path');

        if (!is_dir($path)) {
            return ['code' => 1, 'message' => '路径无法读取'];
        }

        $pathInfo = PathSql::info($mediaId, $path);

        // 媒体库下有相同路径 返回错误
        if ($pathInfo) {
            return ['code' => 1, 'message' => '路径已存在,请勿重复添加', 'status' => 'path add filed'];
        }
        // 获取pathId
        $sqlRes = PathSql::add(['mediaId' => $mediaId, 'path' => $path]);
        
        if ($sqlRes['code'] == 1) {
            return $sqlRes;
        }

        $pathInfo = $sqlRes['info'];
        
        // 添加扫描任务
        Scan::dispatch($pathInfo->pathId)->onQueue('scan');

        return ['code' => 0, 'message' => '新增成功', 'status' => 'path add success'];
    }

    /**
     * @description: 删除路径
     * @param {Request} $request
     * @return {*}
     */
    public function delete(Request $request)
    {
        $pathId = $request->post('pathId');
        return PathSql::path_delete($pathId);
    }
    /**
     * @description: 扫描
     * @param {Request} $request
     * @return {*}
     */
    public function scan(Request $request)
    {
        $pathId = $request->post('pathId');
        Scan::dispatch($pathId)->onQueue('scan');
        return ['code' => 0, 'message' => '任务添加成功', 'status' => 'scan success'];
    }
    /**
     * @description: 重新扫描
     * @param {Request} $request
     * @return {*}
     */
    public function rescan(Request $request)
    {
        $pathId = $request->post('pathId');

        MangaSql::manga_delete_by_path($pathId);
        ChapterSql::chapter_delete_by_path($pathId);

        Scan::dispatch($pathId)->onQueue('scan');

        return ['code' => 0, 'message' => '任务添加成功', 'status' => 'scan success'];
    }
}
