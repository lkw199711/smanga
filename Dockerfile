FROM node:20.18.0-alpine3.20 AS base

FROM base AS prepare

RUN apk add git python3
RUN git clone https://github.com/lkw199711/smanga-adonis.git /smanga-adonis
RUN git clone https://github.com/lkw199711/smanga-express.git /smanga-express
RUN rm -rf \
        /smanga-adonis/.git \
        /smanga-express/.git \
        /smanga-express/.env
RUN mv /smanga-express/.env.docker /smanga-express/.env

FROM prepare AS builder

WORKDIR /smanga-adonis
RUN npm install
RUN npm run build

FROM base

ENV S6_SERVICES_GRACETIME=30000 \
    S6_KILL_GRACETIME=60000 \
    S6_CMD_WAIT_FOR_SERVICES_MAXTIME=0 \
    S6_SYNC_DISKS=1 \
    LANG=C.UTF-8 \
    PS1="\[\e[32m\][\[\e[m\]\[\e[36m\]\u \[\e[m\]\[\e[37m\]@ \[\e[m\]\[\e[34m\]\h\[\e[m\]\[\e[32m\]]\[\e[m\] \[\e[37;35m\]in\[\e[m\] \[\e[33m\]\w\[\e[m\] \[\e[32m\][\[\e[m\]\[\e[37m\]\d\[\e[m\] \[\e[m\]\[\e[37m\]\t\[\e[m\]\[\e[32m\]]\[\e[m\] \n\[\e[1;31m\]$ \[\e[0m\]" \
    TZ='Asia/Shanghai' \
    PUID=1000 \
    PGID=1000

COPY --from=builder /smanga-adonis/build /app/adonis
COPY --from=builder /smanga-adonis/prisma /app/adonis/prisma
COPY --from=builder /smanga-adonis/data-example/config/smanga.json /app/adonis/smanga.json
COPY --from=builder /smanga-adonis/data-example/file /app/adonis/file
COPY --from=prepare /smanga-express /app/express
COPY ./dist/docker /app/smanga-website

# 创建配置脚本，在运行时根据环境变量修改smanga.json
RUN mkdir -p /etc/cont-init.d && \
    echo '#!/bin/bash' > /etc/cont-init.d/10-config-smanga && \
    echo 'set -e' >> /etc/cont-init.d/10-config-smanga && \
    echo '' >> /etc/cont-init.d/10-config-smanga && \
    echo '# 设置默认值' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_TYPE=${DB_TYPE:-sqlite}' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_HOST=${DB_HOST:-127.0.0.1}' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_PORT=${DB_PORT:-3306}' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_USERNAME=${DB_USERNAME:-smanga}' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_PASSWORD=${DB_PASSWORD:-smanga}' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_DATABASE=${DB_DATABASE:-smanga}' >> /etc/cont-init.d/10-config-smanga && \
    echo 'DB_FILE=${DB_FILE:-./data/smanga.db}' >> /etc/cont-init.d/10-config-smanga && \
    echo '' >> /etc/cont-init.d/10-config-smanga && \
    echo '# 根据数据库类型设置端口默认值' >> /etc/cont-init.d/10-config-smanga && \
    echo 'case "$DB_TYPE" in' >> /etc/cont-init.d/10-config-smanga && \
    echo '    mysql)' >> /etc/cont-init.d/10-config-smanga && \
    echo '        DB_PORT=${DB_PORT:-3306}' >> /etc/cont-init.d/10-config-smanga && \
    echo '        ;;' >> /etc/cont-init.d/10-config-smanga && \
    echo '    pgsql|postgres|postgresql)' >> /etc/cont-init.d/10-config-smanga && \
    echo '        DB_TYPE="pgsql"' >> /etc/cont-init.d/10-config-smanga && \
    echo '        DB_PORT=${DB_PORT:-5432}' >> /etc/cont-init.d/10-config-smanga && \
    echo '        ;;' >> /etc/cont-init.d/10-config-smanga && \
    echo '    sqlite)' >> /etc/cont-init.d/10-config-smanga && \
    echo '        DB_PORT=""' >> /etc/cont-init.d/10-config-smanga && \
    echo '        ;;' >> /etc/cont-init.d/10-config-smanga && \
    echo 'esac' >> /etc/cont-init.d/10-config-smanga && \
    echo '' >> /etc/cont-init.d/10-config-smanga && \
    echo '# 修改smanga.json文件' >> /etc/cont-init.d/10-config-smanga && \
    echo 'jq --arg type "$DB_TYPE" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   --arg host "$DB_HOST" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   --argjson port "${DB_PORT:-null}" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   --arg username "$DB_USERNAME" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   --arg password "$DB_PASSWORD" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   --arg database "$DB_DATABASE" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   --arg file "$DB_FILE" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   ".sql.client = \$type | .sql.host = \$host | .sql.port = \$port | .sql.username = \$username | .sql.password = \$password | .sql.database = \$database | .sql.file = \$file" \\' >> /etc/cont-init.d/10-config-smanga && \
    echo '   /app/adonis/smanga.json > /tmp/smanga.json.tmp && \\' >> /etc/cont-init.d/10-config-smanga && \
    echo 'mv /tmp/smanga.json.tmp /app/adonis/smanga.json' >> /etc/cont-init.d/10-config-smanga && \
    echo '' >> /etc/cont-init.d/10-config-smanga && \
    echo '# 如果使用的是SQLite，确保数据目录存在' >> /etc/cont-init.d/10-config-smanga && \
    echo 'if [ "$DB_TYPE" = "sqlite" ]; then' >> /etc/cont-init.d/10-config-smanga && \
    echo '    mkdir -p "$(dirname "$DB_FILE")"' >> /etc/cont-init.d/10-config-smanga && \
    echo 'fi' >> /etc/cont-init.d/10-config-smanga && \
    chmod +x /etc/cont-init.d/10-config-smanga

RUN apk add --no-cache \
        bash \
        shadow \
        tzdata \
        jq \
        redis \
        s6-overlay && \
    cd /app/adonis && \
    npm ci && \
    mkdir cache && \
    cd /app/express && \
    npm ci && \
    addgroup -S smanga -g 918 && \
    adduser -S smanga -G smanga -h /app -u 918 -s /bin/bash

COPY --chmod=755 ./docker /

ENTRYPOINT [ "/init" ]

VOLUME [ "/data" ]

EXPOSE 9797
