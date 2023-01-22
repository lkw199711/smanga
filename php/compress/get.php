<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	# 执行查询
	$sqlRes=dosql(array(
		'table'=>'compress',
		'limit'=>$pageSize,
		'start'=>$recordStart,
	));

	$count = dosql(array('table'=>'compress','type'=>'getcount'));

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count
	);

	echo json_encode($request);
?>