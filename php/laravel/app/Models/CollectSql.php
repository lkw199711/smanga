<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 02:04:46
 * @FilePath: /php/laravel/app/Models/CollectSql.php
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'collect';
    protected $primaryKey = 'collectId';
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
     * @description: 获取漫画收藏列表
     * @param {*} $userId
     * @param {*} $page
     * @return {*}
     */
    public static function get_manga($userId, $page = 1, $pageSize = 10)
    {
        $list = self::join('manga', 'collect.mangaId', 'manga.mangaId')
            ->where('userId', '=', $userId)
            ->where('collectType', 'manga')
            ->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'list' => $list, 'text' => '请求成功'];
    }
    /**
     * @description: 获取章节收藏
     * @param {*} $userId
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get_chapter($userId, $page = 1, $pageSize = 10)
    {
        $list = self::join('manga', 'collect.mangaId', 'manga.mangaId')
            ->join('chapter', 'collect.chapterId', 'chapter.chapterId')
            ->where('userId', $userId)
            ->where('collectType', 'chapter')
            ->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'list' => $list, 'text' => '请求成功'];
    }
    /**
     * @description: 获取全部收藏
     * @param {*} $page
     * @return {*}
     */
    public static function all($page = 1, $pageSize = 10)
    {
        $list = self::paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'list' => $list, 'text' => '请求成功'];
    }
    /**
     * @description: 新增收藏
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
     * @description: 移除收藏
     * @param {*} $collectId
     * @return {*}
     */
    public static function remove($collectId)
    {
        try {
            return ['code' => 0, 'message' => '删除成功', 'request' => self::destroy($collectId)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 删除漫画收藏
     * @param {*} $userId
     * @param {*} $mangaId
     * @return {*}
     */
    public static function remove_manga($userId, $mangaId)
    {
        try {
            $res = self::where('userId', $userId)->where('collectType', 'manga')->where('mangaId', $mangaId)->delete();
            return ['code' => 0, 'message' => '删除成功', 'request' => self::destroy($res)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 删除章节收藏
     * @param {*} $userId
     * @param {*} $chapterId
     * @return {*}
     */
    public static function remove_chapter($userId, $chapterId)
    {
        try {
            $res = self::where('userId', $userId)->where('collectType', 'chapter')->where('chapterId', $chapterId)->delete();
            return ['code' => 0, 'message' => '删除成功', 'request' => self::destroy($res)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 验证漫画是否收藏
     * @param {*} $userId
     * @param {*} $mangaId
     * @return {*}
     */
    public static function is_manga_collected($userId, $mangaId)
    {
        $res = self::where('userId', $userId)->where('collectType', 'manga')->where('mangaId', $mangaId)->first();
        return ['code' => 0, 'isCollect' => !!$res, 'collectInfo' => $res];
    }
    /**
     * @description: 验证章节是否收藏
     * @param {*} $userId
     * @param {*} $chapterId
     * @return {*}
     */
    public static function is_chapter_collected($userId, $chapterId)
    {
        $res = self::where('userId', $userId)->where('collectType', 'chapter')->where('chapterId', $chapterId)->first();
        return ['code' => 0, 'isCollect' => !!$res, 'collectInfo' => $res];
    }
}
