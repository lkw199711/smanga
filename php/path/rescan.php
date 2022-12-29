<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';
	require_once './scan.php';
	
	$path = $_POST['path'];
	$pathId = $_POST['pathId'];
	$mediaId = $_POST['mediaId'];

	// 删除相关漫画
	$mangaSqlRes = dosql(array(
		'table'=>'manga',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'pathId='.$pathId,
		)
	));

	// 删除相关章节
	$chapterSqlRes = dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'pathId='.$pathId,
		)
	));

	$request = array(
		'code'=>0,
		'message'=>'重新扫描成功',
	);

	scan_path($path,$pathId,$mediaId);

	echo json_encode($request);
?>