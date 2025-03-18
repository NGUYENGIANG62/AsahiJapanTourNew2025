# Mẫu Cơ sở Kiến thức cho Trợ lý AI Leo - AsahiJapanTours

Tài liệu này hướng dẫn cách sử dụng các tệp mẫu CSV để tạo cơ sở kiến thức cho Leo, trợ lý ảo của AsahiJapanTours.

## Cấu trúc tệp

### 1. `template_faq.csv` - Câu hỏi thường gặp
- **question**: Câu hỏi từ khách hàng
- **short_answer**: Câu trả lời ngắn gọn (khoảng 2-3 câu)
- **detailed_answer**: Câu trả lời chi tiết
- **keywords**: Từ khóa liên quan, phân tách bằng dấu phẩy

### 2. `template_tours.csv` - Thông tin tour
- **tour_name**: Tên tour
- **duration**: Thời gian (số ngày)
- **highlights**: Điểm nổi bật, phân tách bằng dấu phẩy
- **cultural_features**: Đặc điểm văn hóa
- **best_time**: Thời điểm tốt nhất để tham gia
- **local_tips**: Lời khuyên từ người địa phương
- **category**: Danh mục tour, phân tách bằng dấu phẩy
- **price_range**: Phạm vi giá ($ đến $$$$$)

### 3. `template_local_insights.csv` - Kiến thức địa phương
- **region**: Tên vùng/thành phố
- **unique_experience**: Trải nghiệm độc đáo
- **local_restaurant**: Nhà hàng địa phương
- **seasonal_festival**: Lễ hội theo mùa
- **travel_tip**: Mẹo du lịch
- **best_time**: Thời gian tốt nhất để thăm
- **target_traveler**: Loại khách du lịch phù hợp

## Hướng dẫn sử dụng

1. Sao chép các tệp mẫu này vào Google Sheets, tạo 3 sheet riêng biệt
2. Thêm thông tin thực tế vào các sheet (bạn có thể sửa/xóa dữ liệu mẫu)
3. Liên kết Leo với Google Sheets này để truy vấn thông tin
4. Khi có thắc mắc từ khách hàng, Leo sẽ tìm kiếm thông tin phù hợp từ cơ sở kiến thức

## Ưu điểm của hệ thống

- **Dễ cập nhật**: Thêm thông tin mới bất kỳ lúc nào
- **Thông tin chính xác**: Dữ liệu cụ thể về du lịch Nhật Bản
- **Tùy chỉnh**: Điều chỉnh theo nhu cầu kinh doanh của AsahiJapanTours
- **Đa ngôn ngữ**: Có thể thêm cột ngôn ngữ khác (tiếng Anh, tiếng Nhật)

## Gợi ý thêm

- Thêm cột "rating" (1-5) để ưu tiên một số câu trả lời
- Thêm thông tin về tin tức mới nhất về du lịch Nhật Bản
- Bổ sung hình ảnh URL cho mô tả trực quan
- Tạo sheet mới cho thông tin về vào cửa, giá vé, giờ mở cửa

## Liên hệ hỗ trợ

Nếu cần giúp đỡ về cách thiết lập hoặc tùy chỉnh các tệp này, vui lòng liên hệ:
- Email: asahivietlifejapantours@gmail.com