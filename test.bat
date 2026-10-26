@echo off
setlocal

echo =====================================================================
echo  EXECUTING COMPREHENSIVE AUTOMATED TEST SUITE
echo =====================================================================

cd /d "%~dp0"

REM Check if compiled
if not exist "bin\genomicindex\TestRunner.class" (
    echo [INFO] Test classes not found. Running build.bat first...
    call build.bat
    if errorlevel 1 exit /b 1
)

echo [1/2] Running Wavelet Tree Core and Genomic Operations Tests...
java -cp "bin" genomicindex.TestRunner
if errorlevel 1 (
    echo [ERROR] Wavelet Tree Test Suite Failed!
    exit /b 1
)

echo.
echo [2/2] Running Authentication, RBAC and Dataset Isolation Tests...
java -cp "bin" genomicindex.AuthTest
if errorlevel 1 (
    echo [ERROR] Authentication Test Suite Failed!
    exit /b 1
)

echo.
echo =====================================================================
echo  ALL TEST SUITES PASSED SUCCESSFULLY (100%% Pass Rate)
echo =====================================================================
exit /b 0
