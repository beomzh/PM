# kubeadm 설치 후 모든 노드 작업
# root 권한 으로 작업 필요
# sudo -i 
# netfilter 설치
modprobe br_netfilter
echo 1 > /proc/sys/net/ipv4/ip_forward
echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
