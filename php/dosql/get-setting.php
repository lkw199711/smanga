<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../public/ini.php';
	$configFile = "$configPath/config.ini";

	#初始化变量
	$ip = read_ini('sql','ip',$configFile);
	$userName = read_ini('sql','userName',$configFile);
	$passWord = read_ini('sql','passWord',$configFile);
	$port = read_ini('sql','port',$configFile);
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