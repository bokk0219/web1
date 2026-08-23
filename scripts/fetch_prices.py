#!/usr/bin/env python3
"""
보유 종목의 현재가(USD)와 USD/KRW 환율을 Yahoo Finance의 공개 chart API로 조회해
JSON으로 출력한다.

사용법:
    python3 scripts/fetch_prices.py portfolio/holdings.json > /tmp/prices.json

`yfinance` 패키지의 기본 Ticker 조회는 내부적으로 curl_cffi(브라우저 TLS 지문 위장)를
쓰는데, 이 레포가 도는 클라우드 환경의 아웃바운드 프록시(MITM 방식)와 궁합이 안 맞아
"Recv failure: Connection reset by peer"로 계속 실패하는 것을 확인했다. 대신 표준
`requests` 라이브러리로 Yahoo의 `/v8/finance/chart/<symbol>` 엔드포인트를 직접 호출하면
이 환경에서 정상 동작한다. 그래서 이 스크립트는 yfinance를 쓰지 않는다.

이 스크립트가 동작하려면 이 환경의 아웃바운드 네트워크 정책이
query1.finance.yahoo.com / query2.finance.yahoo.com 접속을 허용해야 한다.
차단되어 있으면 requests.exceptions.RequestException 등으로 실패하며, 이 경우
stderr에 원인을 남기고 exit code 1로 종료한다. 호출한 쪽(러너)은 이 실패를 감지해서
"가격 조회 실패" 알림만 카카오톡으로 보내고 나머지 단계는 건너뛰어야 한다.
"""
import json
import sys
from datetime import datetime, timezone

import requests

CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
FX_TICKER = "KRW=X"  # 1 USD = X KRW
HEADERS = {"User-Agent": "Mozilla/5.0"}
TIMEOUT_SEC = 15


def fetch_price(symbol):
    r = requests.get(CHART_URL.format(symbol=symbol), headers=HEADERS, timeout=TIMEOUT_SEC)
    r.raise_for_status()
    meta = r.json()["chart"]["result"][0]["meta"]
    return float(meta["regularMarketPrice"])


def main():
    if len(sys.argv) != 2:
        print("usage: fetch_prices.py <holdings.json>", file=sys.stderr)
        sys.exit(2)

    with open(sys.argv[1], encoding="utf-8") as f:
        holdings = json.load(f)

    tickers = [p["ticker"] for p in holdings["positions"]]

    errors = {}
    prices = {}
    for ticker in tickers:
        try:
            prices[ticker] = fetch_price(ticker)
        except Exception as e:  # noqa: BLE001 - 개별 종목 실패는 나머지에 영향 주지 않음
            errors[ticker] = str(e)

    fx_rate = None
    try:
        fx_rate = fetch_price(FX_TICKER)
    except Exception as e:  # noqa: BLE001
        errors["_fx"] = str(e)

    result = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "fx_usdkrw": fx_rate,
        "prices": prices,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if fx_rate is None or len(errors) >= len(tickers):
        # 환율을 못 가져왔거나 전 종목이 실패하면 이후 단계가 무의미하므로 실패로 종료
        sys.exit(1)


if __name__ == "__main__":
    main()
