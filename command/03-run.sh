#!/bin/bash


source ./env.sh
docker run -d --name $CONTAINER_NAME -p $HOST_PORT:8080  $IMAGE_NAME:latest
