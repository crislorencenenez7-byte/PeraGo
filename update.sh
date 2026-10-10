#!/data/data/com.termux/files/usr/bin/bash

set -e

cd "$(dirname "$0")"

echo "=== PeraGo Safe Update Check ==="

echo
echo "Git status:"
git status --short

echo
echo "Hindi awtomatikong mag-a-add, commit, o push."
echo "Suriin muna ang mga file bago magpatuloy."
