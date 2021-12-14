<?php

#验证密钥
require_once 'check-key-word.php';
require_once './public/lkw.php';

$chapterPath = $_POST['chapterPath'];

if (!$chapterPath) {
	$chapterPath='';
}

// echo $DIR.$chapterPath;

$request = get_file_list($DIR.$chapterPath);

#返回信息
echo json_encode($request);

function get_file_list($path){
	$list = array();
	$dir = dir($path);

	// echo "Handle: " . $dir->handle . "<br>";
	// echo "Path: " . $dir->path . "<br>";

	while (($file = $dir->read()) !== false){
		if(!is_dir($path."/".$file)) continue;
		if($file=='.'||$file=='..') continue;

  		array_push($list,array(
  			'name'=>$file,
  			'poster'=>get_first_image($path."/".$file)
  		));
	}

	$dir->close();

	array_multisort (array_column( $list , 'name' ),SORT_NATURAL | SORT_FLAG_CASE, $list );

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


function get_first_image($dir)
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
						$img = get_first_image($dir."/".$file);//存在就将路径再传递给 my_scandir 函数，进行新一轮读取
						if ($img) {return $img;}
					}
					else
					{
						if (is_img($file)) {
							closedir($handle);//关闭路径
							return $dir."/".$file;
						}
					}
				}
			}
		closedir($handle);//关闭路径
		}
	}
}

?>