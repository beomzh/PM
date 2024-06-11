kubectl create secret docker-registry myregistrykey \
  --docker-username=$(echo -n 'beomzh' | base64) \
  --docker-password=$(echo -n '<your-password>' | base64) \
  --docker-email=$(echo -n '<your-email>' | base64)
