<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../public/ini.php';

	$ip = $_POST['ip'];
	$userName = $_POST['userName'];
	$passWord = $_POST['passWord'];
	$port = $_POST['port'];

	#初始化变量
	$database = 'smanga';

	$configFile = "$configPath/sql.ini";

	if (!is_file($configFile)) {
		write_txt($configFile,'[config]');
	}

	#创建连接
	$link = @mysqli_connect($ip,$userName,$passWord,$database,$port)or exit_request([
			'code'=>1,
			'message'=>'数据库链接错误',
		]);

	// 写入文件
	write_ini('config','ip', $ip,$configFile);
	write_ini('config','port', $port,$configFile);
	write_ini('config','userName', $userName,$configFile);
	write_ini('config','passWord', $passWord,$configFile);



	exit_request([
			'code'=>0,
			'message'=>'设置成功',
		]);
?>