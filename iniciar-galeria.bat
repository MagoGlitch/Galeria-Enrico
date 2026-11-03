@echo off
title Galeria Clique e Poesia - Batizado do Enrico
cd /d "%~dp0"

echo ========================================================
echo   Clique & Poesia - Galeria do Batizado do Enrico
echo ========================================================
echo.
echo Iniciando galeria local...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause