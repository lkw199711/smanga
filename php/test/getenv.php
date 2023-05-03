<?

$host = getenv('SMANGA_COMPRESS');

if($host){
   echo $host; 
}else{
    echo '没有值';
}

?>