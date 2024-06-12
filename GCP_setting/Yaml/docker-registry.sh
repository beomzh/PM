#!/bin/bash

# sh 실행시에만 남도록 암호화..

read -p "Enter Docker Username: " DOCKER_USERNAME
echo -n "Enter Docker Password: "
stty -echo
read DOCKER_PASSWORD
stty echo
echo
read -p "Enter Docker Email: " DOCKER_EMAIL

kubectl create secret docker-registry myregistrykey \
  --docker-username=$DOCKER_USERNAME \
  --docker-password=$DOCKER_PASSWORD \
  --docker-email=$DOCKER_EMAIL
