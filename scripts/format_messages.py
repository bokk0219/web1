#!/usr/bin/env python3
"""
alerts.json (+ 선택적으로 뉴스 news.json) 을 받아
카카오톡 나챗방으로 보낼 메시지 목록(각 200자 이내)을 JSON 배열로 출력한다.

사용법:
    python3 scripts/format_messages.py /tmp/alerts.json [news.json] > /tmp/messages.json

news.json 형식 (선택), 종목당 아래 둘 다 지원:
    {"AVGO": "1줄 뉴스 요약"}                                   # 링크 없이 제목/요약만
    {"AVGO": {"title": "기사 제목", "url": "https://..."}}      # 링크 포함 (권장)
네이버 검색 MCP가 연결되어 있지 않으면 이 인자를 생략하면 된다 — 뉴스 줄 없이 발송된다.

링크가 있는 종목은 시세/트리거 메시지와 별도로 "[종목] 뉴스: 제목 링크" 메시지를 하나 더
보낸다. 트리거가 많은 날은 시세 메시지 자체가 이미 200자에 가까워서, 같은 메시지에
링크까지 욱여넣으면 링크가 잘려 못 여는 상태로 발송될 수 있기 때문이다. 링크를 지키기 위해
필요하면 제목 쪽을 줄인다.

출력은 [요약 메시지, 종목1 시세 메시지, (종목1 뉴스 메시지), 종목2 시세 메시지, ...] 형태의
문자열 배열이며, 호출한 러너가 순서대로 카카오톡 도구에 하나씩 넘기면 된다.
"""
import json
import sys

MAX_LEN = 200


def truncate(s, limit=MAX_LEN):
    return s if len(s) <= limit else s[: limit - 1] + "…"


def trigger_line(t):
    if t["type"] == "profit_tier":
        return f"[매도알림] +{t['threshold_pct']}% 도달 → {t['sell_qty']}주(누적{int(t['cumulative_fraction_sold']*100)}%) 매도 검토"
    if t["type"] == "trailing_stop":
        return f"[트레일링] 고점{t['peak_return_pct']}%에서 -{t['drop_pp']}%p 하락 → {t['sell_qty']}주 매도 검토"
    return ""


def news_title_and_url(entry):
    if isinstance(entry, str):
        return entry, None
    if isinstance(entry, dict):
        return entry.get("title") or entry.get("summary") or "", entry.get("url")
    return None, None


def build_news_message(label, title, url):
    prefix = f"[{label}] 뉴스: "
    if not url:
        return truncate(prefix + title)

    room_for_title = MAX_LEN - len(prefix) - len(url) - 1  # -1 for the space before the url
    if room_for_title >= 5:
        return f"{prefix}{truncate(title, room_for_title)} {url}"
    if len(prefix) + len(url) <= MAX_LEN:
        return f"{prefix}{url}"
    # url 자체가 비정상적으로 길 때의 최후 수단: 앞부분이라도 남긴다 (열리지 않을 수 있음)
    return url[:MAX_LEN]


def main():
    if len(sys.argv) < 2:
        print("usage: format_messages.py <alerts.json> [news.json]", file=sys.stderr)
        sys.exit(2)

    with open(sys.argv[1], encoding="utf-8") as f:
        alerts = json.load(f)

    news = {}
    if len(sys.argv) >= 3:
        with open(sys.argv[2], encoding="utf-8") as f:
            news = json.load(f)

    messages = []

    triggered = [p for p in alerts["positions"] if p.get("triggers")]
    errored = [p for p in alerts["positions"] if p.get("error")]

    summary_lines = ["[해외주식 아침브리핑]"]
    if alerts.get("fx_usdkrw"):
        summary_lines.append(f"환율 {alerts['fx_usdkrw']:.1f}원/$")
    if triggered:
        names = ", ".join(f"{p['name']}({p['ticker']})" for p in triggered)
        summary_lines.append(f"매도규칙 발동: {names}")
    else:
        summary_lines.append("오늘 발동된 매도규칙 없음")
    if errored:
        summary_lines.append(f"시세조회 실패: {', '.join(p['ticker'] for p in errored)}")
    w = alerts.get("annual_target_warning")
    if w == "near":
        summary_lines.append(f"연간 실현이익 {alerts['realized_profit_krw_ytd']:,.0f}원 → 250만원 근접, 매도 주의")
    elif w == "exceeded":
        summary_lines.append(f"연간 실현이익 {alerts['realized_profit_krw_ytd']:,.0f}원 → 250만원 초과, 추가매도 자제")
    messages.append(truncate(" / ".join(summary_lines)))

    for p in alerts["positions"]:
        label = f"{p['name']}({p['ticker']})"

        if p.get("error"):
            messages.append(truncate(f"[{label}] 시세조회 실패: {p['error']}"))
            continue

        parts = [
            f"[{label}]",
            f"{p['price_krw']:,.0f}원",
            f"수익률 {p['return_pct']:+.1f}%",
            f"보유 {p['remaining_qty']}주",
        ]
        for t in p.get("triggers", []):
            parts.append(trigger_line(t))
        messages.append(truncate(" / ".join(parts)))

        title, url = news_title_and_url(news.get(p["ticker"]))
        if title or url:
            messages.append(build_news_message(label, title or "", url))

    print(json.dumps(messages, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
