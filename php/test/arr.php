<?
	$arr = [
		1,2,3,4,5,6,7,8,9,10

	];

	// echo print_r($_SERVER['DOCUMENT_ROOT']);
	// 
	unset($arr[0]);
	unset($arr[1]);

	echo count($arr);
?>