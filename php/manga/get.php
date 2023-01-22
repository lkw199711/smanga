<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mediaId = $_POST['mediaId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	if ($mediaId) {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'manga,media',
			'name'=>['manga.mediaId','mangaId','mangaName','mangaCover','chapterCount','browseType','mangaPath',
				'manga.chapterCount','manga.updateTime','manga.direction','manga.removeFirst',
				'media.direction as mediaDirection','media.removeFirst as mediaRemoveFirst'],
			'where'=>['manga.mediaId='.$mediaId,'manga.mediaId=media.mediaId'],
			'limit'=>$pageSize,
			'start'=>$recordStart,
		),$dosqlUrl);

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
		),$dosqlUrl);

		$count = dosql(array('table'=>'manga','type'=>'getcount'));
	}

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count,
	);

	echo json_encode($request);
?>