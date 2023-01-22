<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../public/connect.php';
	require_once '../dosql/mysql-1.0.php';

	$mediaId = $_POST['mediaId'];
	$path = $_POST['path'];
	$path = mysqli_real_escape_string($link,$path);

	if (!is_dir($path)) {
		exit_request([
			'code'=>1,
			'message'=>'路径无法读取',
		]);
	}

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'path',
		'type'=>'insert',
		'field'=>array('mediaId','path','createTime'),
		'value'=>array($mediaId,$path,'now()')
	));
	// 新增失败
	if (!$sqlRes) {
		exit_request(array(
			'code'=>1,
			'message'=>'新增失败,请检查路径是否重复',
			'sqlRes'=>$sqlRes,
		));
	}

	$pathSqlRes=dosql(array(
		'table'=>'path',
		'type'=>'select',
		'name'=>array('pathId'),
		'where'=>array(
			'mediaId='.$mediaId,
			'path=\''.$path.'\''
		),
	));
	$pathId = $pathSqlRes[0]['pathId'];
	
	$command = "php ../scan/scan-path.php \"$path\" \"$pathId\" \"$mediaId\" \"$publicPath\"";
	// 组装返回数据
	$request = array(
		'code'=>0,
		'message'=>'新增成功!',
		'sqlRes'=>$sqlRes,
		'$pathId'=>$pathId,
		'command'=>$command,
	);

	// 扫描新路径
	scan_path_exec($path,$pathId,$mediaId);

	echo json_encode($request);
?>