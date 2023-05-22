<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-21 17:44:56
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-22 20:57:44
 * @FilePath: /php/laravel/app/Console/Commands/Websocket.php
 */

namespace App\Console\Commands;

use App\Models\SocketSql;
use Illuminate\Console\Command;

class Websocket extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'socket {action?}';
    public $ws;
    public $fd;

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Websocket';

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
        $action = $this->argument('action');

        switch ($action) {
            case 'restart':
                $this->info('swoole server restarted');
                break;
            case 'close':
                $this->info('swoole server stoped');
                break;
            default:
                $this->start();
                break;
        }

        return 0;
    }

    public function start()
    {
        //创建websocket服务器对象，监听0.0.0.0:9501端口
        $this->ws = new \swoole_websocket_server("0.0.0.0", 9501);

        // 清空连接记录表
        SocketSql::clear();

        //开启ssl模式
        //        $this->ws = new \swoole_websocket_server("0.0.0.0", 9501,SWOOLE_PROCESS, SWOOLE_SOCK_TCP | SWOOLE_SSL);

        //配置ssl模式
        //        $this->ws->set([
        //            'ssl_key_file' => '/var/www/html/ssl/4033464_cxh520.top.key',
        //            'ssl_cert_file' => '/var/www/html/ssl/4033464_cxh520.top.pem'
        //        ]);

        //监听WebSocket连接打开事件
        $this->ws->on('open', [$this, 'open']);

        //监听WebSocket消息事件
        $this->ws->on('message', [$this, 'message']);

        //监听WebSocket主动推送消息事件
        $this->ws->on('request', [$this, 'request']);

        //监听WebSocket连接关闭事件
        $this->ws->on('close', [$this, 'close']);

        $this->ws->start();
    }

    /**
     * 建立连接
     * @param $ws
     * @param $request
     */
    public function open($ws, $request)
    {
        echo "链接 {$request->fd} 连接成功\r\n";

        SocketSql::add([
            'fd' => $request->fd,
            'ip' => $request->server['remote_addr'],
            'status' => 'connecting'
        ]);
    }

    /**
     * 接收消息
     * @param $ws
     * @param $frame
     */
    public function message($ws, $frame)
    {
        if (!$frame->data) {
            return;
        }
        SocketSql::socket_update($frame->fd, ['fd' => $frame->fd, 'userId' => $frame->data]);

        // $this->ws->push($frame->fd, $frame->data);
    }

    /**
     * 接收请求
     * @param $request
     * @param $response
     */
    public function request($request, $response)
    {
        // dump($request->post);
        $res = json_encode($request->post);

        $this->ws->push($request->post['fd'], $res);
    }

    /**
     * 关闭连接
     * @param $ws
     * @param $fd
     */
    public function close($ws, $fd)
    {
        // echo "链接 {$fd} 关闭\r\n";

        SocketSql::socket_delete($fd);
    }
}
