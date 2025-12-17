#!/bin/bash

REGISTRY='docker.io/beomzh'
IMAGE_NAME='chat-app'
ContainerEngine='podman'
BuildTarget='my-chat-app'

# tag 순차 로직 생성
LAST_TAG=$(podman images --format "{{.Tag}}" docker.io/beomzh/chat-app | grep '^v' | cut -d 'v' -f2 | sort -rn | head -n 1)

if [ -z "$LAST_TAG" ]; then
  LAST_TAG=0
fi

NEW_TAG=$((LAST_TAG + 1))
TAG="v$NEW_TAG"


FULL_TAG="$REGISTRY/$IMAGE_NAME:$TAG"


echo "Building: $FULL_TAG"
$ContainerEngine build -t $FULL_TAG ./$BuildTarget

# image 정리
# podman image prune -f

$ContainerEngine push $FULL_TAG
