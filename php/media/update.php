<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mediaId = $_POST['mediaId'];
	$mediaName = $_POST['mediaName'];
	$mediaType = $_POST['mediaType'];
	$directoryFormat = $_POST['directoryFormat'];
	$fileType = $_POST['fileType'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'media',
		'type'=>'update',
		'cond'=>array(
			'like'=>'mediaId='.$mediaId,
			'field'=>array('mediaName','mediaType','directoryFormat','fileType','updatetime'),
			'value'=>array($mediaName,$mediaType,$directoryFormat,$fileType,'now()')
		)
	));

	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>