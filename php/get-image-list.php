<?php

#验证密钥
require_once 'check-key-word.php';
require_once './public/lkw.php';


$manga = $_POST['manga'];

if (!$manga) {
	$manga='';
}

$request = get_file_list($DIR.$manga);

#返回信息
echo json_encode($request);

function get_file_list($path){
	$list = array();
	$dir = dir($path);

	while (($file = $dir->read()) !== false){
		$route = $path."/".$file;
		if(is_img($route)) array_push($list,$route);
	}

	$dir->close();

	sort($list,SORT_NATURAL | SORT_FLAG_CASE);

	return $list;
}

function file_exist_md5($fileName,$fileList){

	foreach ($fileList as $key => $value) {

		if($value['md5']===md5_file($fileName)) return $value['name'];
	}

	return false;
}

function file_exist_name($fileName,$fileList){
	global $SAMEFILENAME;

	$prefix = $SAMEFILENAME===0 ? '' : '('.$SAMEFILENAME.')';
	$finalName = $prefix.$fileName;

	foreach ($fileList as $key => $value) {
		if($value['name']===$finalName){
			$SAMEFILENAME++;
			return file_exist_name($fileName);
		}	
	}

	$SAMEFILENAME=0;
	return $finalName;
}

?>