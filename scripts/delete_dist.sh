#!/bin/bash
# git bash로도 실행이 가능합니다!
set -euo pipefail

# Move to project root (assumes script run from any subdirectory)
cd "$(git rev-parse --show-toplevel)"

echo "=== Cleaning up build artifacts ==="

echo "Running nx reset..."
npx nx reset --silent

echo "Removing .nx"
rm -rf ".nx"

# Remove dist directories in each app
for app in apps/*; do
  if [ -d "$app/dist" ]; then
    echo "Removing $app/dist"
    rm -rf "$app/dist"
  fi
done

# Remove temporary folder at root if exists
if [ -d "tmp" ]; then
  echo "Removing root tmp/ directory"
  rm -rf tmp
fi

# Reset Nx cache and artifacts
echo "Running nx reset..."
npx nx reset --silent


echo "Cleanup complete."