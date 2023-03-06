<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';
	require_once '../public/check-power.php';

	// 检查用户权限
	check_user_power();

	// 用户id
	$targetUserId = $_POST['targetUserId'];

	# 执行删除
	$sqlRes=dosql(array(
		'table'=>'user',
		'type'=>'delete',
		'where'=>'userId='.$targetUserId,
		
	));

	// 返回信息
	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>