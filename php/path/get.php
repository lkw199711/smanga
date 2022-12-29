<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mediaId = $_POST['mediaId'];

	// media位0则返回全部路径
	if ($$mediaId) {
		#执行注册
		$sqlRes=dosql(array(
			'table'=>'path',
			'cond'=>array(
				'like'=>'mediaId='.$mediaId,
			)
			// 'name'=>array('userid','username','regtime'),
		),$dosqlUrl);
	} else {
		#执行注册
		$sqlRes=dosql(array(
			'table'=>'path'
		),$dosqlUrl);
	}



	echo json_encode($sqlRes);
?>