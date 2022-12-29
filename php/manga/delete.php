<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mangaId = $_POST['mangaId'];

	# 删除漫画
	$sqlRes=dosql(array(
		'table'=>'manga',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'mangaId='.$mangaId,
		)
		
	));

	# 删除漫画
	$sqlRes=dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'mangaId='.$mangaId,
		)
		
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>