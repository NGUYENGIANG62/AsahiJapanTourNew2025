# Hướng Dẫn Cài Đặt AsahiJapanTours

Dưới đây là hướng dẫn chi tiết để cài đặt và chạy ứng dụng tính giá tour AsahiJapanTours.

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.x trở lên
- **npm**: Phiên bản 9.x trở lên (thường được cài đặt cùng Node.js)
- **Git**: Để clone repository từ GitHub

## Cài đặt

### Trên Windows

1. **Cài đặt Node.js**:
   - Tải từ [Node.js official website](https://nodejs.org/)
   - Chọn phiên bản LTS (Long Term Support)
   - Chạy file cài đặt và làm theo hướng dẫn

2. **Clone repository**:
   ```bat
   git clone https://github.com/yourusername/asahijapantours.git
   cd asahijapantours
   ```

3. **Cài đặt các thư viện phụ thuộc**:
   ```bat
   npm install
   ```

4. **Thiết lập môi trường**:
   ```bat
   node setup.js
   ```
   - Điền các thông tin được yêu cầu để tạo file `.env`

5. **Chạy ứng dụng**:
   ```bat
   npm run dev
   ```
   - Hoặc bạn có thể chạy file `start.bat`

### Trên macOS/Linux

1. **Cài đặt Node.js**:
   ```bash
   # Sử dụng nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Clone repository**:
   ```bash
   git clone https://github.com/yourusername/asahijapantours.git
   cd asahijapantours
   ```

3. **Cài đặt các thư viện phụ thuộc**:
   ```bash
   npm install
   ```

4. **Thiết lập môi trường**:
   ```bash
   node setup.js
   ```
   - Điền các thông tin được yêu cầu để tạo file `.env`

5. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```

## Cài đặt môi trường thủ công

Nếu bạn muốn thiết lập môi trường thủ công thay vì sử dụng script setup.js:

1. **Tạo file `.env`** trong thư mục gốc của dự án
2. **Thêm các biến môi trường sau**:
   ```
   SESSION_SECRET=your_random_secret_key
   EMAIL_PASSWORD=your_gmail_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token
   ```

## Tài khoản mặc định

- **Admin**: 
  - Username: AsahiVietLifeJapanTour
  - Password: Kiminonaha01
- **Customer**:
  - Username: customer 
  - Password: AsahiTour2024

## Triển khai lên môi trường production

1. **Build ứng dụng**:
   ```bash
   npm run build
   ```

2. **Chạy ở chế độ production**:
   ```bash
   npm start
   ```

## Xử lý sự cố

### Không kết nối được đến server
- Đảm bảo port 5000 không bị sử dụng bởi ứng dụng khác
- Thử chạy với quyền admin (Windows) hoặc sudo (Linux/Mac)

### Lỗi gửi email
- Kiểm tra EMAIL_PASSWORD trong file .env
- Đảm bảo đã cấu hình "Less secure app access" trong tài khoản Gmail

### Không thể đồng bộ với Google Sheets
- Kiểm tra các thông tin GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
- Đảm bảo Google Sheets API đã được kích hoạt trong Google Cloud Console

### Lỗi không thể truy cập /admin
- Kiểm tra SESSION_SECRET trong file .env
- Đảm bảo đã đăng nhập với tài khoản admin

## Hỗ trợ
Nếu gặp vấn đề, vui lòng liên hệ:
- Email: hoangtucuoirong@gmail.com
- Facebook: https://www.facebook.com/profile.php?id=61566880418544