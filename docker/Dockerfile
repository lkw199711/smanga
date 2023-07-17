# syntax=docker/dockerfile:1.4

ARG SMANGA_BASE_VERSION=latest
ARG SMANGA_BASE_NAME

FROM ${SMANGA_BASE_NAME}/smanga-base:${SMANGA_BASE_VERSION} AS Build
RUN apk add --no-cache git
COPY --chmod=755 . /build
RUN cp -r /build/dist /rootfs && \
    cp -r /build/file /rootfs/file && \
    cp -r /build/config /rootfs/config
WORKDIR /rootfs/php
RUN git clone -b main https://github.com/lkw199711/smanga-php.git /rootfs/php
RUN composer install --no-dev --prefer-dist
RUN rm -rf /rootfs/php/.git

FROM ${SMANGA_BASE_NAME}/smanga-base:${SMANGA_BASE_VERSION}

ENV OUT_LOG_FILES="/logs/nginx_error.log /logs/smanga*" \
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
