# syntax=docker/dockerfile:1.4

FROM alpine:3.17 AS Build
COPY --chmod=755 . /build
RUN mkdir /rootfs && \
    cp -r /build/dist /rootfs/app && \
    cp -r /build/php /rootfs/app/php && \
    cp -r /build/file /rootfs/app/file

FROM lkw199711/smanga-base:3.0.3

COPY --chmod=755 --from=Build /rootfs /app

CMD ["/bin/sh" "-c" "/usr/sbin/php-fpm7 && /usr/sbin/nginx && php /var/lib/init.php && /usr/bin/mysqld_safe && /bin/sh"]