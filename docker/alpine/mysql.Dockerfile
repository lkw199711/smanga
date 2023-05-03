# syntax=docker/dockerfile:1.4

ARG SMANGA_VERSION
ARG SMANGA_BASE_NAME

FROM ${SMANGA_BASE_NAME}/smanga:nosql-${SMANGA_VERSION}

RUN apk add --no-cache \
        mysql \
        mysql-client && \
    sed -i "s/user='mysql'/user='smanga'/g" /usr/bin/mysqld_safe && \
    sed -i "s/group='mysql'/group='smanga'/g" /usr/bin/mysqld_safe && \
    sed -i "s/skip-networking/#skip-networking/g" /etc/my.cnf.d/mariadb-server.cnf && \
    rm -rf \
        /var/lib/mysql \
        /var/cache/apk/* \
        /tmp/*

COPY --chmod=755 ./docker/alpine/rootfs_mysql /