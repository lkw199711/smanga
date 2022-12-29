<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$chapterId = $_POST['chapterId'];
	$chapterName = $_POST['chapterName'];
	$chapterPath = $_POST['chapterPath'];
	$chapterCover = $_POST['chapterCover'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'chapter',
		'type'=>'update',
		'cond'=>array(
			'like'=>'chapterId='.$chapterId,
			'field'=>array('chapterName','chapterPath','chapterCover','updatetime'),
			'value'=>array($chapterName,$chapterPath,$chapterCover,'now()')
		)
	));

	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>