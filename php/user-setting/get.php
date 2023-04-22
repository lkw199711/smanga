<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];

	$res = dosql([
		'table'=>'config',
		'where'=>"userId=$userId",
	]);

	if (!$res) {
		exit_request(['code'=>1,'text'=>'无用户配置数据']);
	}

	$configValue = $res[0]['configValue'];
	
	exit_request(['code'=>1,'configValue'=>$configValue]);
?>