<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	$mangaId = $_POST['mangaId'];
	$mangaName = $_POST['mangaName'];
	$mangaPath = $_POST['mangaPath'];
	$mangaCover = $_POST['mangaCover'];

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'manga',
		'type'=>'update',
		'cond'=>array(
			'like'=>'mangaId='.$mangaId,
			'field'=>array('mangaName','mangaPath','mangaCover','updatetime'),
			'value'=>array($mangaName,$mangaPath,$mangaCover,'now()')
		)
	));

	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>