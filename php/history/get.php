<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$userId = $_POST['userId'];
	$limit = 200;

	if ($userId) {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'history',
			'name'=>array('*','max(createTime) as nearTime'),
			'cond'=>array(
				'like'=>'userId='.$userId,
				'group'=>'chapterId',
				'order'=>'nearTime',
				'desc'=>true,
				'limit'=>$limit
			),

		));
	} else {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'history',
			'name'=>array('*','max(createTime)'),
			'cond'=>array(
				'group'=>'chapterId',
				'order'=>'nearTime',
				'desc'=>true,
				'limit'=>$limit
			),
		));
	}

	// 去重
	// $request = assoc_unique($sqlRes,'chapterId');

	echo json_encode($sqlRes);
?>