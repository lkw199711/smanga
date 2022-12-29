<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mangaId = $_POST['mangaId'];

	if ($mangaId) {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'chapter',
			'cond'=>array(
				'like'=>'mangaId='.$mangaId,
				'order'=>'chapterid'
				),
		));
	} else {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'chapter'
		));
	}

	

	echo json_encode($sqlRes);
?>