<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	if ($userId) {
		$where = array('bookmark.userId='.$userId,'bookmark.mangaId=manga.mangaId','bookmark.chapterId=chapter.chapterId');

		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'bookmark,chapter,manga',
			'name'=>array(
				'bookmark.bookmarkId','bookmark.mediaId','bookmark.mangaId','bookmark.chapterId','bookmark.page','bookmark.pageImage','bookmark.browseType','bookmark.createTime',
				'manga.mangaName','manga.direction','manga.removeFirst',
				'chapter.chapterName','chapter.chapterPath','chapter.chapterType','chapter.chapterCover'
			),
			'where'=>$where,
			'order'=>'bookmark.createTime',
			'desc'=>true,
			'limit'=>$pageSize,
			'start'=>$recordStart,
		));

		$count = dosql(array(
			'table'=>'bookmark',
			'type'=>'getcount',
			'where'=>'bookmark.userId='.$userId,
		));
	} else {
		# 执行查询
		$sqlRes=dosql(array(
			'table'=>'bookmark',
			'name'=>array('*','max(createTime)'),
			'group'=>'chapterId',
			'order'=>'nearTime',
			'desc'=>true,
			'limit'=>$limit,
			'limit'=>$pageSize,
			'start'=>$recordStart,
		));

		$count = dosql(array('table'=>'bookmark','type'=>'getcount'));
	}

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count
	);

	echo json_encode($request);
?>