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

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'media',
		'limit'=>$pageSize,
		'start'=>$recordStart,
	));

	for ($i=0,$length=count($sqlRes); $i < $length; $i++) { 
		if (array_search($sqlRes[$i]['mediaId'],$mediaLimitArr)!==false) {
			// 删除元素
			unset($sqlRes[$i]);
		}
	}
	// 重新排列数组
	$sqlRes = array_values($sqlRes);

	$count = dosql(array('table'=>'media','type'=>'getcount'));
	$count = $count - count($mediaLimitArr);

	$request = array(
		'code'=>0,
		'list'=>$sqlRes,
		'count'=>$count,
	);

	echo json_encode($request);
?>