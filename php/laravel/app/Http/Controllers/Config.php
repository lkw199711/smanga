<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-13 20:17:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 12:39:13
 * @FilePath: /php/laravel/app/Http/Controllers/Config.php
 */

namespace App\Http\Controllers;

use App\Models\ConfigSql;
use Illuminate\Http\Request;

class Config extends Controller
{
    /**
     * @description: 获取用户配置信息
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        $userId = $request->post('userId');
        return ConfigSql::get($userId);
    }
    /**
     * @description: 设置用户配置
     * @param {Request} $request
     * @return {*}
     */
    public function set(Request $request)
    {
        $userId = $request->post('userId');
        $userName = $request->post('userName');
        $configValue = $request->post('configValue');
        return ConfigSql::set($userId, ['userId' => $userId, 'userName' => $userName, 'configValue' => $configValue]);
    }
}
