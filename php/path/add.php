<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../public/connect.php';
	require_once '../dosql/mysql-function.php';
	require_once './scan.php';

	$mediaId = $_POST['mediaId'];
	$path = $_POST['path'];
	$path = mysql_real_escape_string($path);

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'path',
		'type'=>'insert',
		'cond'=>array(
			'field'=>array('mediaId','path','createTime'),
			'value'=>array($mediaId,$path,'now()')
		)
	));

	$pathSqlRes=dosql(array(
		'table'=>'path',
		'type'=>'select',
		'name'=>array('pathId'),
		'cond'=>array(
			'like'=>array(
				'mediaId='.$mediaId,
				'path=\''.$path.'\''
			),
		)
	));
	$pathId = $pathSqlRes[0]['pathId'];

	// 组装返回数据
	if ($sqlRes) {
		$request = array(
			'code'=>0,
			'message'=>'新增成功!',
			'sqlRes'=>$sqlRes,
			'$pathId'=>$pathId
		);

		// 扫描新路径
		scan_path($path,$pathId,$mediaId);
	}else{
		$request = array(
			'code'=>1,
			'message'=>'新增失败!',
			'sqlRes'=>$sqlRes,
			'$pathId'=>$pathId
		);
	}
	echo json_encode($request);
?>