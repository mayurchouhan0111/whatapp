# Run as Admin: PowerShell -ExecutionPolicy Bypass -File setup_task.ps1

$taskName = "VbuildSDR-Daily"
$scriptPath = "D:\UnHuman\Automation\automate-whatapp\vbuild-sdr-agent\run_daily.bat"
$pythonPath = (Get-Command python).Source

$action = New-ScheduledTaskAction -Execute $scriptPath
$trigger = New-ScheduledTaskTrigger -Daily -At 8am
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force

Write-Host "Task '$taskName' created. Runs daily at 8am."
