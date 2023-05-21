<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 17:41:17
 * @FilePath: /php/laravel/app/Models/Config.php
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfigSql

extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'config';
    protected $primaryKey = 'configId';
    protected $guarded = [];
    public $timestamps = true;

    const CREATED_AT = 'createTime';
    const UPDATED_AT = 'updateTime';

    /**
     * @description: 获取用户配置信息
     * @param {*} $userId
     * @return {*}
     */
    public static function get($userId)
    {
        $res = self::where('userId', $userId)->first();

        if ($res) {
            return ['code' => 0, 'configValue' => $res->configValue];
        } else {
            return ['code' => 1, 'text' => '无用户配置数据', 'sqlRes' => $res];
        }
    }
    /**
     * @description: 设置用户配置
     * @param {*} $data
     * @return {*}
     */
    public static function set($userId, $data)
    {
        try {
            return ['code' => 0, 'message' => '保存成功', 'sqlRes' => self::updateOrCreate(['userId' => $userId], $data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'message' => '系统错误', 'eMsg' => $e->getMessage()];
        }
    }
}
