<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$bookmarkId = $_POST['bookmarkId'];

	$bookmarkSqlRes = dosql(array(
		'table'=>'bookmark',
		'where'=>'bookmarkId='.$bookmarkId
	));

	if (!$bookmarkSqlRes) {
		exit_request(array(
			'code'=>1,
			'message'=>'删除失败,找不到此转换记录',
		));
	}

	// 删除转换目录
	$pageImage = $bookmarkSqlRes[0]['pageImage'];
	$command = "rm -rf $pageImage";
	pclose(popen('nohup '.$command.' & 2>&1','r'));

	# 删除历史记录
	$sqlRes=dosql(array(
		'table'=>'bookmark',
		'type'=>'delete',
		'where'=>'bookmarkId='.$bookmarkId,
		
	));

	$request = array(
		'code'=>0,
		'message'=>'删除成功!',
		'sqlRes'=>$sqlRes,
	);

	echo json_encode($request);
?>