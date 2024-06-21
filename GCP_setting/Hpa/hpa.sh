# hpa 설정
# hpa에 관한 cpu metric 수집을 위한 metric-server POD가 필요
# kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# k get apiservices.apiregistration.k8s.io | grep metric 명령어로 v1beta1.metrics.k8s.io 서비스가 Available 상태인지 확인
# 인증서 에러로 curl로 파일 다운 후 yaml 수정

# traffic 양이 적기에 hpa 설정 제거
kubectl autoscale deployment k-django --cpu-percent=50 --min 2 --max 5
kubectl autoscale statefulset mariadb --cpu-percent=50 --min 1 --max 5
