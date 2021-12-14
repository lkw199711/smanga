<?
	require_once 'check-key-word.php';
	
	$file = $_POST['file'];

	echo file_get_contents($file);
	// echo file_get_contents('/data/0serve/manga/Under Observation My First Loves and I/1/0.jpg');
	// '/data/0serve/manga/Under Observation My First Loves and I\1\23.jpg'
	// '/data/0serve/manga/Under Observation My First Loves and I/1/0.jpg'
?>