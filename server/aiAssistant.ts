import axios from 'axios';
import type { CalculationResult } from '../client/src/types';

// Kiểm tra xem API key có tồn tại không
const hasValidApiKey = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20;
};

// Các prompt mẫu
const TOUR_INTRO_PROMPT = `Bạn là Leo - trợ lý ảo chuyên về du lịch Nhật Bản của AsahiJapanTours.

Hãy giới thiệu SIÊU NGẮN GỌN về Nhật Bản như một điểm đến du lịch, tuân thủ các nguyên tắc:

1. Tối đa 150 từ cho toàn bộ câu trả lời
2. Đề cập 3 điểm du lịch nổi tiếng nhất, mỗi điểm chỉ 1 dòng
3. Nhắc 2 đặc trưng ẩm thực không thể bỏ qua
4. Xác định 2 thời điểm lý tưởng trong năm để du lịch
5. Chia sẻ 1 bí mật về văn hóa Nhật Bản mà ít du khách biết, ưu tiên trải nghiệm địa phương

Trả lời bằng tiếng Việt, giọng điệu tự nhiên và chuyên nghiệp như HDV thực thụ.
Kết thúc với: "Leo - Trợ lý AsahiJapanTours"`;

const TOUR_SUGGESTION_PROMPT = (userMessage: string) => {
  return `Bạn là Leo - trợ lý ảo chuyên về du lịch Nhật Bản của AsahiJapanTours.

Dựa trên mô tả du lịch này của khách hàng:
"${userMessage}"

Tuân thủ các nguyên tắc sau:
1. Đề xuất 2 tour du lịch cụ thể NGẮN GỌN, mỗi tour chỉ 2-3 dòng với tên tour, độ dài và điểm nổi bật
2. Không dài dòng, không giải thích kỹ, chỉ cung cấp thông tin thiết yếu
3. Tổng độ dài phản hồi không quá 200 từ
4. Phải dựa trên kiến thức thực tế về du lịch Nhật Bản, không sử dụng thông tin chung chung
5. Đưa ra 2-3 lưu ý quan trọng nhất cho khách du lịch
6. Ưu tiên trải nghiệm địa phương thay vì các điểm du lịch quá nổi tiếng đông đúc

Luôn sử dụng:
- Ngôn ngữ tự nhiên như hướng dẫn viên thực tế
- Giọng điệu thân thiện nhưng chuyên nghiệp
- Thông tin chính xác với chi tiết cụ thể về địa điểm

Kết thúc với: "Leo - Trợ lý AsahiJapanTours"`;
};

const PRICE_EXPLANATION_PROMPT = (calculationData: CalculationResult) => {
  return `Bạn là Leo - trợ lý ảo chuyên về du lịch Nhật Bản của AsahiJapanTours.
  
Dưới đây là chi tiết về báo giá tour:
  
Tour: ${calculationData.tourDetails.name}, ${calculationData.tourDetails.location}
Thời gian: ${calculationData.calculationDetails.startDate} đến ${calculationData.calculationDetails.endDate} (${calculationData.tourDetails.durationDays} ngày)
Số người: ${calculationData.calculationDetails.participants}
Mùa: ${calculationData.calculationDetails.season?.name || 'Không xác định'} (hệ số: ${calculationData.calculationDetails.season?.multiplier || 1.0})

Chi phí cơ bản: ${calculationData.costs.baseCost} JPY
Chi phí xe: ${calculationData.costs.vehicleCost} JPY
Chi phí tài xế: ${calculationData.costs.driverCost} JPY
Chi phí khách sạn: ${calculationData.costs.hotelCost} JPY
Chi phí ăn uống: ${calculationData.costs.mealsCost} JPY
Chi phí hướng dẫn viên: ${calculationData.costs.guideCost} JPY
Tổng chi phí trước thuế và lợi nhuận: ${calculationData.costs.subtotal} JPY
Thuế: ${calculationData.costs.taxAmount} JPY
Lợi nhuận: ${calculationData.costs.profitAmount} JPY
Tổng cộng: ${calculationData.costs.totalAmount} ${calculationData.currency}

Tuân thủ các nguyên tắc sau:
1. Giải thích NGẮN GỌN cấu trúc giá, không quá 150 từ
2. Không giải thích từng khoản chi phí riêng lẻ, chỉ tập trung vào các chi phí chính
3. Đưa ra tối đa 2 gợi ý tiết kiệm chi phí, mỗi gợi ý tối đa 1 dòng
4. Dùng ngôn ngữ đơn giản, rõ ràng và thân thiện
5. Kết thúc với dòng "Leo - Trợ lý AsahiJapanTours"

Tổng độ dài phản hồi không quá 10 dòng.`;
};

export type AiRequestType = 'tour_intro' | 'price_explanation' | 'custom_question' | 'tour_suggestion';

export interface AiAssistantRequest {
  type: AiRequestType;
  message?: string;
  calculationData?: CalculationResult;
}

// Hàm trả về phản hồi dự phòng khi không có API key hoặc gặp lỗi
const getFallbackResponse = (request: AiAssistantRequest): { success: boolean; message: string } => {
  if (request.type === 'tour_intro') {
    return {
      success: true,
      message: `Xin chào! Tôi là Leo - trợ lý ảo của AsahiJapanTours.

Nhật Bản là một điểm đến tuyệt vời với sự kết hợp hài hòa giữa truyền thống và hiện đại. Từ những đền chùa cổ kính ở Kyoto, núi Phú Sĩ hùng vĩ, đến sự nhộn nhịp của Tokyo.

Ẩm thực Nhật đa dạng với sushi, ramen, tempura, kaiseki. Thời điểm lý tưởng để thăm Nhật là mùa xuân (hoa anh đào - tháng 3-4) và mùa thu (lá đỏ - tháng 10-11).

Điều đặc biệt ít du khách biết: Nhật Bản có văn hóa "Izakaya" - quán nhậu phong cách Nhật, nơi người dân địa phương thường gặp gỡ sau giờ làm. Đây là nơi tuyệt vời để trải nghiệm văn hóa đời thường và ẩm thực đích thực của người Nhật.

Hãy liên hệ với chúng tôi để được tư vấn chi tiết!`,
    };
  } else if (request.type === 'price_explanation' && request.calculationData) {
    return {
      success: true,
      message: `Xin chào! Tôi là Leo - trợ lý ảo của AsahiJapanTours.

Cảm ơn bạn đã quan tâm đến báo giá tour của chúng tôi!

Giá này đã bao gồm đầy đủ các chi phí:
- Tour cơ bản: bao gồm các điểm tham quan chính 
- Phương tiện di chuyển: xe riêng với tài xế chuyên nghiệp
- Khách sạn: lựa chọn phù hợp với yêu cầu của bạn
- Ăn uống: các bữa ăn theo lịch trình
- Hướng dẫn viên: người am hiểu văn hóa và ngôn ngữ địa phương

Đây là mức giá cạnh tranh cho một trải nghiệm du lịch chất lượng tại Nhật Bản, đặc biệt trong mùa du lịch cao điểm.

Gợi ý tiết kiệm chi phí:
1. Có thể điều chỉnh hạng khách sạn hoặc lựa chọn phòng tiết kiệm hơn
2. Tối ưu lịch trình để giảm số ngày thuê xe và hướng dẫn viên

Vui lòng liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về chi tiết giá hoặc muốn điều chỉnh dịch vụ.`,
    };
  } else if (request.type === 'tour_suggestion' && request.message) {
    return {
      success: true,
      message: `Xin chào! Tôi là Leo - trợ lý ảo của AsahiJapanTours.

Dựa trên mô tả của bạn, tôi xin giới thiệu một số tour du lịch phù hợp:

1. Tour Khám Phá Tokyo & Vùng Phụ Cận (5 ngày)
   - Điểm nổi bật: Tham quan Tokyo, Núi Phú Sĩ, Hakone
   - Thời điểm lý tưởng: Mùa xuân (tháng 3-4) hoặc mùa thu (tháng 10-11)
   - Lý do phù hợp: Kết hợp được cả trải nghiệm đô thị hiện đại và thiên nhiên tươi đẹp

2. Tour Di Sản Văn Hóa Kyoto & Osaka (6 ngày)
   - Điểm nổi bật: Tham quan các đền chùa cổ ở Kyoto, khu phố mua sắm Osaka
   - Thời điểm lý tưởng: Quanh năm, đặc biệt là mùa thu khi lá đỏ
   - Lý do phù hợp: Trải nghiệm văn hóa Nhật Bản truyền thống sâu sắc

Lưu ý:
- Nên đặt vé trước 2-3 tháng, đặc biệt trong mùa cao điểm
- Thời tiết thay đổi theo mùa, nên chuẩn bị trang phục phù hợp
- Có thể bổ sung thêm các trải nghiệm như: học làm sushi, mặc kimono, tham quan làng cổ

Đừng ngần ngại liên hệ với chúng tôi để được tư vấn chi tiết và tạo lịch trình phù hợp nhất với nhu cầu của bạn!

Leo - Trợ lý ảo AsahiJapanTours`,
    };
  } else {
    return {
      success: true,
      message: `Xin chào! Tôi là Leo - trợ lý ảo của AsahiJapanTours.

Cảm ơn bạn đã liên hệ với AsahiJapanTours! 

Để được tư vấn chi tiết và chính xác về câu hỏi của bạn, vui lòng liên hệ trực tiếp với đội ngũ tư vấn của chúng tôi qua:
- Email: asahivietlifejapantours@gmail.com 
- Email phụ: asahivietlife@outlook.com
- Điện thoại/Zalo: +84 916 253 628

Chúng tôi sẽ phản hồi trong thời gian sớm nhất có thể, thường trong vòng 24 giờ làm việc.`,
    };
  }
};

// Hàm xử lý yêu cầu AI Assistant
export async function getAiResponse(request: AiAssistantRequest): Promise<{
  success: boolean;
  message: string;
}> {
  // Nếu không có API key, trả về thông báo dự phòng
  if (!hasValidApiKey()) {
    // Chú ý: Chúng ta cần có trả lời dự phòng tuyệt đối không dùng OpenAI
    return getFallbackResponse(request);
  }

  try {
    // Chuẩn bị prompt dựa trên loại yêu cầu
    let prompt = '';
    if (request.type === 'tour_intro') {
      prompt = TOUR_INTRO_PROMPT;
    } else if (request.type === 'price_explanation' && request.calculationData) {
      prompt = PRICE_EXPLANATION_PROMPT(request.calculationData);
    } else if (request.type === 'tour_suggestion' && request.message) {
      prompt = TOUR_SUGGESTION_PROMPT(request.message);
    } else if (request.type === 'custom_question' && request.message) {
      prompt = `Bạn là Leo - trợ lý ảo chuyên về du lịch Nhật Bản của AsahiJapanTours.
      Dưới đây là câu hỏi của khách hàng:
      "${request.message}"
      
      Tuân thủ các nguyên tắc sau:
      1. Đưa ra câu trả lời SIÊU NGẮN GỌN, tối đa 150 từ
      2. Tập trung vào thông tin CHÍNH XÁC, dựa trên kiến thức chuyên sâu về du lịch Nhật Bản
      3. Ưu tiên đề cập đến các địa điểm, phong tục hoặc trải nghiệm cụ thể KHÔNG PHỔ BIẾN
      4. Cung cấp ít nhất 1 thông tin độc đáo mà khách hàng khó tìm thấy ở nơi khác
      5. Nếu không biết chắc chắn, đề nghị liên hệ: asahivietlifejapantours@gmail.com
      
      Luôn kết thúc ngắn gọn với: "Leo - Trợ lý AsahiJapanTours"`;
    } else {
      return {
        success: false,
        message: 'Loại yêu cầu không hợp lệ hoặc thiếu thông tin',
      };
    }

    // Gọi API OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // Sử dụng model mới nhất GPT-4o để có chất lượng tốt nhất
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800, // Tăng số lượng token để có câu trả lời đầy đủ hơn
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Trả về kết quả
    return {
      success: true,
      message: response.data.choices[0].message.content.trim(),
    };
  } catch (error) {
    console.error('Lỗi AI Assistant:', error);
    return getFallbackResponse(request);
  }
}