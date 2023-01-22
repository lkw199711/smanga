<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	// 用户id
	$userId = $_POST['targetUserId'];

	# 执行删除
	$sqlRes=dosql(array(
		'table'=>'user',
		'type'=>'delete',
		'where'=>'userId='.$userId,
		
	),$dosqlUrl);

	// 返回信息
	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>