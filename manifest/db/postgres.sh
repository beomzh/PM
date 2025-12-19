#!/bin/bash

podman stop pg-temp 2>/dev/null
podman rm -f pg-temp 2>/dev/null


# 임시
podman run -d --name postgres \
 --pod chat-pod \
 -e POSTGRES_PASSWORD=temp_password \
 -e POSTGRES_DB=chat_db \
 docker.io/library/postgres:18.1-alpine3.23
# -p 5432:5432 \
