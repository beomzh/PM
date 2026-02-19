# 💬 PM (Project Messenger)

**K8s 기반의 고성능 실시간 메시징 시스템**
Redpanda(Kafka API)를 메시지 브로커로 활용하고, OAuth2 Proxy를 통해 보안이 강화된 Full-stack 채팅 애플리케이션입니다.

---

### 🏗️ Architecture Overview
본 프로젝트는 서비스의 안정성과 확장성을 위해 다음과 같은 인프라 구성을 가집니다.

* **Frontend & Backend**: `Node.js` 기반의 실시간 웹 소켓 채팅 서버 (`my-chat-app`)
* **Message Broker**: **Redpanda** (Lightweight Kafka)를 통한 메시지 스트리밍 및 이벤트 처리
* **Database**: **PostgreSQL** (StatefulSet)을 이용한 메시지 이력 및 사용자 데이터 영구 저장
* **Security**: **OAuth2 Proxy**를 연동하여 Google 및 Keycloak 기반의 인증 레이어 구축
* **Orchestration**: **Kubernetes (K8s)**를 통한 컨테이너 배포 및 Ingress를 이용한 트래픽 라우팅

---

### 📂 Project Structure
```text
.
├── my-chat-app/          # Node.js 채팅 애플리케이션 소스 (Server, Client, Dockerfile)
├── manifest/             # Kubernetes 리소스 정의 파일
│   ├── app/              # 채팅 앱 Deployment, Service, Ingress 설정
│   ├── db/               # PostgreSQL StatefulSet 및 서비스 설정
│   ├── kafka/            # Redpanda 브로커 및 모니터링 UI(Console) 설정
│   └── oauth/            # OAuth2-Proxy 인증 설정 (Google, Keycloak)
├── build.sh              # 애플리케이션 빌드 및 이미지 푸시 스크립트
├── rpk-topkc.sh          # Redpanda Topic 관리 보조 스크립트
└── README.md
```

### 🚀 Key Features

* **Real-time Messaging**: `Socket.io`와 `Kafka`를 결합한 실시간 데이터 파이프라인
* **Enterprise Security**: `OAuth2 Proxy`를 통한 강력한 외부 인증 연동
* **Data Persistence**: K8s `StatefulSet` 기반의 PostgreSQL 운영으로 데이터 안정성 확보
* **Observability**: `Redpanda UI`를 통한 실시간 토픽 및 메시지 모니터링
* **Infrastructure as Code**: 모든 인프라를 YAML 매니페스트로 관리하여 재현성 보장

---

### 🛠 Tech Stack

| 분류 | 기술 스택 |
| :--- | :--- |
| **Framework** | Node.js, Express, Socket.io |
| **Messaging** | **Redpanda** (Kafka Compatible) |
| **Database** | **PostgreSQL** |
| **Auth** | OAuth2 Proxy (Google, Keycloak) |
| **Infra** | Kubernetes, Docker, Ingress Nginx |

## 🔧 Getting Started
1. 전제 조건
- 작동 중인 Kubernetes 클러스터

- kubectl, helm, rpk 도구 설치

2. 인프라 배포 (Redpanda & DB)

```Bash
# Kafka(Redpanda) 배포
kubectl apply -f manifest/kafka/

# Database 배포
kubectl apply -f manifest/db/
```
3. 인증 설정 (OAuth2)

manifest/oauth/ 내의 .cfg 파일을 자신의 환경에 맞게 수정한 후 배포합니다.

```Bash
kubectl apply -f manifest/oauth/
```

4. 애플리케이션 빌드 및 배포

```Bash
# 이미지 빌드 스크립트 실행
./build.sh

# 앱 매니페스트 적용
kubectl apply -f manifest/app/
```
---
👤 Author
beomzh - GitHub Profile
