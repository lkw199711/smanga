<?
	require_once '../public/connect.php';

	function scan_path($path,$pathId,$mediaId){
		$command = "php ../scan/scan-path.php \"$path\" \"$pathId\" \"$mediaId\" \"$publicPath\"";

		pclose(popen('nohup '.$command.' & 2>&1','r'));
	}

	function compress($chapterPath,$mediaId,$mangaId,$chapterId,$chapterType,$mangaCover,$chapterCover,$userId){
		$command = "php ../compress/compress.php \"$chapterPath\" \"$publicPath\" \"$mediaId\" \"$mangaId\" \"$chapterId\" \"$chapterType\" \"$mangaCover\" \"$chapterCover\" \"$userId\"";

		pclose(popen('nohup '.$command.' & 2>&1','r'));
	}
?>