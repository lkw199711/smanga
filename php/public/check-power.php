<?


	function check_media_power(){
		// 进行权限检验
		$userId = $_POST['userId'];
		$sqlRes = dosql(['table'=>'user','where'=>"userId=$userId"]);

		if (!$sqlRes) {
			exit_request([
				'code'=>1,
				'message'=>'用户信息错误',
			]);
		}

		$editMedia = $sqlRes[0]['editMedia'];

		if ($editMedia!='1') {
			exit_request([
				'code'=>1,
				'message'=>'您没有此操作权限!',
			]);
		}
	}


	function check_user_power(){
		// 进行权限检验
		$userId = $_POST['userId'];
		$sqlRes = dosql(['table'=>'user','where'=>"userId=$userId"]);

		if (!$sqlRes) {
			exit_request([
				'code'=>1,
				'message'=>'用户信息错误',
			]);
		}

		$editUser = $sqlRes[0]['editUser'];

		if ($editUser!='1') {
			exit_request([
				'code'=>1,
				'message'=>'您没有此操作权限!',
			]);
		}
	}
?>