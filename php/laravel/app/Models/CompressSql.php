<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-18 22:49:20
 * @FilePath: /php/laravel/app/Models/CompressSql.php
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompressSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'compress';
    protected $primaryKey = 'compressId';
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
     * @description: 获取转换记录
     * @param {*} $mediaLimit
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get($mediaLimit, $page, $pageSize)
    {
        $res = self::whereNotIn('mediaId', $mediaLimit)->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 根据章节id获取转换记录
     * @param {*} $chapterId
     * @return {*}
     */
    public static function compress_get_by_chapter($chapterId)
    {
        return self::where('chapterId', $chapterId)->first();
    }
    /**
     * @description: 新增转换记录
     * @param {*} $data
     * @return {*}
     */
    public static function add($data)
    {
        try {
            return ['code' => 0, 'message' => '新增成功', 'request' => self::create($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 修改转换记录
     * @param {*} $data
     * @return {*}
     */
    public static function compress_update($chapterId, $data)
    {
        try {
            return ['code' => 0, 'message' => '修改成功', 'request' => self::where('chapterId', $chapterId)->update($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 删除转换记录
     * @param {*} $compressId
     * @return {*}
     */
    public static function compress_delete($compressId)
    {
        try {
            return ['code' => 0, 'message' => '删除成功', 'request' => self::where('compressId', $compressId)->delete()];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
}
