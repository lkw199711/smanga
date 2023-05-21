<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-18 01:30:34
 * @FilePath: /php/laravel/app/Models/MangaSql.php
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MangaSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'manga';
    protected $primaryKey = 'mangaId';
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
     * @description: 获取漫画列表
     * @param {*} $page
     * @param {*} $pageSize
     * @param {*} $mediaLimit
     * @return {*}
     */
    public static function get($page, $pageSize, $mediaId, $mediaLimit)
    {
        $res = self::where('mediaId', $mediaId)
            ->whereNotIn('mediaId', $mediaLimit)
            ->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 获取全部媒体库的漫画
     * @param {*} $page
     * @param {*} $pageSize
     * @param {*} $mediaLimit
     * @return {*}
     */
    public static function get_nomedia($page, $pageSize, $mediaLimit)
    {
        $res = self::whereNotIn('mediaId', $mediaLimit)->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 无限制获取漫画列表
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get_nolimit($page, $pageSize, $mediaId)
    {
        $res = self::where('mediaId', $mediaId)->paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 新增漫画
     * @param {*} $data
     * @return {*}
     */
    public static function add($data){
        try {
            return ['code' => 0, 'message' => '添加成功', 'request'=> self::create($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 搜索漫画
     * @param {*} $keyWord
     * @param {*} $mediaId
     * @param {*} $mediaLimit
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function manga_search($keyWord, $mediaLimit, $order, $page, $pageSize)
    {
        $res = self::whereNotIn('mediaId', $mediaLimit)
            ->where('mangaName', 'like', "%{$keyWord}%")
            ->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 修改漫画信息
     * @param {*} $mangaId
     * @param {*} $data
     * @return {*}
     */
    public static function manga_update($mangaId, $data)
    {
        try {
            return ['code' => 0, 'message' => '修改成功', 'request' => self::where('mangaId', $mangaId)->update($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 移除漫画
     * @param {*} $mangaId
     * @return {*}
     */
    public static function manga_delete($mangaId)
    {
        try {
            self::where('mangaId', $mangaId)->delete();
            
            // 删除相关章节
            ChapterSql::chapter_delete_by_manga($mangaId);

            return ['code' => 0, 'message' => '删除成功'];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 根据路径删除漫画
     * @param {*} $pathId
     * @return {*}
     */
    public static function manga_delete_by_path($pathId){
        try {
            self::where('pathId', $pathId)->delete();
            ChapterSql::chapter_delete_by_path($pathId);
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 根据媒体库id删除漫画
     * @param {*} $mediaId
     * @return {*}
     */
    public static function manga_delete_by_media($mediaId){
        try {
            self::where('mediaId', $mediaId)->delete();
            ChapterSql::chapter_delete_by_media($mediaId);
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
}
