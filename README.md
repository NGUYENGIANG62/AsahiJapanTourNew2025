# AsahiJapanTours Tour Price Calculator

Ứng dụng tính giá tour du lịch Nhật Bản đa ngôn ngữ cho AsahiVietLife.

## Tính năng

- Hỗ trợ đa ngôn ngữ (Tiếng Anh, Nhật, Trung, Hàn, Việt)
- Tính toán giá tour chính xác dựa trên nhiều yếu tố
- Chọn tour, phương tiện, lịch trình
- Tùy chọn khách sạn, hướng dẫn viên
- Quản lý thông tin tour từ giao diện admin
- Chuyển đổi tiền tệ tự động
- Gửi yêu cầu tư vấn qua email

## Cài đặt

### Yêu cầu tiên quyết

- Node.js 18.x trở lên
- npm hoặc yarn
- Tài khoản Gmail (cho chức năng gửi email)

### Cài đặt và khởi chạy

1. Clone repo từ GitHub:
```bash
git clone https://github.com/yourusername/asahijapantours.git
cd asahijapantours
```

2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

3. Cài đặt biến môi trường:
Tạo file `.env` trong thư mục gốc và thêm các biến sau:
```
SESSION_SECRET=your_session_secret
EMAIL_PASSWORD=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

4. Khởi chạy ứng dụng:
```bash
npm run dev
```

5. Truy cập ứng dụng tại: http://localhost:5000

## Tài khoản mặc định

- Admin: ID: AsahiVietLifeJapanTour, Password: Kiminonaha01
- Khách hàng: ID: customer, Password: AsahiTour2024

## Triển khai

Để triển khai lên môi trường production:

1. Build ứng dụng:
```bash
npm run build
```

2. Khởi chạy ứng dụng trong môi trường production:
```bash
npm start
```

## Người đóng góp

- AsahiVietLife Japan Tour Team

## Giấy phép

Dự án này được phân phối dưới Giấy phép MIT.