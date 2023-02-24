<?
	
	// un_zip('/mnt/hhd-2t/00manga/047z/111/漫画示例.7z','/mnt/hhd-2t/01compress/3022');
	un_zip('/mnt/hhd-2t/01compress/111.7z','/mnt/hhd-2t/01compress/3022');

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
?>