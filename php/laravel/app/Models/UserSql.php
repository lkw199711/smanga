<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-14 16:59:00
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 21:04:07
 * @FilePath: /php/laravel/app/Models/UesrSql.php
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSql extends Model
{
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'user';
    protected $primaryKey = 'userId';
    protected $guarded = [];
    protected $hidden = [
        'passWord',
    ];
    public $timestamps = true;

    const CREATED_AT = 'registerTime';
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
     * @description: 或许用户列表
     * @param {*} $page
     * @param {*} $pageSize
     * @return {*}
     */
    public static function get($page, $pageSize)
    {
        return ['code' => 0, 'text' => '获取成功', 'list' => self::paginate($pageSize, ['*'], 'page', $page)];
    }
    /**
     * @description: 检查用户是否存在
     * @param {*} $userName
     * @return {*}
     */
    public static function get_info_by_name($userName)
    {
        return self::where('userName', $userName)->first();
    }
    /**
     * @description: 用户注册
     * @param {*} $data
     * @return {*}
     */
    public static function add($data)
    {
        try {
            return ['code' => 0, 'successful' => true, 'sqlRes' => self::create($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'successful' => false, 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 修改用户信息
     * @param {*} $userId
     * @param {*} $data
     * @return {*}
     */
    public static function user_update($userId, $data)
    {
        try {
            return ['code' => 0, 'message' => '修改成功', 'sqlRes' => self::where('userId',$userId)->update($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    public static function user_delete($userId){
        try {
            return ['code' => 0, 'message' => '删除成功', 'sqlRes' => self::where('userId',$userId)->delete()];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 获取媒体库限制
     * @param {*} $userId
     * @return {*}
     */
    public static function get_media_limit($userId){
        $text = self::where('userId',$userId)->first()->mediaLimit;
        return explode('/',$text);
    }
}
