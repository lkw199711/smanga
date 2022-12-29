<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	# 执行查询
	$sqlRes=dosql(array(
		'table'=>'user',
		'name'=>array('userId','userName','registerTime'),
	),$dosqlUrl);

	echo json_encode($sqlRes);
?>