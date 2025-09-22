#!/bin/bash


source ./env.sh

docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
