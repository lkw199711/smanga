<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 11:17:02
 * @FilePath: /php/laravel/app/Models/PathSql.php
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PathSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'path';
    protected $primaryKey = 'pathId';
    protected $guarded = [];
    public $timestamps = true;

    const CREATED_AT = 'createTime';
    /**
     * 表中仅有createTime字段 重新setUpdatedAt方法置空操作 解决报错
     */
    public function setUpdatedAt($value)
    {
    }
    /**
     * @description: 格式化日期
     * @param {DateTimeInterface} $date
     * @return {*}
     */
    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
    /**
     * @description: 获取媒体库的路径
     * @param {*} $mediaId
     * @return {*}
     */
    public static function get($mediaId)
    {
        $list = self::where('mediaId', $mediaId)->get();
        return ['code' => 0, 'list' => $list, 'text' => '请求成功'];
    }
    /**
     * @description: 获取所有的路径
     * @param {*} $mediaLimit
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get_nomedia($mediaLimit, $page = 1, $pageSize = 10)
    {
        $list = self::whereNotIn('mediaId', $mediaLimit)->paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'list' => $list, 'text' => '请求成功'];
    }
    /**
     * @description: 新增路径
     * @param {*} $data
     * @return {*}
     */
    public static function add($data)
    {
        try {
            return ['code' => 0, 'message' => '新增成功', 'info' => self::create($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 删除路径记录
     * @param {*} $pathId
     * @return {*}
     */
    public static function path_delete($pathId)
    {
        try {
            MangaSql::manga_delete_by_path($pathId);
            ChapterSql::chapter_delete_by_path($pathId);
            return ['code' => 0, 'message' => '删除成功', 'request' => self::destroy($pathId)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 获取路径信息
     * @param {*} $mediaId
     * @param {*} $path
     * @return {*}
     */
    public static function info($mediaId, $path)
    {
        return self::where('mediaId', $mediaId)->where('path', $path)->first();
    }
}
