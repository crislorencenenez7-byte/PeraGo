#!/data/data/com.termux/files/usr/bin/bash

SW_FILE="sw.js"

CURRENT=$(grep -oE 'perago-v[0-9]+' "$SW_FILE" | head -1)

if [ -z "$CURRENT" ]; then
  echo "Error: Service Worker version not found."
  exit 1
fi

VERSION=${CURRENT#perago-v}
NEXT=$((VERSION + 1))

sed -i "s/perago-v${VERSION}/perago-v${NEXT}/g" "$SW_FILE"

echo "PeraGo Service Worker: v${VERSION} → v${NEXT}"

git add \
  index.html \
  sw.js \
  styles.css \
  script.js \
  auth.css \
  auth.js \
  firebase-auth.js \
  firebase-config.js \
  session.js \
  pin.js \
  wallet.js \
  wallet-firestore.js \
  send-money.html \
  qr.html \
  profile.html \
  change-pin.html \
  register.html \
  forgot-pin.html \
  reset-pin.html \
  set-pin.html \
  pin-lock.html \
  manifest.json \
  icon-192.png \
  icon-512.png

echo ""
echo "Staged changes:"
git status --short

echo ""
read -p "Commit and push these changes? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "Cancelled."
  exit 0
fi

git commit -m "Update PeraGo v${NEXT}"

if [ $? -ne 0 ]; then
  echo "Commit failed."
  exit 1
fi

git push
