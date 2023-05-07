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
	$collectType = $_POST['collectType'];

    if (!$userId) exit;

	// 执行插入
	$sqlRes=dosql(array(
		'table'=>'collect',
		'type'=>'insert',
		'field'=>array('userId','collectType','mediaId','mangaId','mangaName','chapterId','chapterName','createTime'),
		'value'=>array($userId,$collectType,$mediaId,$mangaId,$mangaName,$chapterId,$chapterName,'now()')
	));

	$request = array(
		'code'=>0,
		'sqlRes'=>$sqlRes,
		'message'=>'收藏成功'
	);

	echo json_encode($request);
?>