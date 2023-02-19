# syntax=docker/dockerfile:1.4

ARG SMANGA_VERSION=3.0.8
ARG SMANGA_BASE_NAME=ddsderek

FROM alpine:3.17 AS Build
COPY --chmod=755 . /build
RUN cp -r /build/rootfs_mysql /rootfs

FROM ${SMANGA_BASE_NAME}/smanga:${SMANGA_VERSION}

RUN apk add --no-cache \
        mysql \
        mysql-client && \
    sed -i "s/user='mysql'/user='smanga'/g" /usr/bin/mysqld_safe && \
    sed -i "s/group='mysql'/group='smanga'/g" /usr/bin/mysqld_safe && \
    sed -i "s/skip-networking/#skip-networking/g" /etc/my.cnf.d/mariadb-server.cnf

COPY --chmod=755 --from=Build /rootfs /
