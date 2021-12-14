<?php

#验证密钥
require_once 'check-key-word.php';


$manga = $_POST['manga'];

if (!$manga) {
	$manga='';
}

// echo $DIR.$manga;
// $request = get_file_list('/data/0serve/manga/');

// exit('别打我,我确实执行了');

$request = get_file_list($DIR.$manga);

#返回信息
echo json_encode($request);

function get_file_list($path){
	$list = array();
	$dir = dir($path);

	// echo "Handle: " . $dir->handle . "<br>";
	// echo "Path: " . $dir->path . "<br>";

	while (($file = $dir->read()) !== false){
		if (preg_match('/\.txt/',$file)) continue;
		
		if($file!=='.'&&$file!=='..')
	  		array_push($list,$file);
	}

	$dir->close();

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
// iconv("gbk","UTF-8",$file)
// 
// echo file_exist_name('1.txt');
// echo json_encode($prefix = $SAMEFILENAME===0 ? '' : '('.$SAMEFILENAME.')');
//debug();

?>