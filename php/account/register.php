<?
	require_once '../public/common.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

	// 获取post参数
	$userName = $_POST['userName'];
	$passWord = $_POST['passWord'];
	$passMd5 = md5($passWord);

	#执行注册
	$sqlRes=dosql(array(
		'table'=>'user',
		'type'=>'insert',
		'cond'=>array(
			'field'=>array('userName','passWord','registerTime'),
			'value'=>array($userName,$passMd5,'now()')
		)
	),$dosqlUrl);

	$request = array(
		'code'=>0,
		'message'=>'注册成功!',
		'sqlRes'=>$sqlRes,
		);
	
	echo json_encode($request);
?>