@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo.
echo FISTIK — Supabase kup isimleri + B2B tablolari...
echo.
node scripts\push-supabase-sql.mjs
echo.
pause
