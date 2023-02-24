<?

	#设置脚本无限时间执行
	set_time_limit(0);

	#获取数据
	if (!$_POST) {
	    $chapterPath = $argv[1];
	    $publicPath = $argv[2];
	    $mediaId = $argv[3];
	    $mangaId = $argv[4];
	    $chapterId = $argv[5];
	    $chapterType = $argv[6];
	    $mangaCover = $argv[7];
	    $chapterCover = $argv[8];
	    $userId = $argv[9];
	}else{
	    $chapterPath = $_POST['chapterPath'];
	    $publicPath = $_POST['publicPath'];
	    $mediaId = $_POST['mediaId'];
	    $mangaId = $_POST['mangaId'];
	    $chapterId = $_POST['chapterId'];
	    $chapterType = $_POST['chapterType'];
	    $mangaCover = $_POST['mangaCover'];
	    $chapterCover = $_POST['chapterCover'];
	    $userId = $_POST['userId'];
	}

	require_once $publicPath.'/common.php';
	require_once $publicPath.'/lkw.php';
	require_once $publicPath.'/../dosql/mysql-1.0.php';

	#设置日期路径
	$extractTo = get_cache_path($chapterPath);

	$sqlRes = dosql(array(
		'table'=>'compress',
		'type'=>'insert',
		'field'=>array('compressType','compressPath','compressStatus','createTime','updateTime','mediaId','mangaId','chapterId','chapterPath','userId'),
		'value'=>array($chapterType,$extractTo,'uncompressed','now()','now()',$mediaId,$mangaId,$chapterId,$chapterPath,$userId)
	));

	// 插入记录失败 直接退出
	if (!$sqlRes) {
		exit;
	}

	#文件夹不存在则创建
	if(!is_dir($extractTo)) mkdir($extractTo,0755,true);

	// 转换中
	dosql(array(
		'table'=>'compress',
		'type'=>'update',
		'field'=>array('compressStatus','updateTime'),
		'value'=>array('compressing','now()'),
		'where'=>"chapterId=$chapterId"
	));

	if($chapterType=='zip'){
		// 解压缩并获取文件总数据 (总数量包括文件夹与其他文件 仅具有参考意义)
		$imageCount = un_zip($chapterPath,$extractTo);
	}

	if($chapterType=='7z'){
		// 解压缩并获取文件总数据 (总数量包括文件夹与其他文件 仅具有参考意义)
		$imageCount = un_7z($chapterPath,$extractTo);
	}

	if($chapterType=='rar'){
		// 解压缩并获取文件总数据 (总数量包括文件夹与其他文件 仅具有参考意义)
		$imageCount = un_rar($chapterPath,$extractTo);
	}


	if ($chapterType=='pdf') {
		#进行转换操作
		$imageCount = un_pdf($chapterPath,$extractTo);
	}

	

	// 转换完成
	dosql(array(
		'table'=>'compress',
		'type'=>'update',
		'field'=>array('compressStatus','updateTime','imageCount'),
		'value'=>array('compressed','now()',$imageCount),
		'where'=>"chapterId=$chapterId"
	));

	// 获取第一张图片作为封面
	$poster = get_file_list($extractTo)[0];
	$copyPoster = "$posterPath/$chapterId.png";

	copy($poster,$copyPoster);

	if (!$mangaCover&&$poster) {
		dosql(array(
			'table'=>'manga',
			'type'=>'update',
			'field'=>array('mangaCover'),
			'value'=>array($copyPoster),
			'where'=>"mangaId=$mangaId"
		));
	}

	if (!$chapterCover&&$poster) {
		dosql(array(
			'table'=>'chapter',
			'type'=>'update',
			'field'=>array('chapterCover'),
			'value'=>array($copyPoster),
			'where'=>"chapterId=$chapterId"
		));
	}

function get_cache_path($path){
	global $cacheBasePath;
	#设置日期路径
	$date = '/'.date('Y').'/'.date('m').'/'.date('d').'/';
	$md5 = md5($path);

	return $cacheBasePath.$date.$md5;
}

function un_zip($path,$extractTo){
	$count = '';
	//新建一个ZipArchive的对象
	$zip = new ZipArchive();

	if ($zip->open($path) === TRUE){
		// 统计文件总数
		$count = $zip->numFiles;
		//假设解压缩到在当前路径下images文件夹的子文件夹php
	    $zip->extractTo($extractTo);
	    //关闭处理的zip文件
	    $zip->close();
	}else{
		exit;
	}

	return $count;
}

function un_rar($path,$extractTo){
	$rar_file = rar_open($path) or die("Failed to open Rar archive");
	$entries = rar_list($rar_file);
	// print_r($entries);
	// exit;
	foreach ($entries as $entry) {
		$name =  $entry->getName();// = iconv('GBK','UTF-8',$entry['name']);
		// $encode = mb_detect_encoding($name, array("ASCII",'UTF-8',"GB2312","GBK",'BIG5'));
		// echo mb_detect_encoding($entry->getName(), array("ASCII",'UTF-8',"GB2312","GBK",'BIG5'));
	    $entry->extract(false,"$extractTo/$name"); /*/dir/extract/to/换成其他路径即可*/
	    // echo "$extractTo/$name\n\r";
	} 
	rar_close($rar_file);

	return count($entries);
}

function un_7z($path,$extractTo){
	$command = "7za x '$path' -r -o'$extractTo'";

	shell_exec($command);

	$count = count(get_file_list($extractTo));

	return $count;
}

function un_pdf($path,$extractTo){
	// 内存 1gb
	$memory = read_ini_compress('imagick','memory');
	// 缓存 1gb
	$map = read_ini_compress('imagick','map');
	// 每英寸的像素数 100-300
	$density = read_ini_compress('imagick','density');
	// 压缩比 100
	$quality = read_ini_compress('imagick','quality');

	$command = "convert -limit memory $memory -limit map $map -density $density -quality $quality '$path' '$extractTo/x-%05d.jpg'";

	shell_exec($command);

	$count = count(get_file_list($extractTo));

	return $count;
}


/***
 * 读取ini文件的数值
 * */
function read_ini_compress($title,$key){
	$file = "/config/config.ini";
	if (!is_dir('/app/php')){
		$file = '/mnt/hhd-2t/04config/config.ini';
	}

	$data = filesize($file)==0 ? [] : parse_ini_file($file,true);

	if (!$data[$title]) return false;
	if (!$data[$title][$key]) return false;

	return $data[$title][$key];
}

function get_first_image($dir){
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

?>
