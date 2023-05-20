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
FROM ${SMANGA_BASE_NAME}/smanga-base:${SMANGA_BASE_VERSION}

ENV S6_SERVICES_GRACETIME=30000 \
    S6_KILL_GRACETIME=60000 \
    S6_CMD_WAIT_FOR_SERVICES_MAXTIME=0 \
    S6_SYNC_DISKS=1 \
    LANG=C.UTF-8 \
    PS1="\[\e[32m\][\[\e[m\]\[\e[36m\]\u \[\e[m\]\[\e[37m\]@ \[\e[m\]\[\e[34m\]\h\[\e[m\]\[\e[32m\]]\[\e[m\] \[\e[37;35m\]in\[\e[m\] \[\e[33m\]\w\[\e[m\] \[\e[32m\][\[\e[m\]\[\e[37m\]\d\[\e[m\] \[\e[m\]\[\e[37m\]\t\[\e[m\]\[\e[32m\]]\[\e[m\] \n\[\e[1;31m\]$ \[\e[0m\]" \
    PUID=1000 \
    PGID=1000 \
    TZ=Asia/Shanghai \
    UMASK=022 \
    SMANGA_CONFIG=/data/config \
    SMANGA_CONFIG_INI=/data/config/config.ini \
    SMANGA_COMPRESS=/data/compress \
    SMANGA_POSTER=/data/poster \
    SMANGA_BOOKMARK=/data/poster/bookmark

COPY --chmod=755 --from=Build /rootfs /app
COPY --chmod=755 ./docker/rootfs /

EXPOSE 80
