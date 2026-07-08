# Hướng Dẫn Cài Đặt Cụm K8s Bare-Metal 3-Node (Chuẩn Sản Xuất)

Tài liệu này tổng hợp toàn bộ các bước để xây dựng một cụm K8s từ con số 0 trên hệ điều hành **Rocky Linux 9**. Đặc biệt, tài liệu đã bao gồm cách xử lý triệt để lỗi "Bóng ma mạng Calico BGP" do đụng độ IP trên máy ảo có nhiều card mạng.

## 1. Thông số cụm
- **Hệ điều hành:** Rocky Linux 9 (Disable Swap, Firewall, SELinux)
- **Container Runtime:** Containerd
- **Mạng K8s (CNI):** Calico (Ép cứng giải IP để tránh lỗi đụng độ)
- **Master Node:** `k8s-master` (IP: 10.0.50.73)
- **Worker 1:** `k8s-worker1` (IP: 10.0.50.109)
- **Worker 2:** `k8s-worker2` (IP: 10.0.50.168)

---

## PHẦN 1: Chuẩn bị hệ điều hành (Chạy trên TẤT CẢ 3 Nodes)

**1. Đặt Hostname và sửa file Hosts:**
```bash
# Trên từng máy, đặt tên tương ứng:
sudo hostnamectl set-hostname k8s-master

# Sửa file hosts trên cả 3 máy để chúng biết tên nhau:
cat <<EOF | sudo tee -a /etc/hosts
10.0.50.73  k8s-master
10.0.50.109 k8s-worker1
10.0.50.168 k8s-worker2
EOF
```

**2. Tắt các cản trở của OS (Bắt buộc):**
```bash
# Tắt Swap
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Tắt Tường lửa (Firewalld & NFTables) để không chặn cổng K8s
sudo systemctl disable --now firewalld
sudo iptables -F
sudo nft flush ruleset

# Tắt SELinux
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

**3. Cấu hình module Kernel cho K8s:**
```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sudo sysctl --system
```

---

## PHẦN 2: Cài đặt Core K8s (Chạy trên TẤT CẢ 3 Nodes)

**1. Cài đặt Container Runtime (Containerd):**
```bash
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y containerd.io

sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
# Bật systemd cgroup
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

sudo systemctl enable --now containerd
```

**2. Cài đặt Kubeadm, Kubelet, Kubectl:**
```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF

sudo dnf install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo systemctl enable --now kubelet
```

---

## PHẦN 3: Khởi tạo Cụm và gỡ lỗi Mạng (MASTER ONLY)

**1. Khởi tạo Master Node:**
```bash
sudo kubeadm init --apiserver-advertise-address=10.0.50.73 --pod-network-cidr=10.244.0.0/16

# Copy cấu hình để có quyền chạy lệnh kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
*(Hãy COPY lại dòng lệnh `kubeadm join...` ở cuối màn hình in ra)*

**2. Join Worker vào cụm (Thực hiện trên 2 máy Worker):**
Dán dòng lệnh `kubeadm join...` mà bạn vừa copy vào 2 máy worker và nhấn Enter.

**3. Cài đặt mạng Calico (Thực hiện trên Master):**
```bash
# Tải manifest cài đặt Calico về
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml
kubectl apply -f calico.yaml
```

**🔴 BƯỚC CỰC KỲ QUAN TRỌNG: Sửa lỗi 0/1 BGP Peer đụng độ IP**
Nếu các máy ảo Worker của bạn có 2 card mạng (Ví dụ: `ens32` và `ens33`), Calico sẽ cực kỳ "ngu ngốc" khi tự động bốc nhầm IP của card mạng ảo không dùng tới. Hậu quả là các Node không thể giao tiếp với nhau (Pod cứ lơ lửng ở 0/1). Cách sửa triệt để:

```bash
# Ép toàn bộ Calico trên các Nodes CHỈ ĐƯỢC PHÉP dùng card mạng thuộc dải 10.0.50.x
kubectl patch daemonset calico-node -n calico-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/env/-", "value": {"name": "IP_AUTODETECTION_METHOD", "value": "cidr=10.0.50.0/24"}}]'

# Khởi động lại toàn bộ mạng Calico để cập nhật cấu hình
kubectl delete pod -n calico-system -l k8s-app=calico-node
```

---

## PHẦN 4: Cài đặt các công cụ bổ trợ (MASTER ONLY)

**1. Cài đặt MetalLB (Giải pháp LoadBalancer cho Bare-Metal):**
```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14.5/config/manifests/metallb-native.yaml
# Chờ 1 phút cho Pod khởi động, sau đó tạo dải IP Pool (ví dụ cấp IP 10.0.50.210)
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-pool
  namespace: metallb-system
spec:
  addresses:
    - 10.0.50.210-10.0.50.210
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
EOF
```

**2. Cài đặt Nginx Ingress Controller:**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/baremetal/deploy.yaml

# Bản baremetal mặc định là NodePort, ta phải patch nó thành LoadBalancer để nhận IP từ MetalLB
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "LoadBalancer"}}'
```

**3. Cài đặt Metrics Server (Cho tính năng Auto Scaling - HPA):**
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# Bỏ qua lỗi tự ký chứng chỉ TLS của baremetal
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

Đến đây, cụm K8s Bare-Metal của bạn đã đạt tiêu chuẩn 100% Production Ready! 🚀
