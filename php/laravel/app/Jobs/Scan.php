<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-16 23:33:11
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 11:55:16
 * @FilePath: /php/laravel/app/Jobs/Scan.php
 */

namespace App\Jobs;

use App\Http\Controllers\Utils;
use App\Models\ChapterSql;
use App\Models\MangaSql;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class Scan implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $pathId;
    private $path;
    private $mediaId;
    // 浏览方式
    private $defaultBrowse;
    // 媒体类型
    private $mediaType;
    // 目录类型
    private $directoryFormat;
    // 阅读朝向
    private $direction;
    // 移除首页
    private $removeFirst;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($pathId)
    {
        // 获取需要扫描的目录id
        $this->pathId = $pathId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // 获取路径信息
        $pathInfo = DB::table('path')
            ->join('media', 'media.mediaId', 'path.mediaId')
            ->where('pathId', $this->pathId)
            ->first();

        $this->path = $pathInfo->path;
        $this->mediaId = $pathInfo->mediaId;
        $this->defaultBrowse = $pathInfo->defaultBrowse;
        $this->mediaType = $pathInfo->mediaType;
        $this->directoryFormat = $pathInfo->directoryFormat;
        $this->direction = $pathInfo->direction;
        $this->removeFirst = $pathInfo->removeFirst;

        // 是否扫描二级目录
        if ($this->directoryFormat == 1) {
            self::scan_second_path();
        } else {
            self::scan_path($this->path);
        }
    }

    /**
     * @description: 扫描多层级目录
     * @return {*}
     */
    protected function scan_second_path()
    {
        $mangaList = self::get_manga_list($this->path);
        foreach ($mangaList as $key => $value) {
            scan_path($value['path'], $this->pathId, $this->mediaId);
        }
    }
    /**
     * @description: 扫描目录
     * @param {*} $path
     * @return {*}
     */
    protected function scan_path($path)
    {

        // mysql插入值空置处理 (插入空字符串会报错)
        $this->direction = $this->direction ? $this->direction : 1;
        $this->removeFirst = $this->removeFirst ? $this->removeFirst : 0;


        $mangaList = self::get_manga_list($path);

        foreach ($mangaList as $key => $value) {

            $mangaData = [
                'mediaId' => $this->mediaId,
                'pathId' => $this->pathId,
                'mangaName' => $value['name'],
                'mangaCover' => $value['poster'],
                'mangaPath' => $value['path'],
                'browseType' => $this->defaultBrowse,
                'direction' => $this->direction,
                'removeFirst' => $this->removeFirst
            ];

            if ($this->mediaType == 1) {
                // 单本漫画
                $mangaData['chaptercount'] = 1;
                // 插入漫画
                $mangaInfo = MangaSql::add($mangaData);
                
                if($mangaInfo['code']==1){
                    echo "error: 漫画 \"{$value['name']}\" 插入失败,请查询是否重复。{$mangaInfo['eMsg']}";
                    continue;
                }
                
                $chapterData = [
                    'mangaId' => $mangaInfo['request']->mangaId,
                    'mediaId' => $this->mediaId,
                    'pathId' => $this->pathId,
                    'chapterName' => $value['name'],
                    'chapterCover' => $value['poster'],
                    'chapterPath' => $value['path'],
                    'chapterType' => $value['type'],
                    'browseType' => $this->defaultBrowse
                ];

                ChapterSql::add($chapterData);
            } else {
                $chapterList = self::get_chapter_list($value['path']);
                // 普通结构
                $mangaData['chaptercount'] = count($chapterList);
                // 插入漫画
                $mangaInfo = MangaSql::add($mangaData);

                if($mangaInfo['code']==1){
                    echo "error: 漫画 \"{$value['name']}\" 插入失败,请查询是否重复。{$mangaInfo['eMsg']}";
                    continue;
                }

                // 插入章节
                foreach ($chapterList as $key => $value) {
                    $chapterData = [
                        'mangaId' => $mangaInfo['request']->mangaId,
                        'mediaId' => $this->mediaId,
                        'pathId' => $this->pathId,
                        'chapterName' => $value['name'],
                        'chapterCover' => $value['poster'],
                        'chapterPath' => $value['path'],
                        'chapterType' => $value['type'],
                        'browseType' => $this->defaultBrowse
                    ];

                    ChapterSql::add($chapterData);
                }
            }
        }
    }
    /**
     * @description: 扫描目录获取漫画列表
     * @param {*} $path
     * @return {*}
     */
    private function get_manga_list($path)
    {
        $list = array();
        $dir = dir($path);
        $type = 'image';

        while (($file = $dir->read()) !== false) {
            if ($file == '.' || $file == '..') continue;

            $targetPath = $path . "/" . $file;

            $posterName = $targetPath;
            // 是文件
            if (!is_dir($targetPath)) {
                if (preg_match('/(.cbr|.cbz|.zip|.epub)/i', $file)) {
                    $type = 'zip';
                } elseif (preg_match('/.7z/i', $file)) {
                    $type = '7z';
                } elseif (preg_match('/.rar/i', $file)) {
                    $type = 'rar';
                } elseif (preg_match('/.pdf/i', $file)) {
                    $type = 'pdf';
                } else {
                    continue;
                }

                $posterName = preg_replace('/(.cbr|.cbz|.zip|.7z|.rar|.pdf)/i', '', $posterName);
            };

            array_push($list, array(
                'name' => $file,
                'poster' => self::get_poster($targetPath, $posterName),
                'path' => $targetPath,
                'type' => $type,
            ));
        }

        $dir->close();

        array_multisort(array_column($list, 'name'), SORT_NATURAL | SORT_FLAG_CASE, $list);

        return $list;
    }

    /**
     * @description: 扫描目录获取章节列表
     * @param {*} $path
     * @return {*}
     */
    private function get_chapter_list($path)
    {
        $list = array();
        $dir = dir($path);
        $type = 'image';

        while (($file = $dir->read()) !== false) {
            if ($file == '.' || $file == '..') continue;

            $targetPath = $path . "/" . $file;

            $posterName = $targetPath;
            // 是文件
            if (!is_dir($targetPath)) {
                if (preg_match('/(.cbr|.cbz|.zip|.epub)/i', $file)) {
                    $type = 'zip';
                } elseif (preg_match('/.7z/i', $file)) {
                    $type = '7z';
                } elseif (preg_match('/.rar/i', $file)) {
                    $type = 'rar';
                } elseif (preg_match('/.pdf/i', $file)) {
                    $type = 'pdf';
                } else {
                    continue;
                }

                $posterName = preg_replace('/(.cbr|.cbz|.zip|.7z|.epub|.rar|.pdf)/i', '', $posterName);
            }

            array_push($list, array(
                'name' => $file,
                'poster' => self::get_poster($targetPath, $posterName),
                'path' => $targetPath,
                'type' => $type,
            ));
        }

        $dir->close();

        array_multisort(array_column($list, 'name'), SORT_NATURAL | SORT_FLAG_CASE, $list);

        return $list;
    }

    /**
     * @description: 递归扫描目录
     * @param {*} $path
     * @return {*}
     */
    private function get_file_list($path)
    {
        $list = array();

        if (!is_dir($path)) {
            return $list;
        }

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

    /**
     * @description: 获取目录封面
     * @param {*} $path
     * @param {*} $name
     * @return {*}
     */
    private function get_poster($path, $name)
    {
        $png = $name . '.png';
        $PNG = $name . '.PNG';
        $jpg = $name . '.jpg';
        $JPG = $name . '.jpg';

        if (is_file($png)) return $png;
        if (is_file($PNG)) return $PNG;
        if (is_file($jpg)) return $png;
        if (is_file($JPG)) return $JPG;

        $list = self::get_file_list($path);

        if (count($list) > 0) {
            return $list[0];
        } else {
            return '';
        }
    }
}
