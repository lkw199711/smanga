<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../dosql/mysql-1.0.php';

	$searchText = $_POST['searchText'];
	$searchType = $_POST['searchType'];
	$recordStart = $_POST['recordStart'];
	$pageSize = $_POST['pageSize'];
	$order = $_POST['order'];
	$userId = $_POST['userId'];

	$sqlRes = dosql(['table'=>'user','where'=>"userId=$userId"]);

	if (!$sqlRes) {
		exit_request([
			'code'=>1,
			'message'=>'用户信息错误',
		]);
	}
	
	// 用逗号重新拼接禁止权限媒体库
	$mediaLimit = $sqlRes[0]['mediaLimit'];
	$mediaLimitArr = explode('/',$mediaLimit);
	$mediaLimitRebuild = implode(',',$mediaLimitArr);

	$searchField = $searchType.'Name';

	$params = [
		'type'=>'search',
		'table'=>$searchType,
		'field'=>$searchField,
		'keyword'=>$searchText,
		'limit'=>$pageSize,
		'start'=>$recordStart,
		'where'=>["FIND_IN_SET(manga.mediaId,'$mediaLimitRebuild')=0"]
	];

	if($searchType==='chapter'){
		$params = [
			'type'=>'search',
			'name'=>['chapter.*','manga.browseType'],
			'table'=>'chapter,manga',
			'field'=>"chapter.$searchField",
			'keyword'=>$searchText,
			'where'=>['chapter.mangaId=manga.mangaId',"FIND_IN_SET(manga.mediaId,'$mediaLimitRebuild')=0"],
			'limit'=>$pageSize,
			'start'=>$recordStart,
		];
	}
	// 设置排序规则
	if ($order) {
		if ($order==='name') {
			$params['order'] = $searchField;

		}elseif ($order==='nameDesc') {
			$params['order'] = $searchField;
			$params['desc'] = true;

		}elseif ($order==='time') {
			$params['order'] = 'createTime';

		}elseif ($order==='timeDesc') {
			$params['order'] = 'createTime';
			$params['desc'] = true;
		}
	}

	$list = dosql($params);

	$count = dosql([
		'type'=>'searchcount',
		'table'=>$searchType,
		'field'=>$searchField,
		'keyword'=>$searchText,
		'where'=>["FIND_IN_SET(mediaId,'$mediaLimitRebuild')=0"]
	]);

	// 提出不允许的媒体库
	// $unsetNum = 0;
	// for ($i=0,$length=count($list); $i < $length; $i++) { 
	// 	if (array_search($list[$i]['mediaId'],$mediaLimitArr)!==false) {
	// 		// 删除元素
	// 		unset($list[$i]);
	// 		$unsetNum++;
	// 	}
	// }
	// 重新排列数组
	// $list = array_values($list);

	// 减去提出的数量
	// $count = $count - $unsetNum;

	$request = [
		'code'=>0,
		'list'=>$list,
		'count'=>$count,
	];

	echo json_encode($request);
?>