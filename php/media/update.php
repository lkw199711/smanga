<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';
	require_once '../public/check-power.php';

	check_media_power();

	$mediaId = $_POST['mediaId'];
	$mediaName = $_POST['mediaName'];
	$mediaType = $_POST['mediaType'];
	$directoryFormat = $_POST['directoryFormat'];
	$fileType = $_POST['fileType'];
	$defaultBrowse = $_POST['defaultBrowse'];
	$removeFirst = $_POST['removeFirst'];
	$direction = $_POST['direction'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'media',
		'type'=>'update',
		'where'=>'mediaId='.$mediaId,
		'field'=>array('mediaName','mediaType','directoryFormat','fileType','defaultBrowse','removeFirst','direction','updatetime'),
		'value'=>array($mediaName,$mediaType,$directoryFormat,$fileType,$defaultBrowse,$removeFirst,$direction,'now()')
	));

	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>