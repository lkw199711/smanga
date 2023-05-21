<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-14 16:46:50
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-14 20:44:53
 * @FilePath: /php/laravel/app/Http/Controllers/User.php
 */

namespace App\Http\Controllers;

use App\Models\UserSql;
use App\Models\LoginSql;
use Illuminate\Http\Request;

class User extends Controller
{
    /**
     * @description: 登录
     * @param {Request} $request
     * @return {*}
     */
    public function login(Request $request)
    {
        $userName = $request->post('userName');
        $passWord = $request->post('passWord');
        $ip = $_SERVER['REMOTE_ADDR'];
        $passMd5 = md5($passWord);

        $userInfo = UserSql::get_info_by_name($userName);

        if ($userInfo) {
            if (strtolower($userInfo->passWord) === strtolower($passMd5)) {
                // 登录成功
                $data = ['userId' => $userInfo->userId, 'userName' => $userName, 'nickName' => $userInfo->nickName, 'request' => 0, 'ip' => $ip];
                // 记录登录表
                LoginSql::add($data);
                // 返回信息
                return ['code' => 0, 'message' => '登陆成功', 'userInfo' => $userInfo];
            } else {
                // 密码错误
                $data = ['userId' => $userInfo->userId, 'userName' => $userName, 'nickName' => $userInfo->nickName, 'request' => 1, 'ip' => $ip];
                // 记录登录表
                LoginSql::add($data);
                // 返回信息
                return ['code' => 1, 'message' => '密码错误'];
            }
        } else {
            // 用户名不存在
            $data = ['request' => 2, 'ip' => $ip];
            LoginSql::add($data);

            return ['code' => 1, 'message' => '用户名不存在'];
        }
    }
    /**
     * @description: 获取用户列表
     * @param {Request} $request
     * @return {*}
     */
    public function get(Request $request)
    {
        $page = $request->post('page');
        $pageSize = $request->post('pageSize');
        return UserSql::get($page, $pageSize);
    }
    /**
     * @description: 新增用户
     * @param {Request} $request
     * @return {*}
     */
    public function add(Request $request)
    {
        $userName = $request->post('userName');
        $passWord = $request->post('passWord');
        $passMd5 = md5($passWord);

        $userInfo = UserSql::get_info_by_name($userName);

        if ($userInfo) {
            return ['code' => 1, 'message' => '此用户名已被注册'];
        } else {
            $data = ['userName' => $userName, 'passWord' => $passMd5];
            return UserSql::add($data);
        }
    }
    /**
     * @description: 修改用户信息
     * @param {Request} $request
     * @return {*}
     */
    public function update(Request $request)
    {
        $targetUserId = $request->post('targetUserId');
        $userName = $request->post('userName');
        $passWord = $request->post('passWord');
        $editUser = $request->post('editUser');
        $editMedia = $request->post('editMedia');
        $mediaLimit = $request->post('mediaLimit');
        $passMd5 = md5($passWord);

        $data = ['userName' => $userName, 'editUser' => $editUser, 'editMedia' => $editMedia, 'mediaLimit' => $mediaLimit];

        // 有设置密码则变更密码
        if ($passWord) {
            $data['passWord'] = $passMd5;
        }

        return UserSql::user_update($targetUserId, $data);
    }
    public function delete(Request $request)
    {
        $targetUserId = $request->post('targetUserId');

        return UserSql::user_delete($targetUserId);
    }
}
