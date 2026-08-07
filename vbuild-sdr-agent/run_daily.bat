@echo off
cd /d "D:\UnHuman\Automation\automate-whatapp\vbuild-sdr-agent"
echo [%date% %time%] Running Vbuild SDR Agent...
python vbuild_sdr.py >> leads\sdr_log.txt 2>&1
echo [%date% %time%] Done. >> leads\sdr_log.txt
type leads\daily_report.md | findstr /c:"Total Leads" /c:"New Today" /c:"Top 5"
