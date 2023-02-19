# syntax=docker/dockerfile:1.4

ARG SMANGA_VERSION
ARG SMANGA_BASE_NAME

FROM alpine:3.17 AS Build
COPY --chmod=755 . /build
RUN cp -r /build/docker/rootfs_mysql /rootfs && \
    mkdir -p /rootfs/default && \
    cp -r /build/sql/smanga.sql /rootfs/default/smanga.sql

FROM ${SMANGA_BASE_NAME}/smanga:${SMANGA_VERSION}

RUN apk add --no-cache \
        mysql \
        mysql-client

COPY --chmod=755 --from=Build /rootfs /