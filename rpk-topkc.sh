#!/bin/bash
REPLICAS=2

# 1. Redpanda Pod 이름을 변수에 저장 (자동 추출)
RP_POD=$(kubectl get pods -l app=redpanda -o jsonpath='{.items[0].metadata.name}')
NS=chat

echo "Target Redpanda Pod: $RP_POD"

# 2. 파티션 변경 실행
kubectl -$NS exec -it $RP_POD -- rpk topic alter chat-messages --partitions $REPLICAS
kubectl -$NS exec -it $RP_POD -- rpk topic alter chat-events --partitions $REPLICAS

echo "✅ Partition update completed."
