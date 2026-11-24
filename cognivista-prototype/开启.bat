@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
rem 脚本已移入项目目录内，ROOT 即项目根，无需再拼接子目录
set "APP_DIR=%ROOT%"
set "PORT=3000"
set "URL=http://localhost:%PORT%/"

echo ========================================================
echo   CogniVista 观睿 — 全域认知智能赋能平台 启动脚本
echo ========================================================
echo.

if not exist "%APP_DIR%\package.json" (
    echo [错误] 未找到项目目录：%APP_DIR%
    pause
    exit /b 1
)

:: 检查端口是否已被占用（系统是否已启动）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "EXISTING_PID=%%a"
)

if defined EXISTING_PID (
    echo [提示] 检测到服务已在运行中（端口 %PORT%，PID: !EXISTING_PID!）。
    echo [提示] 正在为您直接打开浏览器：%URL%
    call :OPEN_BROWSER
    ping -n 3 127.0.0.1 >nul
    exit /b 0
)

pushd "%APP_DIR%"

:: 如缺失依赖则自动安装
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装项目依赖...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查 Node.js 与网络环境。
        popd
        pause
        exit /b 1
    )
)

:: 优先以生产模式极速启动（已存在 .next 构建），否则以开发模式启动
if exist ".next\BUILD_ID" (
    echo [信息] 正在以生产模式启动 CogniVista 观睿服务（端口 %PORT%）...
    start "CogniVista-Server" /min cmd /c "node node_modules\next\dist\bin\next start -p %PORT%"
) else (
    echo [信息] 未检测到生产构建，正在以开发模式启动服务（端口 %PORT%）...
    start "CogniVista-Server" /min cmd /c "node node_modules\next\dist\bin\next dev -p %PORT%"
)

popd

:: 等待服务就绪（最多等待 20 秒）
echo [信息] 正在等待本地服务就绪...
set /a WAIT_COUNT=0
:WAIT_LOOP
set /a WAIT_COUNT+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:%PORT%/api/health' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorlevel%==0 goto READY
if !WAIT_COUNT! GEQ 20 goto TIMEOUT_READY
ping -n 2 127.0.0.1 >nul
goto WAIT_LOOP

:READY
echo.
echo [成功] CogniVista 观睿已成功启动！
echo [地址] %URL%
echo [提示] 后台窗口已最小化运行，如需关闭请双击同目录下的「关闭.bat」。
echo.
call :OPEN_BROWSER
ping -n 3 127.0.0.1 >nul
exit /b 0

:TIMEOUT_READY
echo.
echo [提示] 服务仍在初始化中，已尝试打开浏览器：%URL%
echo        如页面暂未显示，请等待 2 秒后刷新即可。
call :OPEN_BROWSER
pause
exit /b 0

:OPEN_BROWSER
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%URL%"
    goto :eof
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%URL%"
    goto :eof
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%URL%"
    goto :eof
)
start "" "%URL%"
goto :eof
