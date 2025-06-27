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
```
## 📝 개요
- 어떤 작업을 했는지 간단히 설명해주세요.

## ✅ 작업 내용
- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 코드 리팩토링
- [ ] 문서 수정
- [ ] 기타

## 🔗 관련 이슈
- 관련된 이슈 번호: #123

## 📸 스크린샷 (선택)
작업 결과물이 있다면 첨부해주세요.

## 💬 기타 참고 사항
리뷰어가 알아야 할 사항이 있다면 적어주세요.
```

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
* `auth-service`
* `user-service`
* `funding-service`
* 'public-service'
* `payment-service`
* `ai-service`
* `interaction-service`

각 서비스는 독립적으로 개발·빌드·배포할 수 있으며, EC2 환경에서 Docker 또는 PM2 기반으로 운영됩니다.

## 서버 실행방법
### 전체 서버 실행방법
root $> npm run dev:all
### 서버별 실행 방법
<**-service> &> npm run dev
