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

	if (!$userId) exit;

	# 执行查询
	$sqlRes=dosql(array(
		'table'=>'history',
		'type'=>'insert',
		'field'=>array('userId','mediaId','mangaId','chapterId','createTime'),
		'value'=>array($userId,$mediaId,$mangaId,$chapterId,'now()')
	));

	$request = array(
		'code'=>0,
		'sqlRes'=>$sqlRes,
	);

	echo json_encode($request);
?>