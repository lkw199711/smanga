#!/bin/bash

apk add --no-cache \
    mysql \
    mysql-client
rm -rf \
    /var/cache/apk/* \
    /tmp/*
sed -i "s/user='mysql'/user='smanga'/g" /usr/bin/mysqld_safe
sed -i "s/group='mysql'/group='smanga'/g" /usr/bin/mysqld_safe
sed -i "s/skip-networking/#skip-networking/g" /etc/my.cnf.d/mariadb-server.cnf
mysql_install_db --user=smanga --datadir=/var/lib/mysql
/usr/bin/mysqld_safe --datadir='/var/lib/mysql' &
echo "wait mysql start"
sleep 3
mysql -e "grant all privileges on *.* to 'root'@'%' identified by '123456' with grant option; alter user 'root'@'%' IDENTIFIED BY '123456';"
mysql -e "grant all privileges on *.* to 'smanga'@'%' identified by 'smanga' with grant option;"
mysql -e "grant all privileges on *.* to 'smanga'@'localhost' identified by 'smanga' with grant option;"
mysql -e "flush privileges;"
mysql -e "select User, host from mysql.user;"
mysql -e "create database smanga;"
mysql -e "show databases;"
mysql -e "use smanga; source /app/file/smanga.sql;"
sleep 2
mv /var/lib/mysql /var/lib/mysql_bak