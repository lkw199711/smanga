<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-17 02:36:55
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-17 03:18:10
 * @FilePath: /php/laravel/app/Http/Controllers/Test.php
 */

namespace App\Http\Controllers;

use App\Jobs\Scan;
use Illuminate\Http\Request;

class Test extends Controller
{
    public function get(){
        Scan::dispatch(123);//->onQueue('scan');
    }
}
