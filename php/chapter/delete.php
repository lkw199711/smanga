<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$chapterId = $_POST['chapterId'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'cond'=>array(
			'like'=>'chapterId='.$chapterId,
		)
		
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>