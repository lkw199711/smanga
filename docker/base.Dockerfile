# syntax=docker/dockerfile:1.4

FROM alpine:3.18

ARG UNRAR_VERSION=6.1.7

ENV S6_SERVICES_GRACETIME=30000 \
    S6_KILL_GRACETIME=60000 \
    S6_CMD_WAIT_FOR_SERVICES_MAXTIME=0 \
    S6_SYNC_DISKS=1 \
    LANG=C.UTF-8 \
    PS1="\[\e[32m\][\[\e[m\]\[\e[36m\]\u \[\e[m\]\[\e[37m\]@ \[\e[m\]\[\e[34m\]\h\[\e[m\]\[\e[32m\]]\[\e[m\] \[\e[37;35m\]in\[\e[m\] \[\e[33m\]\w\[\e[m\] \[\e[32m\][\[\e[m\]\[\e[37m\]\d\[\e[m\] \[\e[m\]\[\e[37m\]\t\[\e[m\]\[\e[32m\]]\[\e[m\] \n\[\e[1;31m\]$ \[\e[0m\]"

RUN set -ex && \
    apk add --no-cache \
        bash \
        curl \
        ca-certificates \
        coreutils \
        jq \
        netcat-openbsd \
        procps-ng \
        p7zip \
        s6-overlay \
        shadow \
        tzdata \
        xz \
    && \
    # Install build packages
    apk add --no-cache --upgrade --virtual=build-dependencies \
        build-base \
        gcc \
        g++ \
        make \
        musl-dev \
    && \
    # Build install unrar
    mkdir /tmp/unrar && \
    curl -o \
        /tmp/unrar.tar.gz -L \
        "https://www.rarlab.com/rar/unrarsrc-${UNRAR_VERSION}.tar.gz" && \  
    tar xf \
        /tmp/unrar.tar.gz -C \
        /tmp/unrar --strip-components=1 && \
    cd /tmp/unrar && \
    make && \
    install -v -m755 unrar /usr/local/bin && \
    # Install nginx
    apk add --no-cache --repository https://dl-cdn.alpinelinux.org/alpine/v3.13/community \
        pcre \
        nginx \
    && \
    # Install php7
    apk add --no-cache --repository https://dl-cdn.alpinelinux.org/alpine/v3.13/community \
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
        php7-phar \
        php7-iconv \
        php7-mbstring \
        php7-curl \
        composer \
    && \
    # Add user
    addgroup -S smanga -g 911 && \
    adduser -S smanga -G smanga -h /app -u 911 -s /bin/bash && \
    # Log Links
    mkdir -p /logs && \
    touch /logs/nginx_access.log && \
    touch /logs/nginx_error.log && \
    # PHP Nginx settings
    sed -i "s#short_open_tag = Off#short_open_tag = On#g" /etc/php7/php.ini && \
    sed -i "s#;open_basedir =#open_basedir = /#g" /etc/php7/php.ini && \
    sed -i "s#register_argc_argv = Off#register_argc_argv = On#g" /etc/php7/php.ini && \
    mkdir -p /run/php && \
    chown -R smanga:smanga /run/php && \
    rm -rf \
        /etc/nginx/nginx.conf \
        /etc/nginx/http.d/* \
        /etc/php7/php-fpm.d/www.conf && \
    # Clear
    apk del --purge build-dependencies && \
    rm -rf \
        /var/cache/apk/* \
        /usr/share/man \
        /usr/share/php7 \
        /tmp/*

COPY --chmod=755 ./docker/rootfs_base /

ENTRYPOINT [ "/init" ]
