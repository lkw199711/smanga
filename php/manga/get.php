<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mediaId = $_POST['mediaId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];
	$order = $_POST['order'];

	if ($mediaId) {
		$params = array(
			'table'=>'manga,media',
			'name'=>['manga.mediaId','mangaId','mangaName','mangaCover','chapterCount','browseType','mangaPath',
				'manga.chapterCount','manga.updateTime','manga.direction','manga.removeFirst','manga.createTime',
				'media.direction as mediaDirection','media.removeFirst as mediaRemoveFirst'],
			'where'=>['manga.mediaId='.$mediaId,'manga.mediaId=media.mediaId'],
			'limit'=>$pageSize,
			'start'=>$recordStart,
		);

		// 设置排序规则
		if ($order) {
			if ($order==='name') {
				$params['order'] = 'mangaName';

			}elseif ($order==='nameDesc') {
				$params['order'] = 'mangaName';
				$params['desc'] = true;

			}elseif ($order==='time') {
				$params['order'] = 'manga.createTime';

			}elseif ($order==='timeDesc') {
				$params['order'] = 'manga.createTime';
				$params['desc'] = true;
			}
		}

		# 执行查询
		$sqlRes=dosql($params);

		$count = dosql(array(
			'table'=>'manga',
			'type'=>'getcount',
			'where'=>'mediaId='.$mediaId,
		));
	} else {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'manga',
			'limit'=>$pageSize,
			'start'=>$recordStart,
		));

		$count = dosql(array('table'=>'manga','type'=>'getcount'));
	}

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count,
	);

	echo json_encode($request);
?>