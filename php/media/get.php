<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'media',
	));

	echo json_encode($sqlRes);
?>