<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mangaId = $_POST['mangaId'];
	$mangaName = $_POST['mangaName'];
	$mangaPath = $_POST['mangaPath'];
	$mangaCover = $_POST['mangaCover'];

	# 执行修改
	$sqlRes=dosql(array(
		'table'=>'history',
		'type'=>'update',
		'where'=>'mangaId='.$mangaId,
		'field'=>array('mangaName','mangaPath','mangaCover','updatetime'),
		'value'=>array($mangaName,$mangaPath,$mangaCover,'now()')
	));

	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>