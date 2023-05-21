<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-18 01:56:35
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-22 00:00:52
 * @FilePath: /php/laravel/app/Jobs/Compress.php
 */

namespace App\Jobs;

use App\Http\Controllers\Utils;
use App\Models\ChapterSql;
use App\Models\CompressSql;
use App\Models\MangaSql;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class Compress implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $userId;
    private $chapterId;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($userId, $chapterId)
    {
        // 获取id
        $this->userId = $userId;
        $this->chapterId = $chapterId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // 设置脚本无限时间执行
        set_time_limit(0);
        // echo $userId;echo ' ';echo $chapterId;return false;
        $chapterInfo = DB::table('chapter')
            ->join('manga', 'manga.mangaId', 'chapter.mangaId')
            ->where('chapterId', $this->chapterId)
            ->first();

        // 设置日期路径
        $extractTo = self::get_cache_path($chapterInfo->chapterPath);

        $data = [
            'compressType' => $chapterInfo->chapterType,
            'compressPath' => $extractTo,
            'compressStatus' => 'uncompressed',
            'mediaId' => $chapterInfo->mediaId,
            'mangaId' => $chapterInfo->mangaId,
            'chapterId' => $chapterInfo->chapterId,
            'chapterPath' => $chapterInfo->chapterPath,
            'userId' => $this->userId
        ];

        $compressInfo = CompressSql::add($data);

        if ($compressInfo['code'] === 1) {
            echo "error 章节 “{$chapterInfo->chapterName}” 转化记录插入失败";
            return false;
        }

        // 文件夹不存在则创建
        if (!is_dir($extractTo)) mkdir($extractTo, 0755, true);

        // 更新解压信息-解压中
        CompressSql::compress_update($chapterInfo->chapterId, ['compressStatus' => 'compressing']);

        $imageCount = 0;
        if ($chapterInfo->chapterType == 'zip') {
            // 解压缩并获取文件总数据 (总数量包括文件夹与其他文件 仅具有参考意义)
            $imageCount = self::un_zip($chapterInfo->chapterPath, $extractTo);
        }

        if ($chapterInfo->chapterType == '7z') {
            $imageCount = self::un_7z($chapterInfo->chapterPath, $extractTo);
        }

        if ($chapterInfo->chapterType == 'rar') {
            $imageCount = self::un_rar($chapterInfo->chapterPath, $extractTo);
        }

        if ($chapterInfo->chapterType == 'pdf') {
            $imageCount = self::un_pdf($chapterInfo->chapterPath, $extractTo);
        }

        // 更新解压信息-解压完成
        CompressSql::compress_update($chapterInfo->chapterId, ['compressStatus' => 'compressed', 'imageCount' => $imageCount]);

        $poster = self::get_file_list($extractTo)[0];

        // 封面存放路径
        $posterPath = getenv('SMANGA_POSTER');
        $copyPoster = "$posterPath/$chapterInfo->chapterId.png";

        if ($poster) {
            copy($poster, $copyPoster);

            if (!$chapterInfo->mangaCover) {
                MangaSql::manga_update($chapterInfo->mangaId, ['mangaCover' => $copyPoster]);
            }
    
            if (!$chapterInfo->chapterCover) {
                ChapterSql::chapter_update($chapterInfo->chapterId, ['chapterCover' => $copyPoster]);
            }
        } else {
            echo "error 漫画 {$chapterInfo->chapteName} 封面获取失败";
        }

        Utils::socket_send_array($this->userId, 0, '解压完成', $chapterInfo->mangaName . ':\n\r' . $chapterInfo->chapterName);
    }
    /**
     * @description: md5加密生成缓存路径
     * @param {*} $path
     * @return {*}
     */
    private static function get_cache_path($path)
    {
        $cacheBasePath = getenv('SMANGA_COMPRESS');
        #设置日期路径
        $date = '/' . date('Y') . '/' . date('m') . '/' . date('d') . '/';
        $md5 = md5($path);

        return $cacheBasePath . $date . $md5;
    }
    /**
     * @description: 读取ini文件
     * @param {*} $title
     * @param {*} $key
     * @return {*}
     */
    function read_ini_compress($title, $key)
    {
        // INI配置文件
        $file = getenv('SMANGA_CONFIG_INI');

        if (!$file) {
            die(json_encode([
                'code' => 1,
                'message' => '环境变量错误'
            ]));
        }

        $data = filesize($file) == 0 ? [] : parse_ini_file($file, true);

        if (!$data[$title]) return false;
        if (!$data[$title][$key]) return false;

        return $data[$title][$key];
    }
    /**
     * @description: 解压zip
     * @param {*} $path
     * @param {*} $extractTo
     * @return {*}
     */
    private static function un_zip($path, $extractTo)
    {
        $count = '';
        //新建一个ZipArchive的对象
        $zip = new \ZipArchive();

        if ($zip->open($path) === TRUE) {
            // 统计文件总数
            $count = $zip->numFiles;
            //假设解压缩到在当前路径下images文件夹的子文件夹php
            $zip->extractTo($extractTo);
            //关闭处理的zip文件
            $zip->close();
        } else {
            exit;
        }

        return $count;
    }
    /**
     * @description: 解压rar
     * @param {*} $path
     * @param {*} $extractTo
     * @return {*}
     */
    private static function un_rar($path, $extractTo)
    {

        $command = "unrar e -r \"$path\" \"$extractTo\"";

        shell_exec($command);

        $count = count(self::get_file_list($extractTo));

        return $count;
    }
    /**
     * @description: 解压7z
     * @param {*} $path
     * @param {*} $extractTo
     * @return {*}
     */
    private static function un_7z($path, $extractTo)
    {
        $command = "7za x '$path' -r -o'$extractTo'";

        shell_exec($command);

        $count = count(self::get_file_list($extractTo));

        return $count;
    }
    /**
     * @description: 解压pdf
     * @param {*} $path
     * @param {*} $extractTo
     * @return {*}
     */
    private static function un_pdf($path, $extractTo)
    {
        // 内存 1gb
        $memory = self::read_ini_compress('imagick', 'memory');
        // 缓存 1gb
        $map = self::read_ini_compress('imagick', 'map');
        // 每英寸的像素数 100-300
        $density = self::read_ini_compress('imagick', 'density');
        // 压缩比 100
        $quality = self::read_ini_compress('imagick', 'quality');

        $command = "convert -limit memory $memory -limit map $map -density $density -quality $quality '$path' '$extractTo/x-%05d.jpg'";

        shell_exec($command);

        $count = count(self::get_file_list($extractTo));

        return $count;
    }
    /**
     * @description: 遍历目录-单层
     * @param {*} $path
     * @return {*}
     */
    private static function get_file_list($path)
    {
        $list = array();
        $dir = dir($path);

        while (($file = $dir->read()) !== false) {
            if ($file == '.' || $file == '..') continue;

            $route = $path . "/" . $file;

            // 添加图片
            if (Utils::is_img($route)) {
                array_push($list, $route);
            }
            // 遍历所有路径
            if (is_dir($route)) {
                $list = array_merge($list, self::get_file_list($route));
            }
        }

        $dir->close();

        sort($list, SORT_NATURAL | SORT_FLAG_CASE);

        return $list;
    }
}
