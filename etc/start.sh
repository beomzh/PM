## 초기 pod 전체 관리

# mariadb pod 기동
kubectl apply -f DB/maria-cm.yaml
kubectl apply -f DB/mariadb-secret.yaml
kubectl apply -f DB/maria_pv.yaml
kubectl apply -f DB/maria_sts.yaml
kubectl apply -f DB/maria_svc.yaml

# django pod 기동
kubectl apply -f django/django_deploy.yaml
kubectl apply -f django/django_svc.yaml

# hpa 설정
kubectl autoscale deployment k-django --cpu-percent=50 --min=2 --max=5
kubectl autoscale statefulset mariadb --cpu-percent=50 --min 1 --max 5
