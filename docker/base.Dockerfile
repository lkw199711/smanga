# syntax=docker/dockerfile:1.4

FROM alpine:3.17

RUN set -ex && \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
    apk add --no-cache --repository https://mirrors.ustc.edu.cn/alpine/v3.15/community \
        nginx \
        pcre \
        xz \
        s6-overlay \
        bash \
        tzdata \
        shadow \
    && \
    apk add --no-cache --repository https://mirrors.ustc.edu.cn/alpine/v3.15/community \
        php7 \
        php7-common \
        php7-fpm \
        php7-json \
        php7-pecl-imagick \
        php7-dev \
        php7-xml \
        php7-zip \
        php7-mysqli \
        php7-mysqlnd \
        php7-pear \
    && \
    apk add --no-cache --upgrade --virtual=build-dependencies \
        build-base \
        gcc \
        g++ \
        make \
        musl-dev \
    && \
    pecl install rar && \
    echo "extension=rar.so" > /etc/php7/conf.d/00_rar.ini && \
    rm -rf \
        /var/cache/apk/* \
        /usr/share/man \
        /usr/share/php7 \
        /tmp/*

RUN addgroup -S smanga -g 911 && \
    adduser -S smanga -G smanga -h /app -u 911 && \
    usermod -s /bin/bash smanga && \
    mkdir -p /log && \
    ln -s /var/log/php7/error.log /log/php7_error.log && \
    ln -s /var/log/nginx/access.log /log/nginx_access.log && \
    ln -s /var/log/nginx/error.log /log/nginx_error.log

ENTRYPOINT [ "/init" ]
