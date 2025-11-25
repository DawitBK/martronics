$desktopPath = [Environment]::GetFolderPath("Desktop")
$targetDir = Join-Path $desktopPath "fullstackkk"

Write-Host "Creating target directory: $targetDir"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

# Define source paths
$backendSrc = "c:\Users\dawit\OneDrive\Desktop\martonics - Copy - Copy - Copy"
$frontendSrc = "c:\Users\dawit\OneDrive\Desktop\martronics_front - Copy\martronics_front"

# Define destination paths
$backendDest = Join-Path $targetDir "backend"
$frontendDest = Join-Path $targetDir "frontend"

Write-Host "`n=== Copying Backend ==="
Write-Host "Source: $backendSrc"
Write-Host "Dest:   $backendDest"
robocopy $backendSrc $backendDest /E /XD node_modules .git .vs /R:0 /W:0

Write-Host "`n=== Copying Frontend ==="
Write-Host "Source: $frontendSrc"
Write-Host "Dest:   $frontendDest"
robocopy $frontendSrc $frontendDest /E /XD node_modules .git .vs dist /R:0 /W:0

Write-Host "`nDone! Project saved to $targetDir"
Write-Host "You can now close this window."
Read-Host -Prompt "Press Enter to exit"
