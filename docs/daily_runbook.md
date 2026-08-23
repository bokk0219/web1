# 해외주식 아침 알림 — 매일 실행 절차

이 문서는 매일 아침 KST 07:00에 뜨는 자동 세션(Scheduled Trigger)이 그대로 따라야 할 절차다.
매번 완전히 새 세션에서 시작하므로, 아래 단계를 처음부터 순서대로 실행한다.

## 0. 레포 준비
1. `add_repo`(owner=`bokk0219`, repo=`web1`, access=`push`)로 저장소를 세션에 연결한다.
2. 안내된 명령으로 클론하고 `claude/foreign-stock-daily-alert-rw6lt0` 브랜치를 체크아웃한 뒤 `git pull`로 최신 상태(특히 `portfolio/holdings.json`, `portfolio/state.json`)를 받는다.
3. `register_repo_root`를 호출해 클론 경로를 등록한다.

## 1. 시세 조회
```
python3 scripts/fetch_prices.py portfolio/holdings.json > /tmp/prices.json
```
- 이 스크립트는 `yfinance` 패키지를 쓰지 않고 표준 `requests`로 Yahoo Finance의 공개
  chart API(`query1.finance.yahoo.com`)를 직접 호출한다. `yfinance`의 기본 조회 방식은
  이 클라우드 환경의 아웃바운드 프록시(MITM)와 궁합이 안 맞아 TLS 연결이 리셋되는 것을
  확인했기 때문이다. `requests`는 이미 설치돼 있어 별도 pip install이 필요 없다.
- **실패 시(네트워크 정책으로 Yahoo Finance 차단 등, exit code 1):** 나머지 단계를 건너뛰고 카카오톡으로
  `"[해외주식 알림] 오늘 시세 조회 실패 - 환경 네트워크 정책 확인 필요"` 한 통만 보내고 종료한다.
  절대 없는 시세를 지어내거나 어제 값을 그대로 재사용하지 않는다.

## 2. 관련 뉴스 검색 (PlayMCP 네이버 검색 MCP)
- 보유 6종목(`portfolio/holdings.json`의 `positions[].name`/`ticker`) 각각에 대해 최근 뉴스를 검색해
  한국어 1줄(40자 내외)로 요약한다.
- 결과를 `{"AVGO": "...", "IONQ": "...", ...}` 형태로 `/tmp/news.json`에 저장한다.
- **네이버 검색 MCP 도구가 이 세션 도구 목록에 없으면**, 이 단계를 건너뛰고 `/tmp/news.json`을 만들지 않는다
  (다른 검색 수단으로 대체하지 말 것 — 사용자가 명시적으로 PlayMCP 네이버 검색만 쓰길 원함).
  요약 메시지에 "뉴스 검색 도구 미연결"이라고만 남긴다.

## 3. 손익 계산 및 매도규칙 평가
```
python3 scripts/compute_alerts.py portfolio/holdings.json portfolio/state.json /tmp/prices.json > /tmp/alerts.json
```
- 이 스크립트가 `portfolio/holdings.json`과 `portfolio/state.json`을 직접 갱신한다 (remaining_qty 차감,
  peak_return_pct 갱신, tiers_completed/trailing_stop 기록, 연간 실현손익 누계).

## 4. 메시지 생성
```
python3 scripts/format_messages.py /tmp/alerts.json /tmp/news.json > /tmp/messages.json
# news.json이 없으면 두 번째 인자 생략:
# python3 scripts/format_messages.py /tmp/alerts.json > /tmp/messages.json
```
- 출력은 문자열 배열(요약 1통 + 종목별 최대 6통, 각 200자 이내)이다.

## 5. 카카오톡 발송
- `/tmp/messages.json`의 각 문자열을 순서대로 PlayMCP 카카오톡 나챗방 도구(`KakaotalkChat-MemoChat` 계열,
  이 세션 도구 목록에서 이름에 `Kakaotalk`이 들어간 도구를 찾아 사용)에 하나씩 넘겨 전송한다.
- 도구가 이 세션에 없으면 (연결 해제된 경우) 아무것도 보내지 못했음을 이 세션 종료 전에 기록만 해둔다
  (다른 채널로 대체 발송하지 않는다).

## 6. 상태 커밋 & 푸시
- `portfolio/holdings.json`, `portfolio/state.json` 변경분을 `claude/foreign-stock-daily-alert-rw6lt0` 브랜치에
  커밋하고 푸시한다. 커밋 메시지 예: `chore: daily alert state YYYY-MM-DD`.
- 이 저장소는 알림/상태 기록용이며 실제 매매는 하지 않는다 (사용자가 토스앱에서 직접 실행).

## 참고 — 설계 가정 (사용자 확인 필요 시 조정)
- 분할매도 25%는 항상 **최초 보유수량(original_qty)** 기준이며, 알림이 나가는 순간 그 비율만큼
  실제로 팔았다고 가정하고 `remaining_qty`를 차감한다. 실제 체결가/수량이 다르면 `portfolio/holdings.json`을
  사용자가 직접 보정해야 한다.
- 트레일링스탑은 peak가 15%p 하락할 때마다가 아니라, **peak가 갱신된 뒤** 그 새 peak에서 15%p 하락할 때
  한 번만 발동한다 (같은 peak에서 반복 알림 방지).
- 연간 실현이익 누계는 달력연도 기준으로 매년 1월 1일에 0으로 리셋된다.
