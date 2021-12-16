<?
    require_once 'check-key-word.php';
    require_once './public/lkw.php';

    #传递来新的路径
    $delPath = $_POST['delPath'];

    #配置文件路径
    $route = '/config/config';

    #读取文件,获取旧文件路径 返回数组
    $pathList = array_filter(get_file_line($route));

    if (!$delPath) {
        echo false;
    	exit;
    }

    #裁剪数组
    array_splice($pathList,array_search($delPath,$pathList),1);

    #写入文件
    foreach ($pathList as $key => $value) {
        write_txt($route,$value);
    }

    #返回数组
    echo json_encode($pathList);

?>