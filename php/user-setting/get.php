<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];

	// 初次部署
	if (!is_file("$configPath/install.lock")) {
		echo json_encode([
			'code' => 1,
			'state' => 'first-deploy',
			'text' => '初次部署'
		]);
		exit();
	}
	// 用户信息错误
	if (!$userId){
		echo json_encode([
			'code' => 1,
			'state' => 'user-error',
			'message' => '用户信息错误，请重新登陆'
		]);
		exit();
	}

	$res = dosql([
		'table'=>'config',
		'where'=>"userId=$userId",
	]);

	if (!$res) {
		exit_request(['code'=>1,'text'=>'无用户配置数据','res'=>$res]);
	}

	$configValue = $res[0]['configValue'];
	
	exit_request(['code'=>0,'configValue'=>$configValue]);
?>