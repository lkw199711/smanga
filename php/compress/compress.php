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

	if($chapterType=='rar'){
		// 解压缩并获取文件总数据 (总数量包括文件夹与其他文件 仅具有参考意义)
		$imageCount = un_rar($chapterPath,$extractTo);
	}


	if ($chapterType=='pdf') {
		#进行转换操作
		$imageCount = pdf2png($chapterPath,$extractTo);
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


/**
* 将pdf文件转化为多张png图片
* @param string $pdf  pdf所在路径 （/www/pdf/abc.pdf pdf所在的绝对路径）
* @param string $path 新生成图片所在路径 (/www/pngs/)
*
* @return array|bool
*/
function pdf2png($pdf, $path)
{
    # 引入全局变量 再次说明 php函数不能自动继承全局变量
    global $chapterId;
    
    $finish = 0;

    if (!extension_loaded('imagick')) {
    	echo "no imagick";
        return false;
    }
    if (!file_exists($pdf)) {
    	echo "no file";
        return false;
    }
    if (!is_dir($path)) {
    	echo "no dir";
    	return false;
    }
    $im = new Imagick();
    //$im->setResolution(80, 80); //设置分辨率 值越大分辨率越高
    //$im->setCompressionQuality(100);			// 新图
    //$im->setImageCompressionQuality(30);	// 旧图
    
    $im->readImage($pdf);

    $count = count($im);

    foreach ($im as $k => $v) {
        $v->setImageFormat('png');
        $fileName = "$path/$k.png";
        if ($v->writeImage($fileName) == true) {
            $return[] = $fileName;
        }
    }

    return $count;
}
 
/**
 * 将pdf转化为单一png图片
 * @param string $pdf  pdf所在路径 （/www/pdf/abc.pdf pdf所在的绝对路径）
 * @param string $path 新生成图片所在路径 (/www/pngs/)
 *
 * @throws Exception
 */
function pdf2png2($pdf, $path)
{
    try {
        $im = new Imagick();
        $im->setCompressionQuality(100);
        $im->setResolution(120, 120);//设置分辨率 值越大分辨率越高
        $im->readImage($pdf);
 
        $canvas = new Imagick();
        $imgNum = $im->getNumberImages();
        //$canvas->setResolution(120, 120);
        foreach ($im as $k => $sub) {
            $sub->setImageFormat('png');
            //$sub->setResolution(120, 120);
            $sub->stripImage();
            $sub->trimImage(0);
            $width  = $sub->getImageWidth() + 10;
            $height = $sub->getImageHeight() + 10;
            if ($k + 1 == $imgNum) {
                $height += 10;
            } //最后添加10的height
            $canvas->newImage($width, $height, new ImagickPixel('white'));
            $canvas->compositeImage($sub, Imagick::COMPOSITE_DEFAULT, 5, 5);
        }
 
        $canvas->resetIterator();
        $canvas->appendImages(true)->writeImage($path . microtime(true) . '.png');
    } catch (Exception $e) {
        throw $e;
    }
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
