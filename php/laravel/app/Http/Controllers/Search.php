<?php

namespace App\Http\Controllers;

use App\Models\ChapterSql;
use App\Models\MangaSql;
use App\Models\UserSql;
use Illuminate\Http\Request;

class Search extends Controller
{
    /**
     * @description: 获取漫画列表
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        // 接受参数
        $userId = $request->post('userId');
        $searchText = $request->post('searchText');
        $searchType = $request->post('searchType');
        $searchType = $request->post('searchType');
        $order = $request->post('order');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');

        $mediaLimit = UserSql::get_media_limit($userId);

        if ($searchType === 'manga') {
            return MangaSql::manga_search($searchText, $mediaLimit, $order, $page, $pageSize);
        } 
        
        if ($searchType === 'chapter') {
            return ChapterSql::chapter_search($searchText, $mediaLimit, $order, $page, $pageSize);
        }
    }
}
