<?
	require_once './public/common.php';
	
	$file = $_POST['file'];

	echo file_get_contents($file);
?>