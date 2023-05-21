<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-21 18:44:55
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-21 23:46:10
 * @FilePath: /php/laravel/app/Console/Commands/Test.php
 */

namespace App\Console\Commands;

use App\Http\Controllers\Utils;
use App\Models\SocketSql;
use Illuminate\Console\Command;

class Test extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

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


        $int = 0;

        while (true) {

            $int++;
            $title = '解压成功';
            $str = "服务器发送了一条消息,这是发送的第 {$int} 条消息\r\n";
            echo $str;
            Utils::socket_send_array(48, 0, $title, $str);
            sleep(4);
        }

        return 0;
    }
}
