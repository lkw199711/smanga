<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];
	$userName = $_POST['userName'];
	$configValue = $_POST['configValue'];

	$res = dosql([
		'table'=>'config',
		'where'=>"userId=$userId",
	]);

	$test = count($res);

	// 根据是否有记录 决定新增和删除
	if (count($res)) {
		$res = dosql([
			'table'=>'config',
			'type'=>'update',
			'where'=>"userId=$userId",
			'field'=>['userId','userName','configValue','updateTime'],
			'value'=>[$userId,$userName,$configValue,'now()']
		]);
	}else{
		$res = dosql([
			'table'=>'config',
			'type'=>'insert',
			'field'=>['userId','userName','configValue','createTime','updateTime'],
			'value'=>[$userId,$userName,$configValue,'now()','now()']
		]);
	}

	if ($res) {
		exit_request(['code'=>0,'message'=>'保存成功']);
	}else{
		exit_request(['code'=>1,'message'=>'数据库操作失败','sqlRes'=>$res]);
	}
	

?>