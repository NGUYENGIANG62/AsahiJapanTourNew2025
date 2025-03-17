# Hướng dẫn đóng góp cho AsahiJapanTours

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án AsahiJapanTours Tour Calculator! Dưới đây là hướng dẫn để giúp bạn đóng góp một cách hiệu quả.

## Quy trình đóng góp

1. Fork dự án trên GitHub
2. Clone fork về máy local của bạn
3. Tạo branch mới cho tính năng hoặc sửa lỗi
4. Thực hiện các thay đổi với mã nguồn
5. Chạy kiểm tra và đảm bảo các tính năng hiện tại vẫn hoạt động
6. Commit các thay đổi của bạn
7. Push branch lên GitHub
8. Tạo Pull Request từ branch của bạn vào branch chính

## Quy tắc code

- Sử dụng TypeScript cho tất cả các file mã nguồn
- Tuân thủ chuẩn ESLint đã được cấu hình trong dự án
- Viết unit test cho các tính năng mới
- Cố gắng giữ backward compatibility
- Thêm comments cho code phức tạp
- Đặt tên biến, hàm có ý nghĩa và dễ hiểu

## Cấu trúc thư mục

```
asahijapantours/
├── client/             # Mã nguồn phía client (React + TypeScript)
│   ├── src/
│   │   ├── components/ # Các component React
│   │   ├── pages/      # Các trang của ứng dụng
│   │   ├── hooks/      # Custom React hooks
│   │   ├── context/    # React context providers
│   │   └── lib/        # Thư viện hỗ trợ
├── server/             # Mã nguồn phía server (Express)
│   ├── routes.ts       # API routes
│   ├── auth.ts         # Authentication logic
│   └── storage.ts      # Data storage interface
├── shared/             # Mã nguồn dùng chung
│   └── schema.ts       # Schemas và types
```

## Đóng góp mã nguồn

### Tính năng mới

1. Thảo luận về tính năng mới trong một issue trước khi bắt đầu
2. Khi được chấp thuận, tạo branch mới từ `main`
3. Đặt tên branch theo format: `feature/ten-tinh-nang`
4. Viết code và thêm unit test nếu cần
5. Tạo Pull Request

### Sửa lỗi

1. Kiểm tra xem lỗi đã được báo cáo trong issues chưa
2. Nếu chưa, tạo issue mới mô tả lỗi
3. Tạo branch mới từ `main`
4. Đặt tên branch theo format: `bugfix/ten-loi`
5. Sửa lỗi và tạo Pull Request

## Thêm ngôn ngữ mới

1. Thêm mã ngôn ngữ mới vào `client/src/lib/i18n.ts`
2. Tạo file dịch mới trong `client/src/locales/[language].json`
3. Cập nhật schema.ts với các trường dịch mới
4. Cập nhật các component để hỗ trợ ngôn ngữ mới

## Kiểm thử

- Đảm bảo tất cả unit tests đều pass
- Đảm bảo ứng dụng vẫn hoạt động trên các trình duyệt hiện đại
- Kiểm tra tính responsive trên các kích thước màn hình khác nhau

## Quy ước commit

- Sử dụng tiếng Anh hoặc tiếng Việt cho commit message
- Viết commit message rõ ràng, súc tích
- Bắt đầu bằng một động từ: "Add", "Fix", "Update", "Remove"...

Ví dụ:
```
Add Vietnamese language support
Fix currency conversion in the summary page
Update hotel selection UI for better mobile experience
```

## Liên hệ

Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ:
- Email: hoangtucuoirong@gmail.com