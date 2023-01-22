<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$compressId = $_POST['compressId'];

	$compressSqlRes = dosql(array(
		'table'=>'compress',
		'where'=>'compressId='.$compressId
	));

	if (!$compressSqlRes) {
		exit_request(array(
			'code'=>1,
			'message'=>'删除失败,找不到此转换记录',
		));
	}

	// 删除转换目录
	$compressPath = $compressSqlRes[0]['compressPath'];
	$command = "rm -rf $compressPath";
	pclose(popen('nohup '.$command.' & 2>&1','r'));

	# 删除历史记录
	$sqlRes=dosql(array(
		'table'=>'compress',
		'type'=>'delete',
		'where'=>'compressId='.$compressId,
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
	);

	

	echo json_encode($request);
?>