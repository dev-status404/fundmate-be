#!/usr/bin/env bash
set -euo pipefail

### ===== 설정 (필요시 수정) =====
ACTIVE_FILE=".active"
HEALTH_PATH="/health-checks"   # 헬스엔드포인트 경로
INTERNAL_PORT=3000             # 컨테이너 내부 포트
EXTERNAL_PORT=3000             # 외부 고정 포트 (active만 매핑)
MAX_RETRY=20                   # 헬스체크 최대 재시도 횟수
SLEEP_SEC=10                   # 재시도 간격(초)
ROLLBACK_ON_FAIL=true          # 새 환경 실패 시 자동 롤백 여부
REQUIRE_JSON_KEY=true          # overall/status 키 검사 여부
### =================================

log()  { printf "\033[1;34m[INFO]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err()  { printf "\033[1;31m[ERR ]\033[0m %s\n" "$*"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    err "필요한 명령 '$1' 이(가) 없습니다. 설치 후 다시 시도."
    exit 1
  }
}

need_cmd curl
need_cmd docker

# docker compose plugin 확인
if ! docker compose version >/dev/null 2>&1; then
  err "'docker compose' 명령을 사용할 수 없습니다. Docker (plugin) 버전을 설치/업데이트 해주세요."
  exit 1
fi

# jq가 없으면 단순 HTTP 200만 체크
if ! command -v jq >/dev/null 2>&1; then
  warn "jq 미설치 → JSON 필드 검증 생략."
  REQUIRE_JSON_KEY=false
fi

usage() {
  cat <<EOF
사용법:
  $(basename "$0")              : Blue ↔ Green 전환
  $(basename "$0") rollback     : 직전 버전으로 롤백 (현재 .active 반대편)
  $(basename "$0") status       : 현재 활성 상태/컨테이너/헬스 조회
EOF
}

[ -f "$ACTIVE_FILE" ] || echo "blue" > "$ACTIVE_FILE"
CURRENT=$(cat "$ACTIVE_FILE" 2>/dev/null || echo "blue")
ACTION="${1:-switch}"

opposite() { if [ "$1" = "blue" ]; then echo "green"; else echo "blue"; fi; }

print_status() {
  ACTIVE=$(cat "$ACTIVE_FILE")
  OTHER=$(opposite "$ACTIVE")
  log "Active: $ACTIVE (external port ${EXTERNAL_PORT})"
  log "Inactive: $OTHER"
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' | grep -E 'api-gateway_(blue|green)' || true
  echo
  log "Health check active gateway:"
  if curl -fs "http://localhost:${EXTERNAL_PORT}${HEALTH_PATH}" >/dev/null 2>&1; then
    log "  OK"
  else
    warn "  Fail or not responding"
  fi
}

if [ "$ACTION" = "status" ]; then
  print_status
  exit 0
fi

if [ "$ACTION" = "rollback" ]; then
  TARGET=$(opposite "$CURRENT")
  log "수동 롤백: $CURRENT → $TARGET"

  if ! docker ps -a --format '{{.Names}}' | grep -q "api-gateway_${TARGET}"; then
    log "컨테이너 api-gateway_${TARGET} 없음 → 빌드 & 기동(내부) 시도"
    docker compose -f docker-compose.base.yml up -d --build api-gateway_${TARGET}
  fi

  log "포트 스위치: $CURRENT 내려 + $TARGET 외부 매핑"
  docker compose -f docker-compose.base.yml -f docker-compose.${CURRENT}.yml down api-gateway_${CURRENT} || true
  docker compose -f docker-compose.base.yml -f docker-compose.${TARGET}.yml up -d api-gateway_${TARGET}

  echo "$TARGET" > "$ACTIVE_FILE"
  log "롤백 완료. Active=$TARGET"
  exit 0
fi

if [ "$ACTION" != "switch" ]; then
  usage
  exit 1
fi

if [ "$CURRENT" = "blue" ]; then NEW="green"; else NEW="blue"; fi
OLD="$CURRENT"
log "현재 active: $CURRENT → 새 환경: $NEW 준비"

# 1) 새 환경 (내부) 기동
log "새 환경 빌드 & 기동 (내부) ..."
docker compose -f docker-compose.base.yml up -d --build api-gateway_${NEW}

# 2) 헬스체크
log "헬스체크 시작: api-gateway_${NEW} (${HEALTH_PATH})"
HEALTH_OK=false
for i in $(seq 1 $MAX_RETRY); do
  RESP=$(docker exec "api-gateway_${NEW}" sh -c \
    "curl -fsS -m 3 http://localhost:${INTERNAL_PORT}${HEALTH_PATH}" 2>/dev/null || true)

  if [ -z "$RESP" ]; then
    log "(${i}/${MAX_RETRY}) 빈 응답 - 재시도"
  else
    if $REQUIRE_JSON_KEY && command -v jq >/dev/null 2>&1; then
      echo "$RESP" | jq -e '.overall=="ok" or .status=="ok"' >/dev/null 2>&1 && {
        HEALTH_OK=true; break;
      }
      log "(${i}/${MAX_RETRY}) JSON 받았지만 상태 아직 ok 아님"
    else
      HEALTH_OK=true
      break
    fi
  fi
  sleep "$SLEEP_SEC"
done

if ! $HEALTH_OK; then
  err "새 환경($NEW) 헬스체크 실패."
  if $ROLLBACK_ON_FAIL; then
    warn "자동 롤백: 기존($OLD) 유지"
  fi
  exit 1
fi
log "새 환경($NEW) 헬스 OK"

# 3) 포트 스위치
log "포트 스위치 진행: $OLD → $NEW"
docker compose -f docker-compose.base.yml -f docker-compose.${OLD}.yml down api-gateway_${OLD} || true
docker compose -f docker-compose.base.yml -f docker-compose.${NEW}.yml up -d api-gateway_${NEW}

# 4) 활성 파일 갱신
echo "$NEW" > "$ACTIVE_FILE"
log "전환 완료 ✅ Active: $NEW (port ${EXTERNAL_PORT})"

# 5) 외부 헬스 재확인
if curl -fs "http://localhost:${EXTERNAL_PORT}${HEALTH_PATH}" >/dev/null 2>&1; then
  log "외부 접근 헬스 OK"
else
  warn "외부 접근 헬스 실패(전환 직후). 필요시 수동 롤백: ./$0 rollback"
fi