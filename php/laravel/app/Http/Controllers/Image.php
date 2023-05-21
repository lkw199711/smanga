<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-16 22:28:29
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-16 22:33:33
 * @FilePath: /php/laravel/app/Http/Controllers/Image.php
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class Image extends Controller
{
    public function get(Request $request)
    {
        $file = $request->post('file');

        if (!is_file($file)) {
            return ['code' => 1, 'status' => 'image error', 'message' => '图片路径错误'];
        }

        return file_get_contents($file);
    }
}
