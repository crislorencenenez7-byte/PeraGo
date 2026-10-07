#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "=== PeraGo Auto Update ==="

# Hanapin ang kasalukuyang SW version
CURRENT=$(grep -o 'perago-v[0-9]*' sw.js | head -1 || true)

if [ -z "$CURRENT" ]; then
    VERSION=1
else
    VERSION=$(echo "$CURRENT" | sed 's/perago-v//')
    VERSION=$((VERSION + 1))
fi

NEW_VERSION="perago-v$VERSION"

echo "New Service Worker version: $NEW_VERSION"

# Palitan ang cache version
sed -i -E "s/perago-v[0-9]+/$NEW_VERSION/g" sw.js

echo "Service Worker updated."

git add -A

git commit -m "Update PeraGo $NEW_VERSION" || {
    echo "Walang bagong changes na i-commit."
    exit 0
}

git push origin main

echo
echo "=== PeraGo update pushed successfully ==="
echo "Version: $NEW_VERSION"
