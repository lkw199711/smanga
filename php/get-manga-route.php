<?
require_once 'check-key-word.php';
require_once './public/lkw.php';

#传递来新的路径
$newPath = $_POST['newPath'];

#配置文件路径
$route = '/config/config';

#读取文件,获取旧文件路径 返回数组
$pathList = array_filter(get_file_line($route));

if (!$newPath) {
	echo json_encode($pathList);
	exit;
}else if(!file_exists($newPath)) {
    echo '路径不存在!';
    exit;
}else if(in_array($newPath, $pathList)){
	echo "路径已存在配置!";
	exit;
}

#加入新路径
array_push($pathList,$newPath);
#写入新路径到文件
write_txt($route,$newPath,'a');
#返回数组
echo json_encode($pathList);


?>