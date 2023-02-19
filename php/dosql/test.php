<?
	require_once '../public/lkw.php';

	$ip = $_POST['ip'];
	$userName = $_POST['userName'];
	$passWord = $_POST['passWord'];
	$port = $_POST['port'];

	#初始化变量
	$database = 'smanga';

	#创建连接
	$link = @mysqli_connect($ip,$userName,$passWord,$database,$port)or exit_request([
			'code'=>1,
			'message'=>'数据库链接错误',
		]);

	exit_request([
			'code'=>0,
			'message'=>'链接成功',
		]);
?>