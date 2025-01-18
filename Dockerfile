FROM node:20.18.0-alpine3.20 AS base

FROM base AS prepare

RUN apk add git
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
COPY --from=builder /smanga-adonis/data/config/smanga.json /app/adonis/smanga.json
COPY --from=prepare /smanga-express /app/express
COPY ./dist/docker /app/smanga-website

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
