#!/usr/bin/env bash
set -e

# 활성 환경 파일(.active)이 없으면 blue로 초기화
ACTIVE_FILE=".active"
[ -f "$ACTIVE_FILE" ] || echo "blue" > "$ACTIVE_FILE"
CURRENT=$(cat "$ACTIVE_FILE")

# 새로 기동할 환경, 내릴 환경 결정
if [ "$CURRENT" = "blue" ]; then
  NEW="green"; OLD="blue"
else
  NEW="blue"; OLD="green"
fi

echo "▶ Deploying $NEW environment..."

# 1) 새 환경 빌드 & 기동
docker-compose \
  -f docker-compose.base.yml \
  -f docker-compose.${NEW}.yml up -d --build

HEALTH_PORT=$([ "$NEW" = "blue" ] && echo ${API_GATEWAY_PORT} || echo 3001)
echo "Waiting for $NEW (/health-checks on port $HEALTH_PORT) to report overall OK..."
while true; do
  RESPONSE=$(curl -fs "http://localhost:${HEALTH_PORT}/health-checks" 2>/dev/null) || {
    echo "Health endpoint unreachable, retrying..."
    sleep 5
    continue
  }
  if echo "$RESPONSE" | jq -e '.overall == "ok"' >/dev/null; then
    echo "Health-check passed."
    break
  fi
  echo "Health-check not OK yet, retrying..."
  sleep 5
done

# 3) 기존 환경 down
echo "$NEW is healthy. Shutting down $OLD environment..."
docker-compose \
  -f docker-compose.base.yml \
  -f docker-compose.${OLD}.yml down

# 4) 활성 환경 파일 업데이트
echo "$NEW" > "$ACTIVE_FILE"
echo "✅ Now active: $NEW on port 3000"