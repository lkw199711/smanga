<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-20 01:43:27
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-20 21:54:19
 * @FilePath: /php/laravel/app/Console/Commands/Daemon.php
 */

namespace App\Console\Commands;

use App\Http\Controllers\Deploy;
use App\Http\Controllers\Utils;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Daemon extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'daemon:start';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Daemon that remain in the background';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // 设置脚本无限时间执行
        set_time_limit(0);





        // 死循环进程
        while (true) {
            echo date("Y-m-d H:i:s");
            echo "\n\r";

            $configPath = getenv('SMANGA_CONFIG');
            $installLock = "$configPath/install.lock";
            $AppPath = getenv('SMANGA_APP');
            $versionFile = "$AppPath/version";

            if (!is_file($installLock) || is_file($versionFile)) {
                // 睡眠一段时间
                sleep(10);
                continue;
            }

            $ip = Utils::config_read('sql', 'ip');
            $userName = Utils::config_read('sql', 'userName');
            $passWord = Utils::config_read('sql', 'passWord');
            $database = Utils::config_read('sql', 'database');
            $port = Utils::config_read('sql', 'port');

            try {
                $link = mysqli_connect($ip, $userName, $passWord, $database, $port);

                // 执行初始化流程
                Deploy::database_init(new Request());

                $link->close();

                echo "error sql connect success\r\n";
            } catch (\Exception $e) {
                $msg = $e->getMessage();
                echo "error sql connect failed $msg\r\n";
            }

            // 睡眠一段时间
            sleep(5);
        }

        return 0;
    }
}
