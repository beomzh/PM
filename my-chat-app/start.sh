#!/bin/bash

APP='chat-app'
podman stop $APP
podman rm $APP
podman run -d -p 3000:3000 --name $APP localhost/node:v1
