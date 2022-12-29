<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	// 用户id
	$userId = $_POST['userId'];

	# 执行删除
	$sqlRes=dosql(array(
		'table'=>'user',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'userId='.$userId,
		)
		
	),$dosqlUrl);

	// 返回信息
	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>