@echo off
echo Đang khởi động AsahiJapanTours Tour Calculator...
echo.

:: Kiểm tra xem Node.js đã được cài đặt chưa
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js chưa được cài đặt!
    echo Vui lòng cài đặt Node.js từ https://nodejs.org/
    echo.
    pause
    exit /b
)

:: Kiểm tra xem đã cài đặt các package chưa
if not exist node_modules (
    echo Các package chưa được cài đặt. Đang cài đặt...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Không thể cài đặt các package!
        echo.
        pause
        exit /b
    )
)

:: Kiểm tra file .env đã tồn tại chưa
if not exist .env (
    echo File .env chưa được tạo. Đang chạy script thiết lập...
    node setup.js
)

:: Khởi động ứng dụng
echo.
echo Đang khởi động ứng dụng...
npm run dev

pause