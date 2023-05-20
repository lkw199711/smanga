<?php

namespace App\Http\Controllers;

use App\Models\MediaSql;
use App\Models\UserSql;
use Illuminate\Http\Request;

class Media extends Controller
{
    /**
     * @description: 获取媒体库列表
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

        if ($mediaLimit) {
            return MediaSql::get($page, $pageSize, $mediaLimit);
        } else {
            return MediaSql::get_nolimit($page, $pageSize);
        }
    }
    /**
     * @description: 新增媒体库
     * @param {Request} $request
     * @return {*}
     */
    public function add(Request $request)
    {
        $mediaName = $request->post('mediaName');
        $mediaType = $request->post('mediaType');
        $directoryFormat = $request->post('directoryFormat');
        $fileType = $request->post('fileType');
        $defaultBrowse = $request->post('defaultBrowse');
        $removeFirst = $request->post('removeFirst');
        $direction = $request->post('direction');

        $data = [
            'mediaName' => $mediaName, 'mediaType' => $mediaType, 'directoryFormat' => $directoryFormat,
            'fileType' => $fileType, 'defaultBrowse' => $defaultBrowse, 'removeFirst' => $removeFirst, 'direction' => $direction
        ];

        return MediaSql::add($data);
    }
    /**
     * @description: 修改媒体库信息
     * @param {Request} $request
     * @return {*}
     */
    public function update(Request $request)
    {
        $mediaId = $request->post('mediaId');
        $mediaName = $request->post('mediaName');
        $mediaType = $request->post('mediaType');
        $directoryFormat = $request->post('directoryFormat');
        $fileType = $request->post('fileType');
        $defaultBrowse = $request->post('defaultBrowse');
        $removeFirst = $request->post('removeFirst');
        $direction = $request->post('direction');

        $data = [
            'mediaName' => $mediaName, 'mediaType' => $mediaType, 'directoryFormat' => $directoryFormat,
            'fileType' => $fileType, 'defaultBrowse' => $defaultBrowse, 'removeFirst' => $removeFirst, 'direction' => $direction
        ];

        return MediaSql::media_update($mediaId, $data);
    }
    public function delete(Request $request){
        $mediaId = $request->post('mediaId');

        return MediaSql::media_delete($mediaId);
    }
}
