<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-17 22:44:24
 * @FilePath: /php/laravel/app/Models/Media.php
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'media';
    protected $primaryKey = 'mediaId';
    protected $guarded = [];
    protected $hidden = [];
    public $timestamps = true;

    const CREATED_AT = 'createTime';
    const UPDATED_AT = 'updateTime';

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
     * @description: 获取媒体库列表
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get($page, $pageSize, $mediaLimit)
    {
        $res = self::whereNotIn('mediaId', $mediaLimit)->paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 无限制获取数据库列表
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get_nolimit($page, $pageSize)
    {
        $res = self::paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 新增媒体库
     * @param {*} $data
     * @return {*}
     */
    public static function add($data)
    {
        try {
            return ['code' => 0, 'message' => '添加成功', 'request' => self::create($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 修改媒体库信息
     * @param {*} $mediaId
     * @param {*} $data
     * @return {*}
     */
    public static function media_update($mediaId, $data)
    {
        try {
            return ['code' => 0, 'message' => '修改成功', 'sqlRes' => self::where('mediaId', $mediaId)->update($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 删除媒体库
     * @param {*} $mediaId
     * @return {*}
     */
    public static function media_delete($mediaId){
        try {
            self::where('mediaId', $mediaId)->delete();
            MangaSql::manga_delete_by_media($mediaId);
            return ['code' => 0, 'message' => '删除成功'];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
}
