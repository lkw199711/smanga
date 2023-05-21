<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-17 23:35:49
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 23:49:56
 * @FilePath: /php/laravel/app/Http/Controllers/Utils.php
 */

namespace App\Http\Controllers;
use App\Models\SocketSql;
use Illuminate\Support\Facades\Storage;

class Utils extends Controller
{
    /**
     * [writeTxt description]
     * @param  [string] $file [description]
     * @param  [string] $str  [description]
     * @return [type]       [description]
     */
    public static function write_txt($file, $str, $type = "w")
    {
        #打开文件
        $myfile = fopen($file, $type) or die("Unable to open file!");
        #写入文本
        fwrite($myfile, $str . "\r\n");
        #关闭文件
        fclose($myfile);

        return true;
    }
    /**
     * @description: 判断文件是否为一张图片
     * @param {*} $file
     * @return {*}
     */
    public static function is_img($file)
    {
        return preg_match('/(.bmp|.jpg|.jpeg|.png|.tif|.gif|.pcx|.tga|.exif|.fpx|.svg|.psd|.cdr|.pcd|.dxf|.ufo|.eps|.ai|.raw|.WMF|.webp|.avif|.apng)$/i', $file);
    }
    /**
     * @description: 判断文件是否需要解压
     * @param {*} $file
     * @return {*}
     */
    public static function is_compressed($file)
    {
        return preg_match('/(cbr|cbz|zip|7z|rar|pdf)/i', $file);
    }
    /**
     * @description: 获取文件目录(递归)
     * @param {*} $path
     * @return {*}
     */
    public static function get_file_list($path)
    {
        $list = array();
        $dir = dir($path);

        while (($file = $dir->read()) !== false) {
            if ($file == '.' || $file == '..') continue;

            $route = $path . "/" . $file;

            // 添加图片
            if (self::is_img($route)) {
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
     * @description: 读取配置文件
     * @param {*} $title
     * @param {*} $key
     * @return {*}
     */
    public static function config_read($title, $key)
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

        if (!isset($data[$title])) return false;
        if (!isset($data[$title][$key])) return false;

        return $data[$title][$key];
    }
    /**
     * @description: 写入配置文件
     * @param {*} $title
     * @param {*} $key
     * @param {*} $value
     * @return {*}
     */
    public static function config_write($title, $key, $value)
    {
        // INI配置文件
        $file = getenv('SMANGA_CONFIG_INI');

        $data = filesize($file) == 0 ? [] : parse_ini_file($file, true);
        $data[$title][$key] = $value;

        self::write_ini_file($data, $file, true);
    }
    /**
     * @description: 写入ini文件
     * @param {*} $assoc_arr
     * @param {*} $path
     * @param {*} $has_sections
     * @return {*}
     */
    public static function write_ini_file($assoc_arr, $path, $has_sections = FALSE)
    {
        $content = "";
        if ($has_sections) {
            foreach ($assoc_arr as $key => $elem) {
                $content .= "[" . $key . "]\n";
                foreach ($elem as $key2 => $elem2) {
                    if (is_array($elem2)) {
                        for ($i = 0; $i < count($elem2); $i++) {
                            $content .= $key2 . "[] = \"" . $elem2[$i] . "\"\n";
                        }
                    } else if ($elem2 == "") $content .= $key2 . " = \n";
                    else $content .= $key2 . " = \"" . $elem2 . "\"\n";
                }
            }
        } else {
            foreach ($assoc_arr as $key2 => $elem) {
                if (is_array($elem)) {
                    for ($i = 0; $i < count($elem); $i++) {
                        $content .= $key2 . "[] = \"" . $elem[$i] . "\"\n";
                    }
                } else if ($elem == "") $content .= $key2 . " = \n";
                else $content .= $key2 . " = \"" . $elem . "\"\n";
            }
        }

        if (!$handle = fopen($path, 'w')) {
            return false;
        }

        if (!fwrite($handle, $content)) {
            return false;
        }
        fclose($handle);
        return true;
    }
    public static function updateEnv($data = array())
    {
        if (!count($data)) {
            return;
        }

        $pattern = '/([^\\=]*)\\=[^\n]*/';

        $envFile = base_path() . '/.env';
        $lines = file($envFile);
        $newLines = [];
        foreach ($lines as $line) {
            preg_match($pattern, $line, $matches);

            if (!count($matches)) {
                $newLines[] = $line;
                continue;
            }

            if (!key_exists(trim($matches[1]), $data)) {
                $newLines[] = $line;
                continue;
            }

            $line = trim($matches[1]) . "={$data[trim($matches[1])]}\n";
            $newLines[] = $line;
        }

        $newContent = implode('', $newLines);
        file_put_contents($envFile, $newContent);
    }
    public static function changeEnvironmentVariable($key, $value)
    {
        $path = base_path('.env');

        if (is_bool(env($key))) {
            $old = env($key) ? 'true' : 'false';
        } elseif (env($key) === null) {
            $old = 'null';
        } else {
            $old = env($key);
        }

        if (file_exists($path)) {
            file_put_contents($path, str_replace(
                "$key=" . $old,
                "$key=" . $value,
                file_get_contents($path)
            ));
        }
    }
    public static function socket_send($data)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "http://127.0.0.1:9501");
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HEADER, 1);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_exec($curl);
        curl_close($curl);
    }
    public static function socket_send_array($userId, $code, $title, $message)
    {
        $socketRes = SocketSql::get_fd_by_user($userId);

        $fds = $socketRes['fds'];
        
        foreach ($fds as $value) {
            self::socket_send([
                'fd' => $value,
                'code' => $code,
                'title' => $title,
                'message' => $message
            ]);
        }
    }
}
