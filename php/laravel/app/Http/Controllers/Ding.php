<?php
/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-04 21:19:39
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-13 23:03:11
 * @FilePath: \lar-demo\app\Http\Controllers\Ding.php
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

namespace App\Http\Controllers;

use App\Models\BookMark;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class Ding extends Controller
{

    public function test()
    {
        dump("112123");
    }

    public function dbtest()
    {
        // $list = DB::select("select * from manga");
        // $list = DB::table("media")->value('mediaName');
        $list = DB::table('version')->where('versionId','>',72)->where('versionId','<',75)->get();
        dump ($list);
    }

    public function get_bookmark(Request $request)
    {
        $userId = $request->post('userId');
        $page = $request->input('page');
        $list = BookMark::get($userId,$page);

        return ['code' => 0, 'list' => $list, 'message' => '请求成功', 'userId' => $userId];
    }
}
