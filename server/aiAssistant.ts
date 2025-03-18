import axios from 'axios';
import type { CalculationResult } from '../client/src/types';

// Kiểm tra xem API key có tồn tại không
const hasValidApiKey = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20;
};

// Các prompt mẫu
const TOUR_INTRO_PROMPT = `Bạn là Leo - trợ lý ảo chuyên về du lịch của AsahiJapanTours. 
Hãy giới thiệu ngắn gọn về Nhật Bản như một điểm đến du lịch hấp dẫn.
Nhắc đến các điểm du lịch nổi tiếng, ẩm thực và nên đến thời điểm nào trong năm.
Thêm ít nhất 1 điểm đặc biệt về văn hóa Nhật Bản mà ít du khách biết đến.
Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện và chuyên nghiệp.`;

const PRICE_EXPLANATION_PROMPT = (calculationData: CalculationResult) => {
  return `Bạn là Leo - trợ lý ảo chuyên về du lịch của AsahiJapanTours.
  
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
  
Giải thích ngắn gọn cho khách hàng hiểu về cấu trúc giá này một cách dễ hiểu.
Phân tích chi tiết từng khoản chi phí và tại sao chúng quan trọng trong việc đảm bảo chất lượng tour.
Đề xuất liệu giá này có phù hợp hay không so với thị trường, và tại sao.
Đưa ra 1-2 gợi ý để tối ưu chi phí nếu khách có ngân sách hạn chế.
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và chuyên nghiệp, đặt mình vào vị trí tư vấn viên đáng tin cậy.`;
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
    } else if (request.type === 'custom_question' && request.message) {
      prompt = `Bạn là Leo - trợ lý ảo chuyên về du lịch của AsahiJapanTours.
      Hãy trả lời câu hỏi này của khách hàng một cách chuyên nghiệp, thân thiện:
      "${request.message}"
      
      Luôn làm theo các nguyên tắc sau:
      1. Trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp và hữu ích
      2. Đưa ra các thông tin chính xác về du lịch Nhật Bản nếu biết
      3. Giới thiệu 1-2 điểm tham quan cụ thể liên quan đến chủ đề
      4. Nếu phù hợp, đề xuất thời điểm tốt nhất trong năm cho hoạt động đó
      5. Nếu không biết hoặc không chắc chắn, đề nghị khách liên hệ với AsahiJapanTours qua email: asahivietlifejapantours@gmail.com hoặc điện thoại/Zalo: +84 916 253 628
      
      Luôn ký tên ở cuối phản hồi: "Leo - Trợ lý ảo AsahiJapanTours"`;
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