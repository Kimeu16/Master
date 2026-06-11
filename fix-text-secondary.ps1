$files = @(
  'src\components\dashboard\EscalationDetailModal.tsx',
  'src\components\dashboard\SettingsView.tsx',
  'src\components\dashboard\GISMapView.tsx',
  'src\components\dashboard\SitesTable.tsx',
  'src\components\dashboard\UserDetailModal.tsx',
  'src\components\dashboard\EscalationView.tsx',
  'src\components\dashboard\SecurityView.tsx',
  'src\components\dashboard\ChecklistsView.tsx',
  'src\components\dashboard\ChecklistDetailModal.tsx',
  'src\components\dashboard\SiteDetailModal.tsx',
  'src\components\dashboard\AddMemberModal.tsx',
  'src\components\dashboard\StatsCard.tsx',
  'src\pages\Index.tsx'
)

foreach($f in $files) {
  $path = Join-Path 'c:\Apps\Master' $f
  if(Test-Path $path) {
    $content = Get-Content $path -Raw
    # Replace text-secondary when used as a text color class (not text-secondary-foreground or text-secondary/xx)
    $newContent = $content -replace 'text-secondary(?![/-])', 'text-muted-foreground'
    Set-Content $path -Value $newContent -NoNewline -Encoding UTF8
    Write-Host "Fixed: $f"
  } else {
    Write-Host "SKIP: $f (not found)"
  }
}
