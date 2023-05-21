<?php
/*
 * @Author: lkw199711 lkw199711@163.com
 * @Date: 2023-05-04 20:56:21
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-18 02:07:45
 * @FilePath: \lar-demo\routes\web.php
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

use App\Http\Controllers\Ding;
use Illuminate\Http\Request;

Route::get('d1', [Ding::class, 'test']);
Route::get('d2', [Ding::class, 'dbtest']);
Route::any('d3', [Ding::class, 'get_bookmark']);
// 书签
Route::any('bookmark/get', [App\Http\Controllers\BookMark::class, 'get']);
Route::any('bookmark/add', [App\Http\Controllers\BookMark::class, 'add']);
Route::any('bookmark/remove', [App\Http\Controllers\BookMark::class, 'remove']);
// 收藏
Route::any('collect/get', [App\Http\Controllers\Collect::class, 'get']);
Route::any('collect/add', [App\Http\Controllers\Collect::class, 'add']);
Route::any('collect/remove', [App\Http\Controllers\Collect::class, 'remove']);
Route::any('collect/is-collect', [App\Http\Controllers\Collect::class, 'is_collect']);
// 用户
Route::any('user/config/get', [App\Http\Controllers\Config::class, 'get']);
Route::any('user/config/set', [App\Http\Controllers\Config::class, 'set']);

Route::any('user/get', [App\Http\Controllers\User::class, 'get']);
Route::any('user/register', [App\Http\Controllers\User::class, 'add']);
Route::any('user/update', [App\Http\Controllers\User::class, 'update']);
Route::any('user/delete', [App\Http\Controllers\User::class, 'delete']);
// 历史记录
Route::any('history/get', [App\Http\Controllers\History::class, 'get']);
Route::any('history/add', [App\Http\Controllers\History::class, 'add']);
Route::any('history/delete', [App\Http\Controllers\History::class, 'delete']);
// 媒体库
Route::any('media/get', [App\Http\Controllers\Media::class, 'get']);
Route::any('media/add', [App\Http\Controllers\Media::class, 'add']);
Route::any('media/update', [App\Http\Controllers\Media::class, 'update']);
Route::any('media/delete', [App\Http\Controllers\Media::class, 'delete']);
// 漫画
Route::any('manga/get', [App\Http\Controllers\Manga::class, 'get']);
Route::any('manga/add', [App\Http\Controllers\Manga::class, 'add']);
Route::any('manga/update', [App\Http\Controllers\Manga::class, 'update']);
Route::any('manga/delete', [App\Http\Controllers\Manga::class, 'delete']);
// 章节
Route::any('chapter/get', [App\Http\Controllers\Chapter::class, 'get']);
Route::any('chapter/add', [App\Http\Controllers\Chapter::class, 'add']);
Route::any('chapter/update', [App\Http\Controllers\Chapter::class, 'update']);
Route::any('chapter/delete', [App\Http\Controllers\Chapter::class, 'delete']);
// 版本
Route::any('version/get', [App\Http\Controllers\Version::class, 'get']);
// 路径
Route::any('path/get', [App\Http\Controllers\Path::class, 'get']);
Route::any('path/add', [App\Http\Controllers\Path::class, 'add']);
Route::any('path/delete', [App\Http\Controllers\Path::class, 'delete']);
Route::any('path/scan', [App\Http\Controllers\Path::class, 'scan']);
// 转换
Route::any('compress/get', [App\Http\Controllers\Compress::class, 'get']);
Route::any('compress/add', [App\Http\Controllers\Compress::class, 'add']);
Route::any('compress/update', [App\Http\Controllers\Compress::class, 'update']);
Route::any('compress/delete', [App\Http\Controllers\Compress::class, 'delete']);
// 搜索
Route::any('search/get', [App\Http\Controllers\Search::class, 'get']);
// 图片
Route::any('image/get', [App\Http\Controllers\Image::class, 'get']);


Route::any('test', function (Request $request) {
    $pathId = $request->post('pathId');
    App\Jobs\Scan::dispatch($pathId);
});
Route::any('test', [App\Http\Controllers\Test::class, 'get']);
Route::any('path/scan', [App\Http\Controllers\Path::class, 'scan']);
Route::any('path/rescan', [App\Http\Controllers\Path::class, 'rescan']);
Route::any('chapter/image', [App\Http\Controllers\Chapter::class, 'image_list']);
