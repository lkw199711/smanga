<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../public/ini.php';
	$configFile = "$configPath/sql.ini";

	#初始化变量
	$ip = read_ini('config','ip',$configFile);
	$userName = read_ini('config','userName',$configFile);
	$passWord = read_ini('config','passWord',$configFile);
	$port = read_ini('config','port',$configFile);
	$database = 'smanga';

	exit_request([
			'code'=>0,
			'data'=>[
				'ip'=>$ip,
				'userName'=>$userName,
				'passWord'=>$passWord,
				'port'=>$port,
			],
		]);
?>