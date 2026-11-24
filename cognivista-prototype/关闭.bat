@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "PORT=3000"
set "FOUND=0"
set "LAST_PID="

echo ========================================================
echo   CogniVista 观睿 — 全域认知智能赋能平台 关闭脚本
echo ========================================================
echo.

:: 1. 查找并结束监听 3000 端口的进程树（去重 IPv4/IPv6 同 PID）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "PID=%%a"
    if not "!PID!"=="0" if not "!PID!"=="!LAST_PID!" (
        echo [信息] 正在停止端口 %PORT% 上的服务进程（PID: !PID!）...
        taskkill /PID !PID! /T /F >nul 2>&1
        set "LAST_PID=!PID!"
        set "FOUND=1"
    )
)

:: 2. 清理可能残留的 CogniVista-Server 命令行窗口
taskkill /FI "WINDOWTITLE eq CogniVista-Server*" /T /F >nul 2>&1

if "!FOUND!"=="1" (
    echo.
    echo [成功] CogniVista 观睿本地服务已完全关闭，端口 %PORT% 已释放。
) else (
    echo [提示] 未检测到正在运行的 CogniVista 服务（端口 %PORT% 当前空闲）。
)

echo.
ping -n 3 127.0.0.1 >nul
exit /b 0
