#!/bin/bash

APP='chat-app'

REGISTRY='docker.io/beomzh'
IMAGE_NAME='chat-app'
ContainerEngine='podman'
LAST_TAG=$(podman images --format "{{.Tag}}" $REGISTRY/$IMAGE_NAME | grep '^v' | cut -d 'v' -f2 | sort -rn | head -n 1)
NEW_TAG=$((LAST_TAG + 1))
TAG="v$NEW_TAG"

# test용
$ContainerEngine rmi -f $REGISTRY/$IMAGE_NAME:$TAG
$ContainerEngine build -t $REGISTRY/$IMAGE_NAME:$TAG .
#$ContainerEngine run -d --pod chat-pod --name $APP $REGISTRY/$IMAGE_NAME:$TAG
$ContainerEngine run -d -p 3333:3000 --name $APP $REGISTRY/$IMAGE_NAME:$TAG
