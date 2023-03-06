<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';
	require_once '../public/check-power.php';

	// 检查用户权限
	check_user_power();
	
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	# 执行查询
	$list=dosql(array(
		'table'=>'user',
		'name'=>array('userId','userName','registerTime','editMedia','editUser','mediaLimit'),
		'order'=>'userid',
		'limit'=>$pageSize,
		'start'=>$recordStart,
	));

	$request = array(
		'code'=>0,
		'list'=>$list,
		'count'=>dosql(array('table'=>'user','type'=>'getcount')),
		'test'=>"$pageSize"
	);

	echo json_encode($request);
?>