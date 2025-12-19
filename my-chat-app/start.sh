#!/bin/bash

APP='chat-app'

REGISTRY='docker.io/beomzh'
IMAGE_NAME='chat-app'
ContainerEngine='podman'

# test용
$ContainerEngine rmi -f $REGISTRY/$IMAGE_NAME:v3
$ContainerEngine build -t $REGISTRY/$IMAGE_NAME:v3 .
$ContainerEngine run -d --pod chat-pod --name $APP $REGISTRY/$IMAGE_NAME:v3
# $ContainerEngine run -d -p 3000:3000 --name $APP $REGISTRY/$IMAGE_NAME:v3

