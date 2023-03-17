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

	$configFile = "$configPath/config.ini";

	if (!is_file($configFile)) {
		write_txt($configFile,'[sql]');
		write_txt($configFile,'[imagick]');
	}

	#创建连接
	$link = @mysqli_connect($ip,$userName,$passWord,$database,$port)or exit_request([
			'code'=>1,
			'message'=>'数据库链接错误',
		]);

	// 写入文件
	write_ini('sql','ip', $ip,$configFile);
	write_ini('sql','port', $port,$configFile);
	write_ini('sql','userName', $userName,$configFile);
	write_ini('sql','passWord', $passWord,$configFile);



	exit_request([
			'code'=>0,
			'message'=>'设置成功',
		]);
?>