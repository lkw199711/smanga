<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 17:24:44
 * @FilePath: /php/laravel/app/Models/Login.php
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginSql extends Model
{
    use HasFactory;
    /**
     * 与模型关联的表名
     *
     * @var string
     */
    protected $table = 'login';
    protected $primaryKey = 'loginId';
    protected $guarded = [];
    public $timestamps = true;

    const CREATED_AT = 'loginTime';
    /**
     * 表中仅有createTime字段 重新setUpdatedAt方法置空操作 解决报错
     */
    public function setUpdatedAt($value)
    {
    }
    /**
     * @description: 新增登录记录
     * @param {*} $data
     * @return {*}
     */
    public static function add($data)
    {
        try {
            return ['code' => 0, 'successful'=>true, 'sqlRes' => self::create($data)];
        } catch (\Exception $e) {
            return ['code' => 1, 'successful'=>false, 'eMsg' => $e->getMessage()];
        }
    }
}
