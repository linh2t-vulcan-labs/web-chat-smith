#!/bin/sh
# Seeds Vault's local dev KV store from apps/web/.env.local — the SAME file
# already used for `bun dev` — so there's one source of truth for local
# secrets, not two. Mounted in by docker-compose.yml, not part of the
# production image (see tools/docker/vault-entrypoint.ts for the same
# principle on the "web" service side).
set -e

ENV_FILE="${ENV_FILE:-/env.local}"

set --
if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      ''|'#'*) continue ;;
      *=*) ;;
      *) continue ;;
    esac
    key="${line%%=*}"
    value="${line#*=}"
    # Strip one layer of matching quotes — dotenv files sometimes wrap JSON/
    # values in quotes, `vault kv put key=value` wants the raw value.
    case "$value" in
      \"*\") value="${value#\"}"; value="${value%\"}" ;;
      \'*\') value="${value#\'}"; value="${value%\'}" ;;
    esac
    [ -z "$value" ] && continue
    set -- "$@" "$key=$value"
  done < "$ENV_FILE"
fi

if [ "$#" -eq 0 ]; then
  echo "[seed-vault] No non-empty values found in $ENV_FILE — seeding a minimal stub so the app can still boot."
  set -- "CS_PUBLIC_ENV_NAME=dev"
fi

vault kv put secret/chatsmith-web "$@"
