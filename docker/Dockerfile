# syntax=docker/dockerfile:1.4

ARG SMANGA_BASE_VERSION=latest
ARG SMANGA_BASE_NAME

FROM ${SMANGA_BASE_NAME}/smanga-base:${SMANGA_BASE_VERSION} AS Build

ARG SMANGA_VERSION

COPY --chmod=755 . /build
RUN set -ex && \
    cp -r /build/dist/docker /rootfs && \
    cp -r /build/file /rootfs/file && \
    cp -r /build/config /rootfs/config

WORKDIR /rootfs/php
RUN set -ex && \
    apk add --no-cache git && \
    git clone -b "version/${SMANGA_VERSION}" https://github.com/lkw199711/smanga-php.git /rootfs/php && \
    composer install --no-dev --prefer-dist && \
    rm -rf /rootfs/php/.git

FROM ${SMANGA_BASE_NAME}/smanga-base:${SMANGA_BASE_VERSION}

ENV LOG_OUT_FILES="/data/logs/nginx_error.log /data/logs/smanga*" \
    LOG_CLEAR=false \
    PATH=${PATH}:/app/php \
    PUID=1000 \
    PGID=1000 \
    UMASK=022 \
    TZ=Asia/Shanghai \
    SMANGA_APP=/app/php \
    SMANGA_CONFIG=/data/config \
    SMANGA_CONFIG_INI=/data/config/config.ini \
    SMANGA_COMPRESS=/data/compress \
    SMANGA_POSTER=/data/poster \
    SMANGA_BOOKMARK=/data/poster/bookmark \
    SMANGA_SUPERVISOR=/etc/supervisor.d

COPY --chmod=755 --from=Build /rootfs /app
COPY --chmod=755 ./docker/rootfs /

EXPOSE 80
