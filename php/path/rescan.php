<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';
	
	$path = $_POST['path'];
	$pathId = $_POST['pathId'];
	$mediaId = $_POST['mediaId'];

	// 删除相关漫画
	$mangaSqlRes = dosql(array(
		'table'=>'manga',
		'type'=>'delete',
		'where'=>'pathId='.$pathId,
	));

	// 删除相关章节
	$chapterSqlRes = dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'where'=>'pathId='.$pathId,
	));

	$request = array(
		'code'=>0,
		'message'=>'重新扫描成功',
	);

	scan_path_exec($path,$pathId,$mediaId);

	echo json_encode($request);
?>