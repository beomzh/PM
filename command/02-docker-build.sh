#!/bin/bash

source ./env.sh

cd ..
ls
docker build . -t $IMAGE_NAME:latest

echo "docker build complete"
