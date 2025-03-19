# AsahiJapanTours - Ứng Dụng Tính Giá Tour Nhật Bản

<p align="center">
  <img src="./generated-icon.png" alt="AsahiJapanTours Logo" width="200"/>
</p>

Ứng dụng đa ngôn ngữ dành cho AsahiVietLife Travel & Tour, giúp tính toán giá tour du lịch Nhật Bản chính xác và chi tiết cho từng khách hàng.

## Tính năng chính

✅ **Đa ngôn ngữ**: Hỗ trợ 5 ngôn ngữ (Tiếng Anh, Nhật, Trung, Hàn, Việt)  
✅ **Tính toán giá tour chi tiết**: Tính toán dựa trên nhiều yếu tố (tour, phương tiện, số người, mùa, khách sạn, ăn uống, hướng dẫn viên)  
✅ **Chuyển đổi tiền tệ**: Hỗ trợ 3 loại tiền tệ (JPY, USD, VND) với tỷ giá cập nhật tự động  
✅ **Giao diện quản trị**: Quản lý thông tin tour, phương tiện, khách sạn, hướng dẫn viên, mùa  
✅ **Tích hợp Google Sheets**: Đồng bộ dữ liệu với Google Sheets để dễ dàng quản lý  
✅ **Gửi email tự động**: Gửi thông tin yêu cầu tư vấn qua email  
✅ **Xác thực người dùng**: Phân quyền admin và khách hàng  
✅ **Dịch vụ đặc biệt**: Tùy chọn đặt các dịch vụ đặc biệt như biểu diễn Geisha, trải nghiệm Kimono, lễ uống trà...

## Demo & Screenshots

<p align="center">
  <img src="./attached_assets/image_1742202377636.png" alt="Calculator Demo" width="80%"/>
</p>

| Giao diện tính giá tour | Trang quản trị |
|-------------------------|----------------|
| <img src="./attached_assets/image_1742201642536.png" alt="Calculator Screen" width="100%"/> | <img src="./attached_assets/image_1742206392753.png" alt="Admin Screen" width="100%"/> |

## Triển khai độc lập (không phụ thuộc Replit)

### Cài đặt từ GitHub

```bash
# 1. Clone repository từ GitHub
git clone https://github.com/your-username/asahijapantours.git
cd asahijapantours

# 2. Cài đặt các dependencies
npm install

# 3. Tạo file .env từ mẫu
cp .env.example .env
# Cấu hình các biến môi trường trong file .env theo hướng dẫn bên trong

# 4. Chạy script thiết lập
node setup.js

# 5. Khởi động ứng dụng ở chế độ development
npm run dev

# Hoặc build và chạy ở chế độ production
npm run build
npm start
```

## Cài đặt chi tiết

Xem hướng dẫn cài đặt đầy đủ trong [INSTALL.md](./INSTALL.md).

## Yêu cầu hệ thống

- **Node.js**: 18.x trở lên
- **npm**: 9.x trở lên
- **Kết nối internet**: Cho chức năng chuyển đổi tiền tệ và đồng bộ Google Sheets
- **Tài khoản Gmail**: Cho chức năng gửi email (sử dụng App Password)

## Cấu trúc dự án

```
asahijapantours/
├── client/             # Mã nguồn phía client (React + TypeScript)
├── server/             # Mã nguồn phía server (Express)
├── shared/             # Mã nguồn dùng chung giữa client và server
├── .env.example        # Mẫu cấu hình biến môi trường
├── setup.js            # Script thiết lập tự động
└── start.bat           # Script khởi động cho Windows
```

## Tài khoản mặc định

- **Admin**: 
  - Username: AsahiVietLifeJapanTour
  - Password: Kiminonaha01
- **Khách hàng**: 
  - Username: customer 
  - Password: AsahiTour2024

## Tính năng chi tiết

### Tính toán giá tour
- Chọn tour, ngày đi, ngày về
- Chọn loại phương tiện và số lượng
- Nhập số lượng khách
- Chọn khách sạn và loại phòng
- Tùy chọn ăn sáng, trưa, tối
- Tùy chọn hướng dẫn viên
- Tính toán giá theo mùa
- Hiển thị báo giá chi tiết

### Quản trị viên
- Quản lý thông tin tour, phương tiện, khách sạn, hướng dẫn viên
- Thêm, sửa, xóa thông tin
- Đồng bộ dữ liệu với Google Sheets
- Cài đặt tỷ lệ lợi nhuận và thuế

### Đa ngôn ngữ
- Chuyển đổi giao diện giữa 5 ngôn ngữ
- Hiển thị nội dung tour trong các ngôn ngữ khác nhau

## Đóng góp

Vui lòng xem [CONTRIBUTING.md](./CONTRIBUTING.md) để biết chi tiết về quy trình đóng góp cho dự án.

## Liên hệ & Hỗ trợ

- **Email**: hoangtucuoirong@gmail.com
- **Website**: [AsahiJapanTours.com](https://asahijapantours.com)
- **Facebook**: [AsahiVietLife](https://www.facebook.com/profile.php?id=61566880418544)

## Giấy phép

Dự án này được phân phối dưới [Giấy phép MIT](./LICENSE).