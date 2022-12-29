<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mediaName = $_POST['mediaName'];
	$mediaType = $_POST['mediaType'];
	$directoryFormat = $_POST['directoryFormat'];
	$fileType = $_POST['fileType'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'media',
		'type'=>'insert',
		'cond'=>array(
			'field'=>array('mediaName','mediaType','directoryFormat','fileType','createtime'),
			'value'=>array($mediaName,$mediaType,$directoryFormat,$fileType,'now()')
		)
	));

	$request = array(
		'code'=>0,
		'message'=>'新增成功!',
		'sqlRes'=>$sqlRes,
		);
	
	echo json_encode($request);
?>