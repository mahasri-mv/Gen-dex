@echo off
setlocal

echo =====================================================================
echo  STARTING GENOMIC WAVELET TREE WEB SERVER
echo =====================================================================

cd /d "%~dp0"

REM Check if compiled
if not exist "bin\genomicindex\WebServer.class" (
    echo [INFO] Classes not found. Running build.bat first...
    call build.bat
    if errorlevel 1 exit /b 1
)

REM Check port parameter or default 8080
set PORT=8080
if not "%1"=="" set PORT=%1

echo [INFO] Launching server on port %PORT%...
echo [INFO] Open your browser at: http://localhost:%PORT%
echo [INFO] Press Ctrl+C in this console to stop the server.

start http://localhost:%PORT%

java -cp "bin" genomicindex.WebServer %PORT%
exit /b 0
