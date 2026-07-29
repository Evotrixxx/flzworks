@echo off
set PATH=C:\Program Files\nodejs;%PATH%
set NODE_PATH=C:\Users\KomPhone\.npm-local\flzworks\node_modules
set NODE_OPTIONS=--max-old-space-size=4096

cd /d "%~dp0"
echo Starting Next.js dev server...
echo NODE_PATH: %NODE_PATH%
echo.
node "%NODE_PATH%\next\dist\bin\next" dev
