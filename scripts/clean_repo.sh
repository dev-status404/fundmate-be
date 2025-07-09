#!/bin/bash
# git bash로도 실행이 가능합니다!
set -euo pipefail

# Move to project root (assumes script run from any subdirectory)
cd "$(git rev-parse --show-toplevel)"

echo "=== Checking npm install ==="

npm i

echo "=== Cleaning up build artifacts ==="

# Kill processes using ports 3000–3007
echo "Killing processes on ports 3000 to 3007..."
for port in {3000..3007}; do
  pid=$(lsof -ti tcp:$port) || true
  if [ -n "$pid" ]; then
    echo "Killing PID $pid on port $port"
    kill -9 "$pid"
  fi
done

# Remove dist directories in each app
echo "Removing dist directories in each app..."

for app in shared/*; do
  if [ -d "$app/dist" ]; then
    echo "Removing $app/dist"
    rm -rf "$app/dist"
  fi
done

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
