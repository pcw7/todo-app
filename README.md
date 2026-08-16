<div align="center">
  <img src="favicon.svg" width="72" height="72" alt="오늘 할 일 로고" />

  # 오늘 할 일

  매일 10~20개의 할 일을 관리하는 개인용 체크리스트.<br/>서버도, 빌드도, 로그인도 없습니다.

  <p>
    <img alt="Vanilla JS" src="https://img.shields.io/badge/javascript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=222" />
    <img alt="No build step" src="https://img.shields.io/badge/build%20step-none-4F5BD5?style=flat-square" />
    <img alt="Zero dependencies" src="https://img.shields.io/badge/dependencies-0-D62976?style=flat-square" />
    <img alt="localStorage" src="https://img.shields.io/badge/storage-localStorage-FA7E1E?style=flat-square" />
  </p>
</div>

## 미리보기

<table>
  <tr>
    <th>라이트 모드</th>
    <th>다크 모드</th>
  </tr>
  <tr>
    <td><img src="screenshots/light.png" width="100%" alt="라이트 모드 스크린샷" /></td>
    <td><img src="screenshots/dark.png" width="100%" alt="다크 모드 스크린샷" /></td>
  </tr>
</table>

## 기능

| | |
|---|---|
| ✅ **할 일 추가·수정·삭제** | 입력창에서 바로 추가, 제목 클릭으로 인라인 수정 |
| ✔️ **완료 체크** | 체크하면 완료 표시되고 목록 하단으로 정렬 |
| 🏷️ **카테고리 분류** | 업무 / 개인 / 공부 세 가지로 구분, 카테고리별 필터 |
| 📊 **진행률 보기** | 완료 개수·비율, 카테고리별 남은 항목 수를 한눈에 표시 |
| ↩️ **삭제 되돌리기** | 삭제 시 5초간 실행 취소 가능한 토스트 표시 |
| 🗑️ **전체 초기화** | 확인 후 모든 항목을 한번에 삭제 |
| 🌗 **라이트/다크 모드** | OS 설정을 따르거나 헤더의 토글로 직접 전환, 선택은 저장됨 |
| 💾 **데이터 유지** | `localStorage` 기반이라 새로고침·재접속해도 데이터 유지 (브라우저/기기별로 분리 저장됨) |

## 실행 방법

빌드나 설치 과정이 없습니다. 아래 둘 중 하나로 바로 열면 됩니다.

**1) 파일로 직접 열기**

`index.html`을 브라우저로 더블클릭해서 엽니다.

**2) 로컬 서버로 열기** (선택)

```bash
python -m http.server 8791
```

이후 브라우저에서 `http://localhost:8791` 접속.

## 기술 스택

- 순수 HTML / CSS / JavaScript (프레임워크·번들러 없음)
- 브라우저 `localStorage`를 이용한 데이터 저장

## 파일 구성

```
index.html      화면 구조
style.css       스타일 (라이트/다크 테마 포함)
app.js          데이터 저장·렌더링·이벤트 처리 로직
favicon.svg     파비콘
screenshots/    README용 스크린샷
```
