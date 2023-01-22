<?
	$zip = new ZipArchive();//新建一个ZipArchive的对象

	$extractTO = 'C:\Program-User\10temp\unip';

	$path = 'C:\Program-User\10temp\abc.rar';
	// $path = 'C:\Program-User\10temp\To LOVE1.cbz';
	// $path = 'C:\Program-User\10temp\Vol.01.cbz';
	if ($zip->open($path) === TRUE){
		//假设解压缩到在当前路径下images文件夹的子文件夹php
	    $zip->extractTo('C:\Program-User\10temp\unip');
	    //关闭处理的zip文件
	    $zip->close();
	}

	_unzip($path,$extractTO);

	echo time();

	function _unzip($fileName,$extractTO){
 
        // $fileName = iconv('utf-8','gb2312',"upload/zip/8月.rar");
//        echo $fileName . '</br>';
        // $extractTo = "upload/zip/TEST/";
        
        // $rar_file = rar_open($fileName) or die('could not open rar');
        // $list = rar_list($rar_file) or die('could not get list');
//        print_r($list);
 
		$rar_file = rar_open($fileName) or die("Failed to open Rar archive");
		$entries = rar_list($rar_file);
		foreach ($entries as $entry) {
		    $entry->extract($extractTO); /*/dir/extract/to/换成其他路径即可*/
		} 
		rar_close($rar_file);
 
        
//         foreach($list as $file) {
//             $pattern = '/\".*\"/';
//             preg_match($pattern, $file, $matches, PREG_OFFSET_CAPTURE);
//             $pathStr=$matches[0][0];
//             $pathStr=str_replace("\"",'',$pathStr);
// //            print_r($pathStr);
//             $entry = rar_entry_get($rar_file, $pathStr) or die('</br>entry not found');
//             $entry->extract($extractTo); // extract to the current dir
//         }
        // rar_close($rar_file);
 
    }
?>