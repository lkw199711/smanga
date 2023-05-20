<?php
/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-13 15:49:55
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-17 23:49:23
 * @FilePath: \lar-demo\app\Models\Chapter.php
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChapterSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'chapter';
    protected $primaryKey = 'chapterId';
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
     * @description: 获取漫画章节列表-分页
     * @param {*} $userId
     * @param {*} $page
     * @return {*}
     */
    public static function get($mangaId, $page, $pageSize, $order)
    {
        $orderText = self::get_order_text($order);

        $res = self::where('mangaId', $mangaId)
            ->orderByRaw($orderText)
            ->paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 获取全部章节-管理用
     * @param {*} $mediaLimit
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get_nomanga($mediaLimit, $page = 1, $pageSize = 10)
    {
        $res = self::whereNotIn('mediaId', $mediaLimit)->paginate($pageSize, ['*'], 'page', $page);
        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 新增章节
     * @param {*} $data
     * @return {*}
     */
    public static function add($data){
        try {
            return self::create($data);
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 搜索章节
     * @param {*} $keyWord
     * @param {*} $mediaLimit
     * @param {*} $order
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function chapter_search($keyWord, $mediaLimit, $order, $page, $pageSize)
    {
        $orderText = self::get_order_text($order);

        $res = self::whereNotIn('mediaId', $mediaLimit)
            ->where('chapterName', 'like', "%{$keyWord}%")
            ->orderByRaw($orderText)
            ->paginate($pageSize, ['*'], 'page', $page);

        return ['code' => 0, 'text' => '获取成功', 'list' => $res];
    }
    /**
     * @description: 修改章节信息
     * @param {*} $chapterId
     * @param {*} $data
     * @return {*}
     */
    public static function chapter_update($chapterId, $data)
    {
        try {
            return ['code' => 0, 'message' => '修改成功', 'request' => self::where('chapterId', $chapterId)->update($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 删除章节记录
     * @param {*} $chapterId
     * @return {*}
     */
    public static function chapter_delete($chapterId)
    {
        try {
            return ['code' => 0, 'message' => '删除成功', 'request' => self::where('chapterId', $chapterId)->delete()];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 根据路径删除章节
     * @param {*} $pathId
     * @return {*}
     */
    public static function chapter_delete_by_path($pathId)
    {
        try {
            self::where('pathId', $pathId)->delete();
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 根据漫画id删除章节
     * @param {*} $chapterId
     * @return {*}
     */
    public static function chapter_delete_by_manga($mangaId)
    {
        try {
            self::where('mangaId', $mangaId)->delete();
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 根据媒体库id删除章节
     * @param {*} $mediaId
     * @return {*}
     */
    public static function chapter_delete_by_media($mediaId)
    {
        try {
            self::where('mediaId', $mediaId)->delete();
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 转换排序参数
     * @param {*} $order
     * @return {*}
     */
    private static function get_order_text($order)
    {
        $orderText = $order;
        if (array_search($order, ['id', 'idDesc']) !== false) {
            $orderText = 'chapterId';
        }
        if (array_search($order, ['name', 'nameDesc']) !== false) {
            $orderText = 'CAST(chapterName AS DECIMAL)';
        }
        if (array_search($order, ['time', 'timeDesc']) !== false) {
            $orderText = 'createTime';
        }

        $desc = preg_match('/Desc$/', $order) ? 'DESC' : 'ASC';

        return $orderText . ' ' . $desc;
    }
}
