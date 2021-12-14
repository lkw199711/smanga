<?php 

#初始化变量
$ip = 'localhost';
$userName = 'sunlight';
$passWord = 'q';

#创建连接
$link = @mysql_connect($ip,$userName,$passWord)or die("数据库链接错误");

#执行连接
mysql_select_db("sunlight",$link);

#设置数据编码
mysql_query('set names utf8');

#数据库操作接口
$dosqlUrl = 'http://localhost/php/dosql/mysql.php';

 ?>
