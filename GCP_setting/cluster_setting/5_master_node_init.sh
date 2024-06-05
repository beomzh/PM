# master node에서 init(초기화)작업
sudo kubeadm init

# config 설정 (master node only)
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# sudo kubectl 명령어 사용! 만약 sudo 없이 사용하고 싶다면
# 일반 user 일때
export KUBECONFIG=$HOME/.kube/config

# root user 일때
sudo -i
export KUBECONFIG=/etc/kubernetes/admin.conf

# worker-node join token 생성
kubeadm token create --print-join-command
# ex) kubeadm join 10.138.0.2:6443 --token ojk86x.zjd21pqg0rocngxi --discovery-token-ca-cert-hash sha256:6ff71a68bf204341a8be0223759b6091c4ae79a178aac979788a697ffb6716d0
