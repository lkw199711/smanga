<?

	#设置脚本无限时间执行
	set_time_limit(0);

	#获取数据
	if (!$_POST) {
	    $path = $argv[1];
	    $pathId = $argv[2];
	    $mediaId = $argv[3];
	    $publicPath = $argv[4];
	}else{
	    $path = $_POST['path'];
	    $pathId = $_POST['pathId'];
	    $mediaId = $_POST['mediaId'];
	    $publicPath = $_POST['publicPath'];
	}

	require_once "$publicPath/common.php";
	require_once "$publicPath/connect.php";
	require_once "$publicPath/lkw.php";
	require_once "$publicPath/../dosql/mysql-1.0.php";

	// 获取默认浏览方式
	$sqlRes = dosql(array(
		'table'=>'path,media',
		'name'=>array('defaultBrowse','mediaType','directoryFormat','media.direction','media.removeFirst'),
		'where'=>array('path.mediaId=media.mediaId',"path.pathId=$pathId"),
	));

	$defaultBrowse = $sqlRes[0]['defaultBrowse'];
	$mediaType = $sqlRes[0]['mediaType'];
	$directoryFormat = $sqlRes[0]['directoryFormat'];
	$direction = $sqlRes[0]['direction'];
	$removeFirst = $sqlRes[0]['removeFirst'];

	// 是否扫描二级目录
	if ($directoryFormat==1) {
		scan_second_path($path,$pathId,$mediaId);
	}else{
		scan_path($path,$pathId,$mediaId);
	}

/**
 * 扫描媒体库
 * @param  [type] $mediaId [description]
 * @return [type]          [description]
 */
function scan_media($mediaId){
	$sqlRes = dosql(array(
			'table'=>'path',
			'where'=>'mediaId='.$mediaId,
		)
	);

	$request = [];

	#遍历所有路径 返回所有漫画
	foreach ($sqlRes as $key => $value) {
		scan_path($value['path'],$value['pathId'],$mediaId);
	}
}

function scan_second_path($path,$pathId,$mediaId){
	$mangaList = get_manga_list($path);
	foreach ($mangaList as $key => $value){
		scan_path($value['path'],$pathId,$mediaId);
	}
}

/**
 * 扫描路径
 * @param  [type] $path   [description]
 * @param  [type] $pathId [description]
 * @return [type]         [description]
 */
function scan_path($path,$pathId,$mediaId){
	global $defaultBrowse;
	global $mediaType;
	global $link;
	global $direction;
	global $removeFirst;

	$mangaList = get_manga_list($path);

	// 插入漫画数据
	foreach ($mangaList as $key => $value){

		$sqlName = mysqli_real_escape_string($link,$value['name']);
		$sqlPoster = mysqli_real_escape_string($link,$value['poster']);
		$sqlPath = mysqli_real_escape_string($link,$value['path']);
		$mangaType = $value['type'];

		// 插入漫画记录
		dosql(array(
			'type'=>'insert',
			'table'=>'manga',
			'field'=>array('mediaId','pathId','mangaName','mangaCover','mangaPath','browseType','direction','removeFirst','createTime','updateTime'),
			'value'=>array($mediaId,$pathId,$sqlName,$sqlPoster,$sqlPath,$defaultBrowse,$direction,$removeFirst,'now()','now()'),
		));

		#获取漫画id
		$mangaSqlRes = dosql(array(
			'table'=>'manga',
			'name'=>array('mangaId'),
			'where'=>['pathId='.$pathId,'mangaName=\''.$sqlName.'\''],
		));
		$mangaId = $mangaSqlRes[0]['mangaId'];

		// 扫描漫画章节
		if ($mediaType==1) {
			$sqlRes = dosql(array(
				'type'=>'insert',
				'table'=>'chapter',
				'field'=>array('mangaId','mediaId','pathId','chapterName','chapterCover','chapterPath','chapterType','createTime','updateTime'),
				'value'=>array($mangaId,$mediaId,$pathId,$sqlName,$sqlPoster,$sqlPath,$mangaType,'now()','now()'),
			));
			$chapterNum = 1;
		}else{
			$chapterNum = scan_chapter($value['path'],$mangaId,$mediaId,$pathId);
		}
		

		// 插入章节数量
		dosql(array(
			'type'=>'update',
			'table'=>'manga',
			'where'=>array(
				'pathId='.$pathId,
				'mangaName=\''.$sqlName.'\'',
				'mangaId='.$mangaId
			),
			'field'=>array('chaptercount','updateTime'),
			'value'=>array($chapterNum,'now()'),
		));
	}
}

// scan_chapter('B:\\00manga\\18x/[師走の翁] ヌーディストビーチに修学旅行で!!CH1~7',27,2);
/**
 * 扫描章节
 * @param  [type] $path    [description]
 * @param  [type] $mangaId [description]
 * @return [type]          [description]
 */
function scan_chapter($path,$mangaId,$mediaId,$pathId){
	global $link;

	$chapter = get_chapter_list($path);

	foreach ($chapter as $key => $value){

		$chapterName = mysqli_real_escape_string($link,$value['name']);
		$chapterCover = mysqli_real_escape_string($link,$value['poster']);
		$chapterPath = mysqli_real_escape_string($link,$value['path']);
		$chapterType = $value['type'];

		$sqlRes = dosql(array(
			'type'=>'insert',
			'table'=>'chapter',
			'field'=>array('mangaId','mediaId','pathId','chapterName','chapterCover','chapterPath','chapterType','createTime','updateTime'),
			'value'=>array($mangaId,$mediaId,$pathId,$chapterName,$chapterCover,$chapterPath,$chapterType,'now()','now()'),
		));
	}

	#返回章节数量
	return count($chapter);
}

function get_manga_list($path){
	$list = array();
	$dir = dir($path);
	$type = 'image';

	while (($file = $dir->read()) !== false){
		if($file=='.'||$file=='..') continue;

		$targetPath = $path."/".$file;

		$posterName = $targetPath;
		// 是文件
		if(!is_dir($targetPath)){
			if (preg_match('/(.cbr|.cbz|.zip|.epub)/i',$file)) {
				$type = 'zip';

			}
			elseif (preg_match('/.7z/i',$file)) {
				$type = '7z';
			}
			elseif (preg_match('/.rar/i',$file)) {
				$type = 'rar';
			}
			elseif (preg_match('/.pdf/i',$file)) {
				$type = 'pdf';
			}else{
				continue;
			}

			$posterName = preg_replace('/(.cbr|.cbz|.zip|.7z|.rar|.pdf)/i','',$posterName);
		};

  		array_push($list,array(
  			'name'=>$file,
  			'poster'=>get_poster($targetPath,$posterName),
  			'path'=>$targetPath,
  			'type'=>$type,
  		));
	}

	$dir->close();

	array_multisort (array_column( $list , 'name' ),SORT_NATURAL | SORT_FLAG_CASE, $list );

	return $list;
}

function get_chapter_list($path){
	$list = array();
	$dir = dir($path);
	$type = 'image';

	while (($file = $dir->read()) !== false){
		if($file=='.'||$file=='..') continue;

		$targetPath = $path."/".$file;

		$posterName = $targetPath;
		// 是文件
		if(!is_dir($targetPath)){
			if (preg_match('/(.cbr|.cbz|.zip|.epub)/i',$file)) {
				$type = 'zip';
			}
			elseif (preg_match('/.7z/i',$file)) {
				$type = '7z';
			}
			elseif (preg_match('/.rar/i',$file)) {
				$type = 'rar';
			}
			elseif (preg_match('/.pdf/i',$file)) {
				$type = 'pdf';
			}else{
				continue;
			}

			$posterName = preg_replace('/(.cbr|.cbz|.zip|.7z|.epub|.rar|.pdf)/i','',$posterName);
		}

  		array_push($list,array(
  			'name'=>$file,
  			'poster'=>get_poster($targetPath,$posterName),
  			'path'=>$targetPath,
  			'type'=>$type,
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

function get_file_list($path){
	$list = array();

	if (!is_dir($path)) {
		return $list;
	}
	
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

function get_poster($path,$name){
	$png = $name.'.png';
	$PNG = $name.'.PNG';
	$jpg = $name.'.jpg';
	$JPG = $name.'.jpg';

	if (is_file($png)) return $png;
	if (is_file($PNG)) return $PNG;
	if (is_file($png)) return $png;
	if (is_file($JPG)) return $JPG;

	$list = get_file_list($path);

	if (count($list)>0) {
		return $list[0];
	}else{
		return '';
	}
}
	
?>