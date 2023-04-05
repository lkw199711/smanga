<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../dosql/mysql-1.0.php';

	$searchText = $_POST['searchText'];
	$searchType = $_POST['searchType'];
	$recordStart = $_POST['recordStart'];
	$pageSize = $_POST['pageSize'];
	$order = $_POST['order'];

	$searchField = $searchType.'Name';

	$list = dosql([
		'type'=>'search',
		'table'=>$searchType,
		'field'=>$searchField,
		'keyword'=>$searchText,
		'limit'=>$pageSize,
		'start'=>$recordStart,
	]);

	// 设置排序规则
	if ($order) {
		if ($order==='name') {
			$params['order'] = 'mangaName';

		}elseif ($order==='nameDesc') {
			$params['order'] = 'mangaName';
			$params['desc'] = true;

		}elseif ($order==='time') {
			$params['order'] = 'manga.createTime';

		}elseif ($order==='timeDesc') {
			$params['order'] = 'manga.createTime';
			$params['desc'] = true;
		}
	}

	$count = dosql([
		'type'=>'searchcount',
		'table'=>$searchType,
		'field'=>$searchField,
		'keyword'=>$searchText,
	]);

	$request = [
		'code'=>0,
		'list'=>$list,
		'count'=>$count,
	];

	echo json_encode($request);
?>