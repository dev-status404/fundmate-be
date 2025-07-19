#!/usr/bin/env bash
set -euo pipefail

### ===== 설정 (필요시 수정) =====
ACTIVE_FILE=".active"
HEALTH_PATH="/health-checks"           # 헬스엔드포인트 경로
INTERNAL_PORT=3000                     # 컨테이너 내부 포트
EXTERNAL_PORT=3000                     # 외부 고정 포트 (active만 매핑)
MAX_RETRY=20                           # 헬스체크 최대 재시도 횟수
SLEEP_SEC=10                            # 재시도 간격(초)
ROLLBACK_ON_FAIL=true                  # 새 환경 실패 시 자동 롤백 여부 (true/false)
REQUIRE_JSON_KEY=true                  # overall/status 키 검사할지
# overall == "ok" 또는 status == "ok" 둘 중 하나 통과 허용
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
need_cmd docker-compose
# jq가 없으면 단순 HTTP 200만 체크 (JSON 검사 비활성)
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

# 초기 active 파일
[ -f "$ACTIVE_FILE" ] || echo "blue" > "$ACTIVE_FILE"

CURRENT=$(cat "$ACTIVE_FILE" 2>/dev/null || echo "blue")

# 파라미터 처리 (rollback/status)
ACTION="${1:-switch}"

opposite() {
  if [ "$1" = "blue" ]; then echo "green"; else echo "blue"; fi
}

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

  # 새로 올릴 대상이 이미 빌드/존재 안하면 빌드 시도
  if ! docker ps -a --format '{{.Names}}' | grep -q "api-gateway_${TARGET}"; then
    log "컨테이너 api-gateway_${TARGET} 없음 → 빌드 & 기동(내부) 시도"
    docker-compose -f docker-compose.base.yml up -d --build api-gateway_${TARGET}
  fi

  log "포트 스위치: $CURRENT 내려 + $TARGET 외부 매핑"
  docker-compose -f docker-compose.base.yml -f docker-compose.${CURRENT}.yml down api-gateway_${CURRENT} || true
  docker-compose -f docker-compose.base.yml -f docker-compose.${TARGET}.yml up -d api-gateway_${TARGET}

  echo "$TARGET" > "$ACTIVE_FILE"
  log "롤백 완료. Active=$TARGET"
  exit 0
fi

if [ "$ACTION" != "switch" ]; then
  usage
  exit 1
fi

# 전환 모드
if [ "$CURRENT" = "blue" ]; then
  NEW="green"
else
  NEW="blue"
fi
OLD="$CURRENT"

log "현재 active: $CURRENT → 새 환경: $NEW 준비"

# 1) 새 gateway 컨테이너(내부)만 up (포트 매핑 없는 base + NEW 내부 정의)
log "새 환경 빌드 & 기동 (내부) ..."
docker-compose -f docker-compose.base.yml up -d --build api-gateway_${NEW}

# 2) 헬스체크 (새 컨테이너 내부 curl 사용 or 호스트 네트워크 통해 직접)
log "헬스체크 시작: api-gateway_${NEW} (${HEALTH_PATH})"
HEALTH_OK=false
for i in $(seq 1 $MAX_RETRY); do
  # 컨테이너 내부 접근 (localhost)
  if docker exec "api-gateway_${NEW}" curl -fs "http://localhost:${INTERNAL_PORT}${HEALTH_PATH}" -o /tmp/hc.out 2>/dev/null; then
    if $REQUIRE_JSON_KEY; then
      if command -v jq >/dev/null 2>&1; then
        if docker exec "api-gateway_${NEW}" sh -c "cat /tmp/hc.out | jq -e '.overall==\"ok\" or .status==\"ok\"' >/dev/null 2>&1"; then
          HEALTH_OK=true
          break
        else
          log "(${i}/${MAX_RETRY}) 응답 받았지만 JSON 상태값 아직 OK 아님"
        fi
      fi
    else
      HEALTH_OK=true
      break
    fi
  else
    log "(${i}/${MAX_RETRY}) 헬스 응답 없음 - 재시도"
  fi
  sleep "$SLEEP_SEC"
done

if ! $HEALTH_OK; then
  err "새 환경($NEW) 헬스체크 실패."
  if $ROLLBACK_ON_FAIL; then
    warn "자동 롤백: 기존($OLD) 유지"
  fi
  # 새 컨테이너 내리지는 않고 검사 위해 남김 (원하면 아래 uncomment)
  # docker rm -f api-gateway_${NEW} || true
  exit 1
fi
log "새 환경($NEW) 헬스 OK"

# 3) 포트 스위칭: OLD 내려 + NEW 외부포트 매핑
log "포트 스위치 진행: $OLD → $NEW"
docker-compose -f docker-compose.base.yml -f docker-compose.${OLD}.yml down api-gateway_${OLD} || true
docker-compose -f docker-compose.base.yml -f docker-compose.${NEW}.yml up -d api-gateway_${NEW}

# 4) 활성 파일 갱신
echo "$NEW" > "$ACTIVE_FILE"
log "전환 완료 ✅ Active: $NEW (port ${EXTERNAL_PORT})"

# 5) 최종 헬스 (외부포트로) 확인 (선택)
if curl -fs "http://localhost:${EXTERNAL_PORT}${HEALTH_PATH}" >/dev/null 2>&1; then
  log "외부 접근 헬스 OK"
else
  warn "외부 접근 헬스 실패(전환 직후). 필요시 수동 롤백: ./$0 rollback"
fi