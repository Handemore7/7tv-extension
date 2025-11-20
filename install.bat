@echo off
echo ========================================
echo 7TV Emotes - Premiere Pro Installation
echo ========================================
echo.

REM Enable CEP Debug Mode
echo [1/3] Enabling CEP Debug Mode...
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     SUCCESS: Debug mode enabled
) else (
    echo     WARNING: Could not set registry key. Run as Administrator.
)
echo.

REM Create extensions directory if it doesn't exist
set "CEP_DIR=C:\Program Files (x86)\Common Files\Adobe\CEP\extensions"
echo [2/3] Checking CEP extensions directory...
if not exist "%CEP_DIR%" (
    echo     Creating extensions directory...
    mkdir "%CEP_DIR%" 2>nul
)
echo     Directory: %CEP_DIR%
echo.

REM Copy extension files
echo [3/3] Installing extension...
set "TARGET_DIR=%CEP_DIR%\7tv-extension"

if exist "%TARGET_DIR%" (
    echo     Removing old version...
    rmdir /s /q "%TARGET_DIR%" 2>nul
)

echo     Copying files...
xcopy /E /I /Y "%~dp0*" "%TARGET_DIR%" >nul 2>&1

if %errorlevel% equ 0 (
    echo     SUCCESS: Extension installed
) else (
    echo     ERROR: Could not copy files. Run as Administrator.
    pause
    exit /b 1
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart Adobe Premiere Pro
echo 2. Go to: Window ^> Extensions ^> 7TV Emotes
echo 3. The panel should appear
echo.
echo See INSTALL.md for detailed instructions
echo.
pause
