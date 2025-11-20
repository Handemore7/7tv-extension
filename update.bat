@echo off
echo ========================================
echo 7TV Emotes - Quick Update
echo ========================================
echo.

set "CEP_DIR=C:\Program Files (x86)\Common Files\Adobe\CEP\extensions"
set "TARGET_DIR=%CEP_DIR%\7tv-extension"

echo Updating extension files...
xcopy /E /I /Y "%~dp0client" "%TARGET_DIR%\client" >nul 2>&1
xcopy /E /I /Y "%~dp0host" "%TARGET_DIR%\host" >nul 2>&1
xcopy /E /I /Y "%~dp0CSXS" "%TARGET_DIR%\CSXS" >nul 2>&1

if %errorlevel% equ 0 (
    echo SUCCESS: Extension updated
    echo.
    echo IMPORTANT: In Premiere Pro:
    echo 1. Close the 7TV Emotes panel
    echo 2. Reopen it from Window ^> Extensions ^> 7TV Emotes
    echo 3. Enable Debug checkbox to see logs
    echo 4. Right-click panel ^> Inspect Element ^> Console tab
) else (
    echo ERROR: Could not update files. Run as Administrator.
)
echo.
pause
