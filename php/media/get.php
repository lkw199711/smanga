<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'media',
		'limit'=>$pageSize,
		'start'=>$recordStart,
	));

	$count = dosql(array('table'=>'media','type'=>'getcount'));

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count,
	);

	echo json_encode($request);
?>