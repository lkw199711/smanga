<?
	require_once '../public/common.php';
	require_once '../public/connect.php';
	require_once '../public/lkw.php';
	require_once '../dosql/mysql-function.php';

/**
 * 扫描媒体库
 * @param  [type] $mediaId [description]
 * @return [type]          [description]
 */
function scan_media($mediaId){
	$sqlRes = dosql(array(
			'table'=>'path',
			'cond'=>array(
				'like'=>'mediaId='.$mediaId,
			)
		)
	);

	$request = [];

	#遍历所有路径 返回所有漫画
	foreach ($sqlRes as $key => $value) {
		scan_path($value['path'],$value['pathId'],$mediaId);
	}
}

/**
 * 扫描路径
 * @param  [type] $path   [description]
 * @param  [type] $pathId [description]
 * @return [type]         [description]
 */
function scan_path($path,$pathId,$mediaId){
	$mangaList = get_file_list($path);

	// 插入漫画数据
	foreach ($mangaList as $key => $value){

		$sqlName = mysql_real_escape_string($value['name']);
		$sqlPoster = mysql_real_escape_string($value['poster']);
		$sqlPath = mysql_real_escape_string($value['path']);

		// 插入漫画记录
		dosql(array(
			'type'=>'insert',
			'table'=>'manga',
			'cond'=>array(
				'field'=>array('mediaId','pathId','mangaName','mangaCover','mangaPath','createTime','updateTime'),
				'value'=>array($mediaId,$pathId,$sqlName,$sqlPoster,$sqlPath,'now()','now()'),
			)
		));

		#获取漫画id
		$mangaSqlRes = dosql(array(
			'table'=>'manga',
			'name'=>array('mangaId'),
			'cond'=>array(
				'like'=>['pathId='.$pathId,'mangaName=\''.$sqlName.'\''],
			)
		));
		$mangaId = $mangaSqlRes[0]['mangaId'];

		// 扫描漫画章节
		$chapterNum = scan_chapter($value['path'],$mangaId,$mediaId,$pathId);

		// 插入章节数量
		dosql(array(
			'type'=>'update',
			'table'=>'manga',
			'cond'=>array(
				'like'=>[
					'pathId='.$pathId,
					'mangaName=\''.$sqlName.'\'',
					'mangaId='.$mangaId
					],
				'field'=>array('chaptercount','updateTime'),
				'value'=>array($chapterNum,'now()'),
			)
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
	$chapter = get_file_list($path);

	// var_dump($chapter);

	foreach ($chapter as $key => $value){

		$chaptername = mysql_real_escape_string($value['name']);
		$chapterCover = mysql_real_escape_string($value['poster']);
		$chapterPath = mysql_real_escape_string($value['path']);

		$sqlRes = dosql(array(
				'type'=>'insert',
				'table'=>'chapter',
				'cond'=>array(
					'field'=>array('mangaId','mediaId','pathId','chaptername','chapterCover','chapterPath','createTime','updateTime'),
					'value'=>array($mangaId,$mediaId,$pathId,$chaptername,$chapterCover,$chapterPath,'now()','now()'),
				)
			));
	}

	#返回章节数量
	return count($chapter);
}


function get_file_list($path){
	$list = array();
	$dir = dir($path);

	while (($file = $dir->read()) !== false){
		if(!is_dir($path."/".$file)) continue;
		if($file=='.'||$file=='..') continue;

  		array_push($list,array(
  			'name'=>$file,
  			'poster'=>get_first_image($path."/".$file),
  			'path'=>$path."/".$file
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
	
?>