@echo off
setlocal

set SUBDOMAIN=%1
 
rem Register all commands and log output
start /b cmd /c "npm update && npm run register && npm run start"

rem Start LocalTunnel and log output
start /b cmd /c "ngrok http --url=kindly-ruling-tiger.ngrok-free.app 3000"

exit /b
