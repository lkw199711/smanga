<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$userId = $_POST['userId'];
	$mediaId = $_POST['mediaId'];
	$mangaId = $_POST['mangaId'];
	$mangaName = $_POST['mangaName'];
	$chapterId = $_POST['chapterId'];
	$chapterName = $_POST['chapterName'];
	$chapterPath = $_POST['chapterPath'];
	$chapterCover = $_POST['chapterCover'];

	if (!$userId) exit;

	# 执行查询
	$sqlRes=dosql(array(
		'table'=>'history',
		'type'=>'insert',
		'cond'=>array(
			'field'=>array('userId','mediaId','mangaId','mangaName','chapterId','chapterName','chapterPath','chapterCover','createTime'),
			'value'=>array($userId,$mediaId,$mangaId,$mangaName,$chapterId,$chapterName,$chapterPath,$chapterCover,'now()')
		),
	));

	$request = array(
		'code'=>0,
		'sqlRes'=>$sqlRes,
	);

	echo json_encode($sqlRes);
?>