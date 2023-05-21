<?php
/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-13 19:03:12
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 01:56:56
 * @FilePath: \lar-demo\app\Http\Controllers\Collect.php
 */

namespace App\Http\Controllers;

use App\Models\CollectSql;
use Illuminate\Http\Request;

class Collect extends Controller
{
    /**
     * @description: 获取收藏列表
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        // 接受参数
        $userId = $request->post('userId');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');
        $collectType = $request->post('collectType');

        // 模型处理数据
        if ($collectType === 'manga') {
            $res =  CollectSql::get_manga($userId, $page, $pageSize);
        } else {
            $res =  CollectSql::get_chapter($userId, $page, $pageSize);
        }
        return $res;
    }
    public function all(Request $request)
    {
        // 接受参数
        ['page' => $page, 'pageSize' => $pageSize] = $request->input();

        // 模型处理数据
        return CollectSql::get($page, $pageSize);
    }

    /**
     * @description: 新增收藏
     * @param {Request} $request
     * @return {*}
     */
    public function add(Request $request)
    {
        // 接受参数
        ['userId' => $userId, 'mediaId' => $mediaId, 'mangaId' => $mangaId, 'collectType' => $collectType] = $request->post();
        $chapterId = $request->post('chapterId');
        $chapterName = $request->post('chapterName');
        $mangaName = $request->post('mangaName');

        // 生成insert的数据
        $data = ['userId' => $userId, 'mediaId' => $mediaId, 'mangaId' => $mangaId, 'collectType' => $collectType];

        if ($collectType === 'chapter') {
            $data['chapterId'] = $chapterId;
            $data['chapterName'] = $chapterName;
        }

        if ($collectType === 'manga') {
            $data['mangaName'] = $mangaName;
        }

        return CollectSql::add($data);
    }
    /**
     * @description: 删除书签
     * @param {Request} $request
     * @return {*}
     */
    public function remove(Request $request)
    {
        // 接受参数
        $userId = $request->post('userId');
        $collectType = $request->post('collectType');
        $targetId = $request->post('targetId');
        $collectId = $request->post('collectId');

        // 有id 则根据id删除
        if($collectId) return CollectSql::remove($collectId);

        if($collectType==='manga') return CollectSql::remove_manga($userId,$targetId);

        if($collectType==='chapter') return CollectSql::remove_chapter($userId,$targetId);
    }
    public function is_collect(Request $request){
        // 接受参数
        $userId = $request->post('userId');
        $collectType = $request->post('collectType');
        $targetId = $request->post('targetId');

        if($collectType==='manga') return CollectSql::is_manga_collected($userId,$targetId);

        if($collectType==='chapter') return CollectSql::is_chapter_collected($userId,$targetId);
    }
}
