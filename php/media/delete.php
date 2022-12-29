<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mediaId = $_POST['mediaId'];

	# 执行删除
	$sqlRes=dosql(array(
		'table'=>'media',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'mediaId='.$mediaId,
		)
		
	));

	// 删除相关路径
	dosql(array(
		'table'=>'path',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'mediaId='.$mediaId,
		)
		
	));

	// 删除相关漫画
	dosql(array(
		'table'=>'manga',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'mediaId='.$mediaId,
		)
		
	));

	// 删除相关章节
	dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'mediaId='.$mediaId,
		)
		
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>