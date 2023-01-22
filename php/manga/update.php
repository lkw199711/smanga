<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';

	$mangaId = $_POST['mangaId'];
	$mangaName = $_POST['mangaName'];
	$mangaPath = $_POST['mangaPath'];
	$mangaCover = $_POST['mangaCover'];
	$browseType = $_POST['browseType'];
	$removeFirst = $_POST['removeFirst'];
	$direction = $_POST['direction'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'manga',
		'type'=>'update',
		'where'=>'mangaId='.$mangaId,
		'field'=>array('mangaName','mangaPath','mangaCover','browseType','removeFirst','direction','updatetime'),
		'value'=>array($mangaName,$mangaPath,$mangaCover,$browseType,$removeFirst,$direction,'now()')
	));

	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
	);

	echo json_encode($request);
?>