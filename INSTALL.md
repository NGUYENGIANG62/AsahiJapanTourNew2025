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

## Thiết lập Google Sheets

Ứng dụng AsahiJapanTours hỗ trợ đồng bộ dữ liệu với Google Sheets. Có hai phương pháp xác thực:

### Phương pháp 1: API Key (Chỉ đọc)

1. **Tạo API Key trong Google Cloud Console**:
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo dự án mới hoặc chọn dự án hiện có
   - Đi đến "API & Services" > "Credentials"
   - Nhấp vào "Create Credentials" > "API key"
   - Lưu API key và thêm vào file `.env` dưới dạng `GOOGLE_API_KEY`

2. **Kích hoạt Google Sheets API**:
   - Trong Google Cloud Console, đi đến "API & Services" > "Library"
   - Tìm và kích hoạt "Google Sheets API"

3. **Chia sẻ Google Sheets**:
   - Đảm bảo Google Sheets được chia sẻ với quyền "Bất kỳ ai có liên kết" có thể xem

### Phương pháp 2: Service Account (Đọc và ghi)

1. **Tạo Service Account**:
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Đi đến "IAM & Admin" > "Service accounts"
   - Nhấp vào "Create Service Account"
   - Đặt tên và mô tả (ví dụ: "AsahiJapanToursApp")
   - Nhấp "Create and Continue" và hoàn tất các bước

2. **Tạo key cho Service Account**:
   - Sau khi tạo Service Account, nhấp vào tên của nó
   - Đi đến tab "Keys"
   - Nhấp vào "Add Key" > "Create new key"
   - Chọn định dạng JSON và nhấp "Create"
   - File JSON sẽ được tải xuống, chứa thông tin Service Account

3. **Kích hoạt API cần thiết**:
   - Đi đến "API & Services" > "Library"
   - Tìm và kích hoạt "Google Sheets API"
   - Tìm và kích hoạt "Google Drive API"

4. **Chia sẻ Google Sheets với Service Account**:
   - Mở Google Sheets của bạn
   - Nhấp vào nút "Share" ở góc trên bên phải
   - Thêm địa chỉ email của Service Account (dạng: service-account-name@project-id.iam.gserviceaccount.com)
   - Cấp quyền "Editor" và nhấp "Send"

5. **Thêm thông tin Service Account vào file `.env`**:
   - Thêm `GOOGLE_SERVICE_ACCOUNT_EMAIL` với giá trị là email của Service Account
   - Thêm `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` với giá trị là private key từ file JSON
   - Đảm bảo private key được đặt trong dấu nháy kép và giữ nguyên dấu xuống dòng (\n)

## Tài khoản mặc định

- **Admin**: 
  - Username: AsahiVietLifeJapanTour
  - Password: Kiminonaha01
- **Customer**:
  - Username: customer 
  - Password: AsahiTour2024

## Triển khai độc lập lên môi trường production

### Triển khai thủ công

1. **Build ứng dụng**:
   ```bash
   npm run build
   ```

2. **Chạy ở chế độ production**:
   ```bash
   npm start
   ```

### Triển khai lên hosting/VPS

1. **Chuẩn bị môi trường Node.js trên VPS**:
   ```bash
   # Cài đặt Node.js và PM2 (process manager)
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Tải mã nguồn lên VPS**:
   ```bash
   git clone https://github.com/your-username/asahijapantours.git
   cd asahijapantours
   npm install
   ```

3. **Thiết lập biến môi trường**:
   ```bash
   cp .env.example .env
   nano .env   # Chỉnh sửa file .env với thông tin cần thiết
   ```

4. **Build và chạy ứng dụng với PM2**:
   ```bash
   npm run build
   pm2 start dist/index.js --name "asahijapantours"
   pm2 save
   pm2 startup  # Thiết lập tự động khởi động khi server khởi động lại
   ```

5. **Cấu hình Nginx (tùy chọn, nếu muốn sử dụng domain)**:
   ```bash
   sudo apt-get install -y nginx
   ```

   Tạo file cấu hình Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/asahijapantours
   ```

   Nội dung file cấu hình:
   ```
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Kích hoạt cấu hình:
   ```bash
   sudo ln -s /etc/nginx/sites-available/asahijapantours /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Cài đặt SSL với Let's Encrypt (tùy chọn)**:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Xử lý sự cố

### Không kết nối được đến server
- Đảm bảo port 5000 không bị sử dụng bởi ứng dụng khác
- Thử chạy với quyền admin (Windows) hoặc sudo (Linux/Mac)

### Lỗi gửi email
- Kiểm tra EMAIL_PASSWORD trong file .env
- Đảm bảo đã cấu hình "Less secure app access" trong tài khoản Gmail

### Không thể đồng bộ với Google Sheets
- **Nếu sử dụng API Key (chỉ đọc)**:
  - Kiểm tra GOOGLE_API_KEY trong file .env
  - Đảm bảo Google Sheets API đã được kích hoạt
  - Kiểm tra quyền truy cập Google Sheets của bạn (phải được chia sẻ công khai)

- **Nếu sử dụng Service Account (đọc và ghi)**:
  - Kiểm tra GOOGLE_SERVICE_ACCOUNT_EMAIL và GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  - Đảm bảo đã chia sẻ Google Sheets với email của Service Account
  - Kiểm tra quyền của Service Account (phải là Editor hoặc cao hơn)
  - Đảm bảo Google Sheets API và Google Drive API đã được kích hoạt

- **Nếu sử dụng OAuth2 (không khuyến nghị)**:
  - Kiểm tra các thông tin GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
  - Đảm bảo refresh token còn hiệu lực

### Lỗi không thể truy cập /admin
- Kiểm tra SESSION_SECRET trong file .env
- Đảm bảo đã đăng nhập với tài khoản admin

## Hỗ trợ
Nếu gặp vấn đề, vui lòng liên hệ:
- Email: hoangtucuoirong@gmail.com
- Facebook: https://www.facebook.com/profile.php?id=61566880418544