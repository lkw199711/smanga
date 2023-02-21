<?
        if(!is_dir('/var/lib/mysql/smanga')){
                shell_exec('mv /var/lib/mysql-bak/* /var/lib/mysql/');
        }

        if(!is_file('/config/sql.ini')){
                shell_exec('mv /config-bak/sql.ini /config/');
        }
?>
