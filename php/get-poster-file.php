<?
	require_once 'check-key-word.php';
	
	$file = $_POST['file'];

	echo file_get_contents($file);
?>