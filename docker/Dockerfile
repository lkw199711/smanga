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

ENV PUID=1000 \
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
