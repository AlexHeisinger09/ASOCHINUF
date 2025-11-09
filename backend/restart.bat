@echo off
echo ========================================
echo   Reiniciando Backend de ASOCHINUF
echo ========================================
echo.

echo [1/3] Deteniendo procesos de Node.js...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo     ✓ Procesos detenidos
) else (
    echo     ℹ No hab�a procesos activos
)
echo.

echo [2/3] Esperando 2 segundos...
timeout /t 2 /nobreak >nul
echo     ✓ Listo
echo.

echo [3/3] Iniciando servidor backend...
echo.
echo ========================================
echo   Servidor Iniciando...
echo   Puerto: 5001
echo   Presiona Ctrl+C para detener
echo ========================================
echo.

npm run dev
