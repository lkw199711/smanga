# syntax=docker/dockerfile:1.4

ARG SMANGA_VERSION
ARG SMANGA_BASE_NAME

FROM ${SMANGA_BASE_NAME}/smanga:nosql-${SMANGA_VERSION}

COPY --chmod=755 ./docker/rootfs_mysql /

RUN bash /install_mysql/install.bash

VOLUME [ "/var/lib/mysql" ]