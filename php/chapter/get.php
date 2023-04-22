<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mangaId = $_POST['mangaId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];
	$order = $_POST['order'];

	

	if ($mangaId) {
		$params = [
			'table'=>'chapter',
			'where'=>'mangaId='.$mangaId,
			'order'=>'chapterId',
			'limit'=>$pageSize,
			'start'=>$recordStart,
		];

		// 设置排序规则
		if ($order) {
			if ($order==='name') {
				$params['order'] = 'chapter.chapterName';

			}elseif ($order==='nameDesc') {
				$params['order'] = 'chapter.chapterName';
				$params['desc'] = true;

			}elseif ($order==='time') {
				$params['order'] = 'chapter.createTime';

			}elseif ($order==='timeDesc') {
				$params['order'] = 'chapter.createTime';
				$params['desc'] = true;
			}
		}

		# 执行查询
		$sqlRes=dosql($params);

		$count = dosql(array(
			'table'=>'chapter',
			'type'=>'getcount',
			'where'=>'mangaId='.$mangaId,
		));
	} else {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'chapter',
			'limit'=>$pageSize,
			'start'=>$recordStart,
		));

		$count = dosql(array('table'=>'chapter','type'=>'getcount'));
	}

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count
	);

	echo json_encode($request);
?>