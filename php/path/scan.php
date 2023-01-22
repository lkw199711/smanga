<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';
	
	$path = $_POST['path'];
	$pathId = $_POST['pathId'];
	$mediaId = $_POST['mediaId'];

	$request = array(
		'code'=>0,
		'message'=>'重新扫描成功',
	);

	scan_path_exec($path,$pathId,$mediaId);

	echo json_encode($request);
?>