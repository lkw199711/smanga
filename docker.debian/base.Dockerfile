FROM debian:11

ARG OVERLAY_VERSION="v2.2.0.3"

RUN set -ex && \
    apt update -y && \
    DEBIAN_FRONTEND=noninteractive apt install -y \
        p7zip \
        tzdata \
        xz-utils \
        wget \
        procps \
    && \
    if [ "$(uname -m)" = "x86_64" ]; then ARCH=amd64; elif [ "$(uname -m)" = "aarch64" ]; then ARCH=aarch64; elif [ "$(uname -m)" = "armv7l" ]; then ARCH=arm; fi && \
    wget \
        --no-check-certificate \
        -O /tmp/s6-overlay-installer \
        https://github.com/just-containers/s6-overlay/releases/download/${OVERLAY_VERSION}/s6-overlay-${ARCH}-installer && \
    chmod 755 /tmp/s6-overlay-installer && \
    /tmp/s6-overlay-installer / && \
    apt install -y \
        nginx \
    && \
    apt install -y \
        php7.4 \
        php7.4-common \
        php7.4-fpm \
        php7.4-json \
        php7.4-dev \
        php7.4-xml \
        php7.4-zip \
        php7.4-mysqli \
        php7.4-mysqlnd \
        php-pear \
    && \
    pecl channel-update pecl.php.net && \
    pecl install rar && \
    echo "extension=rar.so" > /etc/php/7.4/cli/conf.d/20-rar.ini && \
    echo "extension=rar.so" > /etc/php/7.4/fpm/conf.d/20-rar.ini && \
    apt install -y libmagickcore-dev libmagickwand-dev && \
    echo -e "\n" | pecl install imagick && \
    echo "extension=imagick.so" > /etc/php/7.4/cli/conf.d/20-imagick.ini && \
    echo "extension=imagick.so" > /etc/php/7.4/fpm/conf.d/20-imagick.ini && \
    # Locale
    apt update -y && \
    apt install -y locales && \
    locale-gen zh_CN.UTF-8 && \
    # Add user
    useradd -u 911 -U -d /app -s /bin/bash smanga && \
    usermod -G users smanga && \
    groupmod -g 911 smanga && \
    # PHP Nginx settings
    sed -i "s#short_open_tag = Off#short_open_tag = On#g" /etc/php/7.4/cli/php.ini /etc/php/7.4/fpm/php.ini && \
    sed -i "s#;open_basedir =#open_basedir = /#g" /etc/php/7.4/cli/php.ini /etc/php/7.4/fpm/php.ini && \
    sed -i "s#register_argc_argv = Off#register_argc_argv = On#g" /etc/php/7.4/cli/php.ini /etc/php/7.4/fpm/php.ini && \
    mkdir -p /run/php && \
    chown -R smanga:smanga /run/php && \
    rm -rf \
        /etc/nginx/nginx.conf \
        /etc/nginx/conf.d/* \
        /etc/php/7.4/fpm/pool.d/www.conf && \
    # Log Links
    mkdir -p /log && \
    ln -s /var/log/nginx/access.log /log/nginx_access.log && \
    ln -s /var/log/nginx/error.log /log/nginx_error.log && \
    # Clear
    apt-get remove -y php-pear && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf \
	    /tmp/* \
	    /var/lib/apt/lists/* \
	    /var/tmp/*

COPY --chmod=755 ./docker.debian/rootfs_base /

ENTRYPOINT [ "/init" ]
