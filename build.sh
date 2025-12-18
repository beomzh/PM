#!/bin/bash

REGISTRY='docker.io/beomzh'
IMAGE_NAME='chat-app'
ContainerEngine='podman'
BuildTarget='my-chat-app'

# tag 순차 로직 생성
LAST_TAG=$(podman images --format "{{.Tag}}" $REGISTRY/$IMAGE_NAME | grep '^v' | cut -d 'v' -f2 | sort -rn | head -n 1)

if [ -z "$LAST_TAG" ]; then
  LAST_TAG=0
fi

NEW_TAG=$((LAST_TAG + 1))
TAG="v$NEW_TAG"
FULL_TAG="$REGISTRY/$IMAGE_NAME:$TAG"


echo "Building: $FULL_TAG"
$ContainerEngine build -t $FULL_TAG ./$BuildTarget


echo "--------------------------------------------------"
echo "🔍 검증 단계: 컨테이너를 임시로 기동합니다..."

# 임시 컨테이너 실행 (백그라운드, 3000번 포트 연결)
TEMP_CONTAINER=$($ContainerEngine run -d -p $PORT:$PORT --name "test-chat-app" $FULL_TAG)

# 서버 응답 대기 (최대 5초)
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT || echo "000")

if [ "$HTTP_STATUS" == "200" ]; then
  echo "✅ 서버가 정상적으로 응답합니다. (Status: 200)"
else
  echo "❌ 서버 응답에 문제가 있습니다. (Status: $HTTP_STATUS)"
  $ContainerEngine stop $TEMP_CONTAINER && $ContainerEngine rm $TEMP_CONTAINER
  exit 1
fi

echo "--------------------------------------------------"
read -p "❓ 이미지($TAG)를 푸시하시겠습니까? (y/n): " CONFIRM

echo "🧹 테스트 컨테이너를 정리 중..."
$ContainerEngine stop $TEMP_CONTAINER && $ContainerEngine rm $TEMP_CONTAINER

# image 푸시 or 삭제
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "🚀 Pushing: $FULL_TAG"
  $ContainerEngine push $FULL_TAG
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
