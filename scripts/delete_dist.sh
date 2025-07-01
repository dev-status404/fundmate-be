#!/bin/bash

# Exit on error
set -euo pipefail

# Move to project root (assumes script run from any subdirectory)
cd "$(git rev-parse --show-toplevel)"

echo "=== Cleaning up build artifacts ==="

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

# Optional: clear Docker containers/images (uncomment if needed)
# echo "Pruning Docker system..."
# docker system prune --all --volumes --force

echo "Cleanup complete."