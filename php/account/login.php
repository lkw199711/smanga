<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../dosql/mysql-1.0.php';
	require_once '../public/lkw.php';

	$userName = $_POST['userName'];
	$passWord = $_POST['passWord'];
	$ip = $_SERVER['REMOTE_ADDR'];
	$passMd5 = md5($passWord);

	$code = 0;
	$message = '';

	$sqlComm = sprintf("SELECT userId,userName,nickName,passWord FROM user WHERE userName = '%s';",mysqli_real_escape_string($link,$userName));

	#查找数据库中密码
	$user = get_sql_value($link,$sqlComm);
	$userInfo = array();

	if ($user) {
		// 转小写对比md5密码
		if(strtolower($user['passWord'])===strtolower($passMd5)){
			$message = '登录成功';

			// 插入登陆表
			dosql(array(
				'table'=>'login',
				'type'=>'insert',
				'field'=>array('userId','userName','nickName','request','ip','loginTime'),
				'value'=>array($user['userId'],$user['userName'],$user['nickName'],0,$ip,'now()'),
			));

			$userInfo = array(
				'userId'=>$user['userId'],
				'userName'=>$user['userName'],
				'nickName'=>$user['nickName'],
			);
		}else{
			$code = 1;

			// 插入登陆表
			dosql(array(
				'table'=>'login',
				'type'=>'insert',
				'field'=>array('userId','userName','nickName','request','ip','loginTime'),
				'value'=>array($user['userId'],$user['userName'],$user['nickName'],1,$ip,'now()'),
			));

			$message = '密码错误';
		}
	}else{
		$code = 1;
		$message = '用户名不存在';
	}

	$request = array(
		'code' => $code, 
		'message' => $message,
		'userInfo' => $userInfo,
	);

	echo json_encode($request);
?>