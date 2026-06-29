# FISTIK — telefondan LAN test icin Windows Firewall'da 3000 portunu acar.
# Yonetici PowerShell'de calistirin:
#   Set-ExecutionPolicy -Scope Process Bypass; .\scripts\open-lan-firewall.ps1

$ruleName = 'FISTIK Next.js Dev 3000'
$existing = netsh advfirewall firewall show rule name="$ruleName" 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Kural zaten var: $ruleName"
} else {
  netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=3000 profile=private,domain
  Write-Host "Firewall kurali eklendi: TCP 3000 (private, domain)"
}

Write-Host ""
Write-Host "Telefondan (ayni Wi-Fi):"
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = 'BILGISAYAR-IP' }
Write-Host "  http://${ip}:3000/kk"
Write-Host ""
Write-Host "Dev sunucu: npm run dev"
