# mariadb pod 기동
kubectl apply -f DB/maria-cm.yaml
kubectl apply -f DB/mariadb-secret.yaml
kubectl apply -f DB/maria_pv.yaml
kubectl apply -f DB/maria_sts.yaml
kubectl apply -f DB/maria_svc.yaml

# django pod 기동
kubectl apply -f django/django_deploy.yaml
kubectl apply -f django/django_svc.yaml



