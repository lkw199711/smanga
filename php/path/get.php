<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mediaId = $_POST['mediaId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	// media位0则返回全部路径
	if ($mediaId) {
		#执行注册
		$sqlRes=dosql(array(
			'table'=>'path',
			'where'=>'mediaId='.$mediaId,
			'limit'=>$pageSize,
			'start'=>$recordStart,
		));
		$count = dosql(array(
			'table'=>'path',
			'type'=>'getcount',
			'where'=>'mediaId='.$mediaId,
		));
	} else {
		#执行注册
		$sqlRes=dosql(array(
			'table'=>'path',
			'limit'=>$pageSize,
			'start'=>$recordStart,
		));
		$count = dosql(array('table'=>'path','type'=>'getcount'));
	}

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count,
	);

	echo json_encode($request);
?>