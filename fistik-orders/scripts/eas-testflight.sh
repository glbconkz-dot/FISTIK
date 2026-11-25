#!/usr/bin/env bash
# Non-interactive EAS iOS production build + TestFlight submit.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${EXPO_TOKEN:-}" ]]; then
  echo "EXPO_TOKEN missing" >&2
  exit 2
fi

if [[ -z "${EXPO_PUBLIC_MANAGER_SECRET:-}" && -n "${MANAGER_APP_SECRET:-}" ]]; then
  export EXPO_PUBLIC_MANAGER_SECRET="$MANAGER_APP_SECRET"
fi

if [[ -z "${EXPO_PUBLIC_MANAGER_SECRET:-}" ]]; then
  echo "MANAGER_APP_SECRET / EXPO_PUBLIC_MANAGER_SECRET missing" >&2
  exit 2
fi

export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-https://fistik.kz}"

echo "== eas whoami =="
npx eas-cli whoami

python3 << 'PY'
import json, os, urllib.request

token = os.environ["EXPO_TOKEN"]
query = """
query {
  me {
    id
    username
    accounts {
      id
      name
      apps(limit: 50, offset: 0, filter: {searchTerm: "fistik"}) {
        id
        name
        fullName
        slug
      }
    }
  }
  meAll {
    username
  }
}
"""
# Fallback: list all apps if search filter is unsupported
query_all = """
query {
  me {
    username
    accounts {
      name
      apps(limit: 80, offset: 0) {
        id
        name
        fullName
        slug
      }
    }
  }
}
"""

def gql(q):
    req = urllib.request.Request(
        "https://api.expo.dev/graphql",
        data=json.dumps({"query": q}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode())

data = gql(query_all)
if data.get("errors"):
    print("graphql errors:", json.dumps(data["errors"])[:800], flush=True)
    raise SystemExit(3)

me = data.get("data", {}).get("me") or {}
print("expo user:", me.get("username"), flush=True)
apps = []
for account in me.get("accounts") or []:
    for app in account.get("apps") or []:
        apps.append({**app, "account": account.get("name")})
        print(f"  app {account.get('name')}/{app.get('slug')} id={app.get('id')} name={app.get('name')}", flush=True)

def score(app):
    blob = f"{app.get('slug','')} {app.get('name','')} {app.get('fullName','')}".lower()
    n = 0
    if "fistik-orders" in blob or blob.endswith("fistik-orders"):
        n += 100
    if "fistik" in blob:
        n += 20
    if "sipari" in blob or "order" in blob:
        n += 10
    return n

ranked = sorted(apps, key=score, reverse=True)
chosen = ranked[0] if ranked and score(ranked[0]) >= 20 else None
if chosen:
    print(f"LINK {chosen['id']} {chosen.get('account')}/{chosen.get('slug')}", flush=True)
    with open("/tmp/eas-link.txt", "w") as f:
        f.write(f"{chosen['id']}\n{chosen.get('account') or ''}\n{chosen.get('slug') or ''}\n")
else:
    print("NO_EXISTING_FISTIK_APP", flush=True)
    open("/tmp/eas-link.txt", "w").close()
PY

if [[ -s /tmp/eas-link.txt ]]; then
  PROJECT_ID="$(sed -n '1p' /tmp/eas-link.txt)"
  ACCOUNT="$(sed -n '2p' /tmp/eas-link.txt)"
  SLUG="$(sed -n '3p' /tmp/eas-link.txt)"
  echo "Linking existing Expo project $ACCOUNT/$SLUG $PROJECT_ID"
  python3 - "$PROJECT_ID" "$ACCOUNT" << 'PY'
import json, sys
from pathlib import Path
project_id, account = sys.argv[1], sys.argv[2]
path = Path("app.json")
data = json.loads(path.read_text())
expo = data.setdefault("expo", {})
extra = expo.setdefault("extra", {})
eas = extra.setdefault("eas", {})
eas["projectId"] = project_id
if account:
    expo["owner"] = account
path.write_text(json.dumps(data, indent=2) + "\n")
print("wrote app.json extra.eas.projectId")
PY
else
  echo "No existing fistik Expo app found; eas init will create one under this account"
  npx eas-cli init --id --non-interactive || true
fi

# Push manager secret into EAS production env (ignore if already exists)
npx eas-cli env:create --name EXPO_PUBLIC_MANAGER_SECRET --value "$EXPO_PUBLIC_MANAGER_SECRET" --environment production --visibility sensitive --non-interactive --force 2>/dev/null || \
npx eas-cli env:update --variable-name EXPO_PUBLIC_MANAGER_SECRET --value "$EXPO_PUBLIC_MANAGER_SECRET" --environment production --visibility sensitive --non-interactive 2>/dev/null || \
true

npx eas-cli env:create --name EXPO_PUBLIC_API_URL --value "$EXPO_PUBLIC_API_URL" --environment production --visibility plaintext --non-interactive --force 2>/dev/null || true

echo "== eas build ios production auto-submit =="
npx eas-cli build --platform ios --profile production --auto-submit --non-interactive --no-wait
