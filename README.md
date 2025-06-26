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

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/node?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/dzg7muODqR)

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve fundmate-be
```

To create a production bundle:

```sh
npx nx build fundmate-be
```

To see all available targets to run for a project, run:

```sh
npx nx show project fundmate-be
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/node:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/node?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
