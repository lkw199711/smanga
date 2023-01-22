<?
	if(!is_dir('/var/lib/mysql/smanga')){
		shell_exec('mv /var/lib/mysql-bak/* /var/lib/mysql/');
	}
?>