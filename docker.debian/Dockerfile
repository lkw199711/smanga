# syntax=docker/dockerfile:1.4

ARG SMANGA_BASE_VERSION=latest
ARG SMANGA_BASE_NAME

# Build web
FROM alpine:3.17 AS Build
COPY --chmod=755 . /build
RUN cp -r /build/dist /rootfs && \
    cp -r /build/php /rootfs/php && \
    cp -r /build/file /rootfs/file && \
    cp -r /build/config /rootfs/config

# Main program
FROM ${SMANGA_BASE_NAME}/smanga-base:debian-${SMANGA_BASE_VERSION}

ENV S6_SERVICES_GRACETIME=30000 \
    S6_KILL_GRACETIME=60000 \
    S6_CMD_WAIT_FOR_SERVICES_MAXTIME=0 \
    S6_SYNC_DISKS=1 \
    PUID=1000 \
    PGID=1000 \
    TZ=Asia/Shanghai \
    UMASK=022

COPY --chmod=755 --from=Build /rootfs /app
COPY --chmod=755 ./docker.debian/rootfs /

EXPOSE 80
VOLUME [ "/config", "/poster", "/compress" ]

# 与mysql容器共享的挂载目录，用来初始化sql。
VOLUME [ "/sql" ]