<?php
require_once './public/common.php';
require_once './public/lkw.php';
require_once './dosql/mysql-1.0.php';

$userId = $_POST['userId'];
$mediaId = $_POST['mediaId'];
$mangaId = $_POST['mangaId'];
$mangaCover = $_POST['mangaCover'];
$chapterId = $_POST['chapterId'];
$chapterPath = $_POST['chapterPath'];
$chapterType = $_POST['chapterType'];
$chapterCover = $_POST['chapterCover'];

// 返回数据
$request = array();
$list = array();
$message = '';
$status = 'success';
$command = '';

// 判断章节文件类型
if (preg_match('/(rar|pdf|zip)/i',$chapterType)) {

	$sqlRes = dosql(array(
		'table'=>'compress',
		'where'=>"chapterId=$chapterId"
	));

	if ($sqlRes) {
		$compressData = $sqlRes[0];
		$status = $compressData['compressStatus'];
		$compressPath = $compressData['compressPath'];

		if ($status=='compressing' || $status=='compressed') {
			$list = get_file_list($compressPath);
		}
	}else{
		$status = 'uncompressed';
		$message = '正在进行压缩转换';
		// $params = json_encode($_POST);
		$command = "php ./compress/compress.php \"$chapterPath\" \"$publicPath\" \"$mediaId\" \"$mangaId\" \"$chapterId\" \"$chapterType\" \"$mangaCover\" \"$chapterCover\" \"$userId\"";

		pclose(popen('nohup '.$command.' & 2>&1','r'));
	}
}else{
	$list = get_file_list($chapterPath);
}

$request = array(
	'code'=>0,
	'list'=>$list,
	'status'=>$status,
	'message'=>$message,
	'$command'=>$command
);

#返回信息
echo json_encode($request);

function get_file_list($path){
	$list = array();
	$dir = dir($path);

	while (($file = $dir->read()) !== false){
		if($file=='.'||$file=='..') continue;

		$route = $path."/".$file;

		// 添加图片
		if(is_img($route)) {
			array_push($list,$route);
		}
		// 遍历所有路径
		if (is_dir($route)) {
			$list = array_merge($list,get_file_list($route));
		}
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