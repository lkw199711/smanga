<?
header("content-type:text/html;charset=UTF-8");
/**
 * [print_error description]
 * @param  [string] $name [description]
 * @return [type]       [description]
 */
function print_error($name){
	#输出所有错误信息
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	#将出错信息输出到一个文本文件
	ini_set('error_log','/app/php/logs/'.$name.'_error.txt');

	return true;
}

/**
 * [get_SqlValue description]
 * @param  [string] $sqlComm [description]
 * @return [num]          [description]
 * 获取一个sql值
 */
function get_sql_value($sqlComm){
	#执行sql
	$sql = mysql_query($sqlComm);
	$num = mysql_num_rows($sql);

	#如果找不到数据则返回错误信息
	if($num===0) return false;
	#返回数据
	while ($row = mysql_fetch_array($sql,MYSQL_ASSOC)){
		 return $row;
	}
}

/**
 * 发送post请求
 * @param string $url 请求地址
 * @param array $post_data post键值对数据
 * @return string
 */
function send_post($post_data, $url) {

    $postdata = http_build_query($post_data);
    $options = array(
        'http' => array(
            'method' => 'POST',
            'header' => 'Content-type:application/x-www-form-urlencoded',
            'content' => $postdata,
            'timeout' => 1 * 60 // 超时时间（单位:s）
        )
    );
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    return $result;
}

/**
 * [writeTxt description]
 * @param  [string] $file [description]
 * @param  [string] $str  [description]
 * @return [type]       [description]
 */
function write_txt($file,$str,$type="w"){
	#打开文件
	$myfile = fopen($file, $type) or die("Unable to open file!");
	#写入文本
	fwrite($myfile, $str."\r\n");
	#关闭文件
	fclose($myfile);

	return true;
}

/**
 * [get_time description]
 * @return [string] [当前时间]
 */
function get_time(){
	return date('Y年m月d日-H时i分s秒');
}


function is_img($file){
    return preg_match('/(.bmp|.jpg|.jpeg|.png|.tif|.gif|.pcx|.tga|.exif|.fpx|.svg|.psd|.cdr|.pcd|.dxf|.ufo|.eps|.ai|.raw|.WMF|.webp|.avif|.apng)/i',$file);
}

function my_scandir($dir)
{
    $files=array();//定义一个数组，做为返回值
    if(is_dir($dir))//判断路径是否存在
    {
        if($handle=opendir($dir))//打开这个路径，并赋值给 handle 变量
        {
            while(($file=readdir($handle))!==false)//用 readdir 读取路径，并且绝对不能为 false
            {
                if($file!="." && $file!="..")//返回的目录名称，不能是.或..,表示还有下一层目录，递归
                {
                    if(is_dir($dir."/".$file))//将得到新的目录名称，判断是否存在，
                    {
                    $files[$file]=my_scandir($dir."/".$file);//存在就将路径再传递给 my_scandir 函数，进行新一轮读取
                    }
                    else
                    {
                    $files[]=$dir."/".$file;//不存在，表示目录下一级没有文件了，将当前路径返回
                    }
                }
            }
        closedir($handle);//关闭路径
        return $files;
        }
    }
}


function get_file_line($file_path){
    if(!file_exists($file_path)) return [];

	$fp = fopen($file_path,"r");
	$str = fread($fp,filesize($file_path));//指定读取大小，这里把整个文件内容读取出来

	$arr = explode("\r\n",$str);

	fclose($fp);

	return $arr?$arr:[];

}

/**
 * 数组去重 根据字段
 * @param  [type] $arr [description]
 * @param  [type] $key [description]
 * @return [type]      [description]
 */
function assoc_unique($arr, $key) {

    $tmp_arr = array();

    foreach ($arr as $k => $v) {

        if (in_array($v[$key], $tmp_arr)) {

            unset($arr[$k]);

        } else {

            $tmp_arr[] = $v[$key];

        }

    }

    sort($arr);

    return $arr;

}

?>
