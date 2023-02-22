# syntax=docker/dockerfile:1.4

ARG SMANGA_VERSION
ARG SMANGA_BASE_NAME

FROM ${SMANGA_BASE_NAME}/smanga:${SMANGA_VERSION}

RUN apk add --no-cache \
        mysql \
        mysql-client && \
    rm -rf \
        /var/cache/apk/* \
        /usr/share/man \
        /usr/share/php7 \
        /tmp/* && \
    sed -i "s/user='mysql'/user='smanga'/g" /usr/bin/mysqld_safe && \
    sed -i "s/group='mysql'/group='smanga'/g" /usr/bin/mysqld_safe && \
    sed -i "s/skip-networking/#skip-networking/g" /etc/my.cnf.d/mariadb-server.cnf

COPY --chmod=755 ./docker/rootfs_mysql /
