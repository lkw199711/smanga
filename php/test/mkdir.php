<?
        require_once '../public/common.php';
// 转化缓存目录
$cacheBasePath = getenv('SMANGA_COMPRESS');

$pathT = '/compress1/2082/01/13/wfsdafgsdfg';
$command = "mkdir $pathT -p";
mkdir($pathT,0755,true);
pclose(popen('nohup '.$command.' & 2>&1','r'));
        
		
        $path2 = $cacheBasePath.'/2023/01/03/wfsdafgsdfg';

        if(!is_dir($path)) {
                echo "not exeit";
                mkdir($path,0755,true);
        }else{
                echo "yes lt is";
        }
?>
