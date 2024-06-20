# PMC
- 관리하는 상품의 재고 파악 및 현재 회사의 자금 확인
- 원자재 입고 -> 상품 출고 (잔액 및 계좌 관리)
- 신 상품 및 단종 상품 관리
- 거래 입출고 할때 +/- 버튼 혹은 동적 쿼리 담당 (재고확인)
- client = 화면 제외
- ui/ux => 관리자 느낌 => image 처리

# 작업 도구
1) 협업 = github / discord
2) 개발tool = VScode
3) 언어 
- backend: Python 
- frontend: HTML / CSS / JavaScript 
- DB = mariadb
- 관리 도구 = Kubernetes
4) 프레임워크 = django
5) 작업 환경 = gcp -> vm


# 요청
## 작업 후에 branch 변경후 pull 후에 merge 해주세요
1) chung님 DB스키마 설계 및 table 생성 쿼리 및 샘플 데이터 입력 쿼리 작성 부탁드립니다.
- user 테이블(클라이언트/어드민) 구분
- 원자재 테이블
- 상품 테이블
- 자금 관련 테이블(user의 컬럼으로 합쳐도 무방)

2) bin99님 html 화면을 2개정도 구성을 하려고 합니다.
- index.html의 메인페이지 구성 부탁드립니다.
- goods.html = 키오스크 화면에 맞게 상품만 추가할 수 있게 만들어주세요.
- README.md의 윗부분 설명한 정리도 부탁드립니다.

# Work
- django DB 연동 방식 변경  클러스터 내부 IP -> 외부 IP
- build 테스트 -> main push 시 자동 image 빌드 후 docker hub 업로드 확인 -> 각 노드별 image 자동 pulling 확인

