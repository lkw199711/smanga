<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$pageSize = $_POST['pageSize'];
	$recordStart = $_POST['recordStart'];

	// 进行权限检验
	$userId = $_POST['userId'];
	$sqlRes = dosql(['table'=>'user','where'=>"userId=$userId"]);

	if (!$sqlRes) {
		exit_request([
			'code'=>1,
			'message'=>'用户信息错误',
		]);
	}

	$mediaLimit = $sqlRes[0]['mediaLimit'];
	$mediaLimitArr = explode('/',$mediaLimit);
	$mediaLimitRebuild = implode(',',$mediaLimitArr);

	// 执行搜索
	$sqlRes=dosql(array(
		'table'=>'media',
		'limit'=>$pageSize,
		'start'=>$recordStart,
		'where'=>["FIND_IN_SET(mediaId,'$mediaLimitRebuild')=0"]
	));


	$count = dosql(array('table'=>'media','type'=>'getcount','where'=>["FIND_IN_SET(mediaId,'$mediaLimitRebuild')=0"]));

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count,
	);

	echo json_encode($request);
?>