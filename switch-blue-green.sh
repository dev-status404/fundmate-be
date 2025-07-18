#!/bin/bash
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

# 2) 헬스체크 대기 (포트 3000 or 3001 은 override에서 정의됨)
HEALTH_PORT=$([ "$NEW" = "blue" ] && echo 3000 || echo 3001)
echo "Waiting for $NEW (/health on port $HEALTH_PORT)..."
until curl -fs "http://localhost:${HEALTH_PORT}/health" > /dev/null; do
  sleep 5
done

echo "$NEW is healthy. Shutting down $OLD..."

# 3) 기존 환경 내리기
docker-compose \
  -f docker-compose.base.yml \
  -f docker-compose.${OLD}.yml down

# 4) 활성 환경 파일 업데이트
echo "$NEW" > "$ACTIVE_FILE"
echo "✅ Now active: $NEW on port 3000"