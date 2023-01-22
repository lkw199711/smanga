<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];
	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	# 执行查询
	$sqlRes=dosql(array(
		'table'=>'history a,chapter b,manga c',
		'name'=>array(
			'a.historyId','a.mediaId','a.mangaId','a.chapterId',
			'c.mangaName','c.mangaCover','c.browseType','c.direction','c.removeFirst',
			'a.createTime','max(a.createTime) as nearTime',
			'b.chapterCover','b.chapterName','b.chapterPath','b.chapterType'
		),
		'where'=>array('a.userId='.$userId,'a.mangaId=c.mangaId','a.chapterId=b.chapterId'),
		'group'=>'chapterId',
		'order'=>'nearTime',
		'desc'=>true,
		'limit'=>$pageSize,
		'start'=>$recordStart,
	));

	$count = dosql(array(
		'table'=>'history',
		'type'=>'getcount',
		'where'=>'history.userId='.$userId,
		'group'=>'chapterId',
	));

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count
	);

	echo json_encode($request);
?>