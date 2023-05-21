<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-19 22:11:32
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 13:46:50
 * @FilePath: /php/laravel/routes/deploy.php
 */

use Illuminate\Support\Facades\Route;

Route::post('deploy/database-test', [App\Http\Controllers\Deploy::class, 'database_test']);
Route::post('deploy/database-get', [App\Http\Controllers\Deploy::class, 'database_get']);
Route::post('deploy/database-set', [App\Http\Controllers\Deploy::class, 'database_set']);
Route::post('deploy/database-init', [App\Http\Controllers\Deploy::class, 'database_init']);

// 登录接口无验证
Route::any('user/login', [App\Http\Controllers\User::class, 'login']);

Route::any('info',  function(){
    return phpinfo();
});

use Illuminate\Support\Facades\DB;
Route::any('datatest', function () {
    dump(DB::table('version')->get());
});