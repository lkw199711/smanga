# syntax=docker/dockerfile:1.4

ARG ALPINE_VERSION=3.15

FROM crazymax/alpine-s6-dist:${ALPINE_VERSION} AS S6

FROM alpine:${ALPINE_VERSION}

ARG UNRAR_VERSION=6.2.10
ARG COMPOSER_VERSION=2.5.5
ARG PHP7_SWOOLE_VERSION=4.6.7

ENV S6_SERVICES_GRACETIME=30000 \
    S6_KILL_GRACETIME=60000 \
    S6_CMD_WAIT_FOR_SERVICES_MAXTIME=0 \
    S6_SYNC_DISKS=1 \
    LANG=C.UTF-8 \
    PS1="\[\e[32m\][\[\e[m\]\[\e[36m\]\u \[\e[m\]\[\e[37m\]@ \[\e[m\]\[\e[34m\]\h\[\e[m\]\[\e[32m\]]\[\e[m\] \[\e[37;35m\]in\[\e[m\] \[\e[33m\]\w\[\e[m\] \[\e[32m\][\[\e[m\]\[\e[37m\]\d\[\e[m\] \[\e[m\]\[\e[37m\]\t\[\e[m\]\[\e[32m\]]\[\e[m\] \n\[\e[1;31m\]$ \[\e[0m\]" \
    COMPOSER_ALLOW_SUPERUSER=1

COPY --from=S6 / /

RUN set -ex && \
    apk add --no-cache \
        bash \
        ca-certificates \
        coreutils \
        curl \
        inotify-tools \
        jq \
        netcat-openbsd \
        p7zip \
        procps \
        python3 \
        shadow \
        supervisor \
        zip \
        tzdata \
        unzip \
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
    # Install nginx php7
    apk add --no-cache \
        nginx \
        pcre \
        php7 \
        php7-bcmath \
        php7-common \
        php7-ctype \
        php7-curl \
        php7-dev \
        php7-dom \
        php7-fileinfo \
        php7-fpm \
        php7-gettext \
        php7-iconv \
        php7-json \
        php7-mbstring \
        php7-mysqli \
        php7-mysqlnd \
        php7-opcache \
        php7-openssl \
        php7-pcntl \
        php7-pear \
        php7-pecl-imagick \
        php7-pdo \
        php7-pdo_mysql \
        php7-pdo_pgsql \
        php7-pdo_sqlite \
        php7-phar \
        php7-pgsql \
        php7-posix \
        php7-redis \
        php7-session \
        php7-simplexml \
        php7-sockets \
        php7-sodium \
        php7-sysvshm \
        php7-sysvmsg \
        php7-sysvsem \
        php7-tokenizer \
        php7-xml \
        php7-xmlreader \
        php7-xmlwriter \
        php7-zip \
        php7-zlib \
    && \
    pecl channel-update pecl.php.net && \
    # Install php7-swoole
    echo yes | pecl install swoole-${PHP7_SWOOLE_VERSION} && \
    echo "extension=swoole.so" > /etc/php7/conf.d/00_swoole.ini && \
    # Install composer
    curl -o /usr/bin/composer https://getcomposer.org/download/${COMPOSER_VERSION}/composer.phar && \
    chmod +x /usr/bin/composer && \
    # Add user
    addgroup -S smanga -g 911 && \
    adduser -S smanga -G smanga -h /app -u 911 -s /bin/bash && \
    # PHP nginx supervisord settings
    sed -i "s#short_open_tag = Off#short_open_tag = On#g" /etc/php7/php.ini && \
    sed -i "s#;open_basedir =#open_basedir = /#g" /etc/php7/php.ini && \
    sed -i "s#register_argc_argv = Off#register_argc_argv = On#g" /etc/php7/php.ini && \
    mkdir -p /run/php && \
    chown -R smanga:smanga /run/php && \
    mkdir /etc/supervisor.d /run/supervisord && \
    chown smanga:smanga /etc/supervisor.d /run/supervisord && \
    rm -rf \
        /etc/nginx/nginx.conf \
        /etc/nginx/http.d/* \
        /etc/php7/php-fpm.d/www.conf \
        /etc/supervisord.conf && \
    # Clear
    apk del --purge build-dependencies && \
    rm -rf \
        /var/cache/apk/* \
        /usr/share/man \
        /usr/share/php7 \
        /tmp/*

COPY --chmod=755 ./docker/rootfs_base /

ENTRYPOINT [ "/init" ]
