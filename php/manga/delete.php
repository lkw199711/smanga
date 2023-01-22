<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mangaId = $_POST['mangaId'];
	$deleteFile = $_POST['deleteFile'];

	// 查询漫画信息
	$mangaPathRes = dosql([
		'table'=>'manga',
		'where'=>'mangaId='.$mangaId,
	]);
		
	if (!count($mangaPathRes)) {
		exit_request(['code'=>2,'message'=>'无此漫画!']);
	}

	// 删除文件
	if ($deleteFile) {
		$mangaPath = $mangaPathRes[0]['mangaPath'];
		shell_exec("rm -rf \"$mangaPath\"");
	}

	# 删除漫画
	$sqlRes=dosql(array(
		'table'=>'manga',
		'type'=>'delete',
		'where'=>'mangaId='.$mangaId,
		
	));
	
	# 删除章节
	$sqlRes=dosql(array(
		'table'=>'chapter',
		'type'=>'delete',
		'where'=>'mangaId='.$mangaId,
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
	);

	echo json_encode($request);
?>