# --------------------------------------------------------
# 1단계: 빌더 (Builder) - 의존성 설치 담당
# --------------------------------------------------------
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package 파일들 복사
COPY package*.json ./

# 의존성 설치 (npm ci는 package-lock.json을 기준으로 정확하게 설치합니다)
RUN npm ci


# --------------------------------------------------------
# 2단계: 러너 (Runner) - 실제 실행 담당
# --------------------------------------------------------
FROM node:18-alpine AS runner

# 작업 디렉토리 설정
WORKDIR /app

# ⭐️ 핵심: 보안을 위해 기본 제공되는 'node' 유저로 전환
# (이 아래부터 실행되는 모든 명령어는 root 권한이 없습니다)
USER node

# 1단계(builder)에서 설치한 node_modules만 쏙 가져오기
# --chown 옵션: 가져오면서 소유권을 root -> node 유저로 변경
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# 나머지 소스 코드 복사 (역시 소유권 변경)
COPY --chown=node:node . .

# 포트 문서화
EXPOSE 3000

# 서버 실행
CMD ["node", "server.js"]
