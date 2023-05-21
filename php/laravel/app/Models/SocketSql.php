<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-21 20:54:48
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 22:28:18
 * @FilePath: /php/laravel/app/Models/SocketSql.php
 */

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocketSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'socket';
    protected $primaryKey = 'socketId';
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
     * @description: 新增长连接
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
    public static function socket_update($fd, $data)
    {
        try {
            return ['code' => 0, 'message' => '修改成功', 'request' => self::updateOrCreate(['fd' => $fd], $data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }

    /**
     * @description: 移除长连接
     * @param {*} $socketId
     * @return {*}
     */
    public static function socket_delete($fd)
    {
        try {
            self::where('fd', $fd)->delete();
            return ['code' => 0, 'message' => '删除成功'];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    /**
     * @description: 根据用户id获取链接
     * @param {*} $userId
     * @return {*}
     */
    public static function get_fd_by_user($userId)
    {
        try {
            $list = self::where('userId', $userId)->get();

            // 取出fd
            $fds = [];

            foreach($list as $value){
                array_push($fds,$value->fd);
            }

            return ['code' => 0, 'message' => '获取成功', 'fds' => $fds];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
    public static function clear()
    {
        try {
            self::query()->delete();
            return ['code' => 0, 'message' => '删除成功'];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
}
