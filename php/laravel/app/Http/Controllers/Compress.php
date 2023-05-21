<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-16 03:04:27
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-16 03:29:36
 * @FilePath: /php/laravel/app/Http/Controllers/Compress.php
 */

namespace App\Http\Controllers;

use App\Models\UserSql;
use App\Models\CompressSql;
use Illuminate\Http\Request;

class Compress extends Controller
{
    /**
     * @description: 获取转换列表
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        // 接受参数
        $userId = $request->post('userId');
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');

        $mediaLimit = UserSql::get_media_limit($userId);

        return CompressSql::get($mediaLimit, $page, $pageSize);
    }
    /**
     * @description: 新增转换记录
     * @return {*}
     */
    public function add()
    {
        $data = [];
        return CompressSql::add($data);
    }
    /**
     * @description: 修改转换记录
     * @return {*}
     */
    public function update()
    {
        $data = [];
        return CompressSql::compress_update($data);
    }
    /**
     * @description: 删除转换记录
     * @param {*} $compressId
     * @return {*}
     */
    public function delete(Request $request)
    {
        $compressId = $request->post('compressId');
        return CompressSql::compress_delete($compressId);
    }
}
