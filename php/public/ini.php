<?php

/***
 * 读取ini文件的数值
 * */
function read_ini($title,$key,$file){
	$data = filesize($file)==0 ? [] : parse_ini_file($file,true);

	if (!$data[$title]) return false;
	if (!$data[$title][$key]) return false;

	return $data[$title][$key];
}

/**
 * 写入ini数值
 * */
function write_ini($title,$key,$value,$file){
	$data = filesize($file)==0 ? [] : parse_ini_file($file,true);
	$data[$title][$key] = $value;

	write_ini_file($data,$file,true);
}

/**
 * 写入数组 追加
 * */
function write_ini_array($title,$arr,$file){
	$data = filesize($file)==0 ? [] : parse_ini_file($file,true);
	$data[$title] = $arr;

	write_ini_file($data,$file,true);
}

function read_ini_file($path)
{
   return filesize($path)==0 ? [] : parse_ini_file($path,true);
}


function write_ini_file($assoc_arr, $path, $has_sections=FALSE) { 
   $content = ""; 
    if ($has_sections) { 
       foreach ($assoc_arr as $key=>$elem) { 
          $content .= "[".$key."]\n"; 
          foreach ($elem as $key2=>$elem2) { 
             if(is_array($elem2)) 
             { 
                for($i=0;$i<count($elem2);$i++) 
                 { 
                    $content .= $key2."[] = \"".$elem2[$i]."\"\n"; 
                 } 
             } 
              else if($elem2=="") $content .= $key2." = \n"; 
              else $content .= $key2." = \"".$elem2."\"\n"; 
          } 
       } 
   } 
    else { 
       foreach ($assoc_arr as $key2=>$elem) { 
          if(is_array($elem)) 
          { 
             for($i=0;$i<count($elem);$i++) 
             { 
                 $content .= $key2."[] = \"".$elem[$i]."\"\n"; 
             } 
          } 
          else if($elem=="") $content .= $key2." = \n"; 
          else $content .= $key2." = \"".$elem."\"\n"; 
       } 
   } 

   if (!$handle = fopen($path, 'w')) {
      return false;
   }

    if (!fwrite($handle, $content)) { 
       return false; 
   } 
   fclose($handle); 
    return true; 
}
?>