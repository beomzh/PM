#!/bin/bash

REGISTRY='registry.cn.openmaru-beom.local:8443/apps'
IMAGE_NAME='chat-app'
ContainerEngine='docker'
BuildTarget='my-chat-app'

# test build
TEMP_CONTAINER="test-chat-app"
FOR_PORT=3333
ListenPort=3000

# tag 순차 로직 생성
LAST_TAG=$($ContainerEngine images --format "{{.Tag}}" $REGISTRY/$IMAGE_NAME | grep '^v' | cut -d 'v' -f2 | sort -rn | head -n 1)

if [ -z "$LAST_TAG" ]; then
  LAST_TAG=0
fi

NEW_TAG=$((LAST_TAG + 1))
TAG="v$NEW_TAG"
FULL_TAG="$REGISTRY/$IMAGE_NAME:$TAG"
PUSH_TAG="$REGISTRY/$IMAGE_NAME:latest"



echo "Building: $FULL_TAG"
$ContainerEngine build -t $FULL_TAG ./$BuildTarget
$ContainerEngine tag $FULL_TAG $PUSH_TAG

read -p "Deploy image $FULL_TAG to registry? (y/n): " CONFIRM
# image 푸시 or 삭제
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "🚀 Pushing: $FULL_TAG"
  $ContainerEngine push $FULL_TAG
  $ContainerEngine push $PUSH_TAG
  echo "🎉 배포 성공!"
else
  echo "⚠️ 푸시가 취소되었습니다. 이미지는 로컬에 남아 있습니다: $FULL_TAG"
  echo "--------------------------------------------------"
  read -p "❓ 이미지($TAG)를 삭제하시겠습니까? (y/n): " DELETE_CONFIRM
  if [[ "$DELETE_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "🗑️ 이미지 삭제 중: $FULL_TAG"
    $ContainerEngine rmi $FULL_TAG
    echo "✅ 이미지가 삭제되었습니다."
  else
    echo "⚠️ 이미지가 로컬에 남아 있습니다: $FULL_TAG"
  fi
fi

# image 정리
# podman image prune -f
