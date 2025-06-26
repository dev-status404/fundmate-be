# FundmateBe

## 백엔드

| 서버           | 기능                         | 담당자 |
| -------------- | ---------------------------- | ------ |
| gateway        | gateway + nginx 리버스프록시 | 김지성 |
| auth           | auth 담당                    | 이정은 |
| user           | user 담당                    | 이정은 |
| funding-public | 펀딩, 공공데이터 담당        | 이하은 |
| payment        | 펀딩 예약 및 히스트리        | 김지성 |
| ai-document    | AI, PDF 문서 담당            | 김예진 |
| interaction    | 좋아요, 댓글, 알림 담당      | 김예진 |

---

## 🎯 프로젝트 목표

- 펀딩 서비스 플랫폼 개발
- AI 및 공공데이터 사용

---

## 🛠️ 사용 기술 및 도구

| 항목          | 사용 도구          |
| ------------- | ------------------ |
| 코드 에디터   | Visual Studio Code |
| DB 도구       | MySQL Workbench    |
| API 테스트    | Postman            |
| 컨테이너 환경 | Docker Desktop     |
| 디자인 툴     | Figma              |
| 협업 도구     | Notion, Slack      |

---

## 📁 **Git 컨벤션**

### 브랜치 네이밍 규칙

`(수정옵션)/기능설명` 형식을 따름  
예: `feat/login-api`

### 커밋 메시지 규칙

- **Header**: 변경 내용을 한 문장으로 요약
- **Body**: Header로 충분히 표현 가능하면 생략 가능. 필요하면 자세히 작성
- **Footer**: 관련된 이슈 등 참고 정보를 기재 가능 (`resolves: #1234`)

#### 메시지 형식

// Header, Body, Footer는 빈 행으로 구분한다.

타입(스코프): 주제(제목) // Header(헤더)

본문 // Body(바디)

바닥글 // Footer

//예시
git commit -m "fix: Safari에서 모달을 띄웠을 때 스크롤 이슈 수정

모바일 사파리에서 Carousel 모달을 띄웠을 때,

모달 밖의 상하 스크롤이 움직이는 이슈 수정.

resolves: #1137

#### 커밋 타입 목록

| 타입  | 설명                                |
| ----- | ----------------------------------- |
| feat  | 새로운 기능                         |
| fix   | 버그 수정                           |
| build | 빌드 관련 파일 변경, 모듈 설치/삭제 |
| chore | 자잘한 작업, 기타 변경              |
| ci    | CI 설정 변경                        |
| docs  | 문서 변경                           |
| style | 코드 스타일/포맷 변경               |
| test  | 테스트 코드 변경                    |
| perf  | 성능 개선                           |

---


# FundMate Backend Monorepo

FundMate는 마이크로서비스 아키텍처(MSA) 기반의 펀딩 플랫폼으로, 다음 서비스로 구성된 **Nx 모노레포**입니다:

* `api-gateway`
* `auth`
* `user`
* `funding`
* `payment`
* `publicdata`
* `ai`
* `interaction` (좋아요, 댓글 등)

각 서비스는 독립적으로 개발·빌드·배포할 수 있으며, EC2 환경에서 Docker 또는 PM2 기반으로 운영됩니다.

---

## 📝 목차

1. [빠른 시작](#-빠른-시작)
2. [Nx 워크스페이스 개요](#-nx-워크스페이스-개요)
3. [플러그인 및 프로젝트 생성](#-플러그인-및-프로젝트-생성)
4. [빌드 · 실행 · 테스트](#-빌드--실행--테스트)
5. [Docker & EC2 배포](#-docker--ec2-배포)
6. [협업 · 기여 가이드](#-협업--기여-가이드)
7. [라이선스](#-라이선스)

---

## 🚀 빠른 시작

```bash
# 레포 클론 & 의존성 설치
git clone git@github.com:fundmate/fundmate-be.git
cd fundmate-be
npm ci
```

### 로컬 개발 서버 실행

```bash
npx nx serve api-gateway
# 또는 개별 서비스
npx nx serve funding
```

### 빌드 (Production Bundle 생성)

```bash
npx nx build api-gateway
```

### 프로젝트 정보 조회

```bash
npx nx show project api-gateway
```

### 그래프(의존성) 시각화

```bash
npx nx graph
```

---

## 📦 Nx 워크스페이스 개요

FundMate 모노레포는 Nx를 통해 다음 이점을 얻습니다:

* **정교한 빌드 캐시 & 병렬화**: 변경된 부분만 빠르게 리빌드
* **통합 CI/CD 파이프라인**: 하나의 워크스페이스에서 모든 서비스 자동화
* **코드 생성기(Generator)**: `@nx/node` 등 플러그인을 통한 일관된 프로젝트 스캐폴딩

### Nx Cloud 연결

CI 성능 최적화, 분산 캐시를 위해 Nx Cloud를 설정할 수 있습니다. 우측 상단 배너의 링크를 클릭하여 워크스페이스를 연결하세요.

---

## 🧩 플러그인 및 프로젝트 생성 (@nx/node)

Node.js 애플리케이션과 라이브러리 관리를 위해 `@nx/node` 플러그인을 사용합니다.

### 설치

```bash
# 워크스페이스 최상위에서
npm install --save-dev @nx/node
```

> 플러그인 버전은 반드시 워크스페이스 Nx 버전과 동기화해야 합니다.

### 애플리케이션 생성

```bash
npx nx g @nx/node:application apps/my-new-service \
  --frontendProject=some-frontend-app  # (Optional) 프록시 설정
```

* `serve`: `npx nx serve my-new-service`
* 기본 포트 및 디버깅 포트는 `project.json`의 `serve.options.port`에서 변경합니다.

### 라이브러리 생성

```bash
# 기능별 공용 코드 분리
npx nx g @nx/node:lib libs/my-shared-lib

# npm 패키지 배포용
npx nx g @nx/node:lib libs/my-publish-lib --buildable --importPath=@fundmate/my-publish-lib
```

---

## 🛠️ 빌드 · 실행 · 테스트

### 빌드

```bash
npx nx build <service>
# 예) npx nx build payment
```

빌드 출력물은 `dist/apps/<service>` 또는 `dist/libs/<lib>`에 생성됩니다.

### 실행

* **개발 모드**: `npx nx serve <service>`
* **Production**: Node.js + PM2

  ```bash
  cp -r dist/apps/auth /remote/path/auth
  ssh ec2-user@host "pm2 start auth/main.js --name auth"
  ```

### 단위/통합 테스트

```bash
npx nx test <service>
```

### E2E 테스트 (Smoke)

```bash
npx nx e2e api-gateway-e2e
```

---

## 🐳 Docker & EC2 배포

1. 각 서비스 `apps/<service>/Dockerfile` 작성
2. CI에서 이미지 빌드 & 레지스트리 푸시

   ```yaml
   - name: Build Docker image
     run: |
       docker build -t fundmate/my-service:latest -f apps/my-service/Dockerfile .
       docker push fundmate/my-service:latest
   ```
3. EC2에서 `docker pull` & `docker run` 또는 `docker-compose up`

> **Tip:** `docker-compose.yml`로 여러 컨테이너를 한 번에 관리하면 편리합니다.

---

## 🤝 협업 · 기여 가이드

### 이슈 템플릿

* `.github/ISSUE_TEMPLATE/bug_report.md`  (🐛 버그 리포트)
* `.github/ISSUE_TEMPLATE/feature_request.md`  (✨ 기능 요청)

### PR 템플릿

* `.github/PULL_REQUEST_TEMPLATE.md`

  ```markdown
  ## 📢 PR 요약
  변경 사항 간략 설명

  ## 📋 체크리스트
  - [ ] 테스트 추가/수정
  - [ ] 코드 스타일 확인 (ESLint, Prettier)
  - [ ] 관련 이슈 번호 링크

  ## 🖼️ 스크린샷 (선택)
  ```

### 코드 스타일

* ESLint + Prettier

```bash
npm run lint
npm run format
```

### 커밋 메시지 규칙

* [Conventional Commits](https://www.conventionalcommits.org)

---

## 📄 라이선스

MIT © FundMate Team
