<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-14 13:32:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-16 00:04:12
 * @FilePath: /php/laravel/app/Http/Controllers/History.php
 */

namespace App\Http\Controllers;

use App\Models\HistorySql;
use Illuminate\Http\Request;

class History extends Controller
{
    /**
     * @description: 获取历史记录
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        $userId = $request->post('userId');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');
        return HistorySql::get($userId, $page, $pageSize);
    }
    /**
     * @description: 新增历史记录
     * @param {Request} $request
     * @return {*}
     */
    public function add(Request $request)
    {
        $userId = $request->post('userId');
        $mediaId = $request->post('mediaId');
        $mangaId = $request->post('mangaId');
        $mangaName = $request->post('mangaName');
        $chapterId = $request->post('chapterId');
        $chapterName = $request->post('chapterName');
        $chapterPath = $request->post('chapterPath');

        $data = ['userId' => $userId, 'mediaId' => $mediaId, 'mangaId' => $mangaId, 'chapterId' => $chapterId];
        return HistorySql::add($data);
    }
    /**
     * @description: 删除历史记录
     * @param {Request} $request
     * @return {*}
     */
    public function delete(Request $request)
    {
        $historyId = $request->post('historyId');
        $chapterId = HistorySql::info($historyId)->chapterId;
        return HistorySql::delete_by_chapter($chapterId);
    }
}
