@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo.
echo FISTIK — Vercel ortam degiskenleri yukleniyor...
echo.
node scripts\push-vercel-env.mjs
echo.
if %ERRORLEVEL% EQU 0 (
  echo Tamamlandi. fistik.kz birkaç dakika icinde guncellenir.
) else (
  echo Hata olustu. Bu penceredeki mesaji kopyalayip gonderin.
)
echo.
pause
