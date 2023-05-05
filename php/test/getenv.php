<?

$host = getenv('SMANGA_COMPRESS');
$SMANGA_CONFIG = getenv('SMANGA_CONFIG');

if($host){
   echo $host; 
}else{
    echo '没有值';
}

if($SMANGA_CONFIG){
    echo $SMANGA_CONFIG; 
 }else{
     echo '没有值';
 }

?>