<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-1.0.php';
	require_once '../public/check-power.php';

	// 检查用户权限
	check_user_power();

	$targetUserId = $_POST['targetUserId'];
	$userName = $_POST['userName'];
	$passWord = $_POST['passWord'];
	$passMd5 = md5($passWord);
	$editUser = $_POST['editUser'];
	$editMedia = $_POST['editMedia'];
	$mediaLimit = $_POST['mediaLimit'];


	$sqlField = array('userName','updateTime','editUser','editMedia','mediaLimit');
	$sqlValue = array($userName,'now()',$editUser,$editMedia,$mediaLimit);


	// 添加密码字段
	if ($passWord) {
		array_push($sqlField, 'passWord');
		array_push($sqlValue, $passMd5);
	}

	$sqlRes=dosql(array(
			'table'=>'user',
			'type'=>'update',
			'where'=>'userId='.$targetUserId,
			'field'=>$sqlField,
			'value'=>$sqlValue
		));

	# 执行修改
	$request = array(
		'code'=>0,
		'message'=>'修改成功!',
		'sqlRes'=>$sqlRes,
		);

	echo json_encode($request);
?>