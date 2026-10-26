@echo off
setlocal

echo =====================================================================
echo  BUILDING GENOMIC WAVELET TREE INDEXING PROJECT WITH AUTHENTICATION
echo =====================================================================

cd /d "%~dp0"

REM 1. Verify Java compiler
where javac >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Java compiler was not found in system PATH.
    echo Please ensure JDK 17 or higher is installed and configured.
    exit /b 1
)

REM 2. Create bin directory
if not exist "bin" mkdir "bin"

REM 3. Compile Java Source Files (Main + Auth)
echo [INFO] Compiling production Java source files...
javac -d "bin" -encoding UTF-8 src\main\java\genomicindex\*.java src\main\java\genomicindex\auth\*.java
if errorlevel 1 (
    echo [ERROR] Compilation failed for main sources.
    exit /b 1
)

echo [INFO] Compiling test suite...
javac -d "bin" -cp "bin" -encoding UTF-8 src\test\java\genomicindex\*.java
if errorlevel 1 (
    echo [ERROR] Compilation failed for test sources.
    exit /b 1
)

REM 4. Copy Web Resources to bin\web for classpath fallback
if not exist "bin\web" mkdir "bin\web"
xcopy /y /q /s "src\main\resources\web\*" "bin\web\" >nul

echo =====================================================================
echo  BUILD SUCCESSFUL! Output classes located in bin\
echo =====================================================================
echo  To run the automated tests : test.bat
echo  To launch the web server   : run.bat
echo =====================================================================
exit /b 0
