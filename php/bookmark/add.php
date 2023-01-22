<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$userId = $_POST['userId'];
	$mediaId = $_POST['mediaId'];
	$mangaId = $_POST['mangaId'];
	$mangaName = $_POST['mangaName'];
	$chapterId = $_POST['chapterId'];
	$chapterName = $_POST['chapterName'];
	$chapterPath = $_POST['chapterPath'];
	$page = $_POST['page'];
	$pageImage = $_POST['pageImage'];
	$browseType = $_POST['browseType'];

	if (!$userId) exit;

	$md5 = md5($pageImage);
	$target = "$bookmarkPosterPath/$md5.png";
	copy($pageImage,$target);

	# 执行查询
	$sqlRes=dosql(array(
		'table'=>'bookmark',
		'type'=>'insert',
		'field'=>array('userId','mediaId','mangaId','chapterId','page','pageImage','browseType','createTime'),
		'value'=>array($userId,$mediaId,$mangaId,$chapterId,$page,$target,$browseType,'now()')
	));

	$request = array(
		'code'=>0,
		'message'=>'添加成功',
		'sqlRes'=>$sqlRes,
	);

	echo json_encode($request);
?>