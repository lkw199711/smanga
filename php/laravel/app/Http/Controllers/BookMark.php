<?php
/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-13 19:03:12
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 16:47:06
 * @FilePath: \lar-demo\app\Http\Controllers\BookMark.php
 */

namespace App\Http\Controllers;

use App\Models\BookMarkSql;
use Illuminate\Http\Request;

class BookMark extends Controller
{
    public function get(Request $request)
    {
        // 接受参数
        $userId = $request->post('userId');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');

        if ($page) {
            // 模型处理数据
            return BookMarkSql::get($userId, $page, $pageSize);
        } else {
            return BookMarkSql::get_nopage($userId);
        }
    }
    public function all(Request $request)
    {
        // 接受参数
        ['page' => $page, 'pageSize' => $pageSize] = $request->input();

        // 模型处理数据
        return BookMarkSql::get($page, $pageSize);
    }

    /**
     * @description: 新增书签
     * @param {Request} $request
     * @return {*}
     */
    public function add(Request $request)
    {
        // 书签存放路径
        $bookmarkPosterPath = getenv('SMANGA_BOOKMARK');

        // 接受参数
        [
            'userId' => $userId, 'mediaId' => $mediaId, 'mangaId' => $mangaId, 'mangaName' => $mangaName, 'chapterId' => $chapterId, 'chapterPath' => $chapterPath, 'chapterName' => $chapterName, 'page' => $page, 'pageImage' => $pageImage, 'browseType' => $browseType
        ] = $request->post();

        // 生成书签封面存放在、poster
        $md5 = md5($pageImage);
        $target = "$bookmarkPosterPath/$md5.png";
        copy($pageImage, $target);

        // 生成insert的数据
        $data = [
            'userId' => $userId, 'mediaId' => $mediaId, 'mangaId' => $mangaId, 'chapterId' => $chapterId, 'page' => $page, 'pageImage' => $pageImage, 'browseType' => $browseType
        ];

        return BookMarkSql::add($data);
    }
    /**
     * @description: 删除书签
     * @param {Request} $request
     * @return {*}
     */
    public function remove(Request $request)
    {
        $bookmarkId = $request->post('bookmarkId');
        return BookMarkSql::remove($bookmarkId);
    }
}
