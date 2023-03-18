# syntax=docker/dockerfile:1.4

FROM alpine:3.17

RUN set -ex && \
    apk add --no-cache \
        bash \
        p7zip \
        s6-overlay \
        shadow \
        tzdata \
        xz \
    && \
    apk add --no-cache --upgrade --virtual=build-dependencies \
        build-base \
        gcc \
        g++ \
        make \
        musl-dev \
    && \
    apk add --no-cache --repository https://dl-cdn.alpinelinux.org/alpine/v3.15/community \
        pcre \
        nginx \
    && \
    apk add --no-cache --repository https://dl-cdn.alpinelinux.org/alpine/v3.15/community \
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
    pecl install rar && \
    echo "extension=rar.so" > /etc/php7/conf.d/00_rar.ini && \
    apk del --purge build-dependencies && \
    rm -rf \
        /var/cache/apk/* \
        /usr/share/man \
        /usr/share/php7 \
        /tmp/* && \
    # Add user
    addgroup -S smanga -g 911 && \
    adduser -S smanga -G smanga -h /app -u 911 && \
    usermod -s /bin/bash smanga && \
    # Log Links
    mkdir -p /log && \
    ln -s /var/log/nginx/access.log /log/nginx_access.log && \
    ln -s /var/log/nginx/error.log /log/nginx_error.log && \
    # PHP Nginx settings
    sed -i "s/short_open_tag = Off/short_open_tag = On/g" /etc/php7/php.ini && \
    sed -i "s#;open_basedir =#open_basedir = /#g" /etc/php7/php.ini && \
    sed -i "s/register_argc_argv = Off/register_argc_argv = On/g" /etc/php7/php.ini && \
    mkdir -p /run/php && \
    chown -R smanga:smanga /run/php && \
    rm -rf \
        /etc/nginx/nginx.conf \
        /etc/nginx/http.d/* \
        /etc/php7/php-fpm.d/www.conf

COPY --chmod=755 ./docker/rootfs_base /

ENTRYPOINT [ "/init" ]
