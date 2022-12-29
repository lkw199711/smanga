<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mediaId = $_POST['mediaId'];

	if ($mediaId) {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'manga',
			'cond'=>array('like'=>'mediaId='.$mediaId),
		),$dosqlUrl);
	} else {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'manga'
		),$dosqlUrl);
	}

	echo $sqlRes ? json_encode($sqlRes) : json_encode(array());
?>