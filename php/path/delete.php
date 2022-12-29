<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$pathId = $_POST['pathId'];

	// 删除路径
	$sqlRes=dosql(array(
		'table'=>'path',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'pathId='.$pathId,
		)
		
	));

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
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>