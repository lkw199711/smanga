<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$chapterId = $_POST['chapterId'];
	$deleteFile = $_POST['deleteFile'];

	// 查询漫画信息
	$chapterPathRes = dosql([
		'table'=>'chapter',
		'where'=>'chapterId='.$chapterId,
	]);

	if (!count($chapterPathRes)) {
		exit_request(['code'=>2,'message'=>'无此章节!']);
	}

	// 删除文件
	if ($deleteFile) {
		$chapterPath = $chapterPathRes[0]['chapterPath'];
		shell_exec("rm -rf \"$chapterPath\"");
	}

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'where'=>'chapterId='.$chapterId,
		
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>