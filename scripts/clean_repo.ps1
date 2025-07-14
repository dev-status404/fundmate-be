# clean_repo.ps1
# PowerShell cleanup script for Nx monorepo
# 실행: PowerShell에서 .\clean_repo.ps1 을 실행하세요.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to project root (assumes script run from any subdirectory)
$projectRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $projectRoot

Write-Host "=== Checking npm install ==="

# Ensure dependencies are installed
npm install

Write-Host "=== Cleaning up build artifacts ==="

# Kill processes using ports 3000–3007
Write-Host "Killing processes on ports 3000 to 3007..."
for ($port = 3000; $port -le 3007; $port++) {
    try {
        $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            if ($pid) {
                Write-Host "Killing PID $pid on port $port"
                Stop-Process -Id $pid -Force -ErrorAction Stop
            }
        }
    } catch {
        # Port not in use, ignore
    }
}

# Remove dist directories in each app
Write-Host "Removing dist directories in each app..."

Get-ChildItem -Path shared -Directory | ForEach-Object {
    $distPath = Join-Path $_.FullName 'dist'
    if (Test-Path $distPath) {
        Write-Host "Removing $distPath"
        Remove-Item -Recurse -Force $distPath
    }
}

Get-ChildItem -Path apps -Directory | ForEach-Object {
    $distPath = Join-Path $_.FullName 'dist'
    if (Test-Path $distPath) {
        Write-Host "Removing $distPath"
        Remove-Item -Recurse -Force $distPath
    }
}

# Remove temporary folder at root if exists
if (Test-Path "tmp") {
    Write-Host "Removing root tmp/ directory"
    Remove-Item -Recurse -Force "tmp"
}

# Reset Nx cache and artifacts
Write-Host "Running nx reset..."
npx nx reset --silent

Write-Host "Cleanup complete."