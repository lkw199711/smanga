<?php 

#初始化变量
$ip = '127.0.0.1';
$userName = 'smanga';
$passWord = 'smanga';
$database = 'smanga';

#创建连接
$link = @mysqli_connect($ip,$userName,$passWord,$database)or die("数据库链接错误");

#执行连接
// mysqli_select_db("smanga",$link);

#设置数据编码
mysqli_set_charset($link,'utf8');

#数据库操作接口
$dosqlUrl = 'http://localhost:81/php/dosql/mysql.php';

 ?>
