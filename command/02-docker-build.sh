#!/bin/bash

cd ..
ls
docker build . -t tag-test:latest

echo "docker build complete"
