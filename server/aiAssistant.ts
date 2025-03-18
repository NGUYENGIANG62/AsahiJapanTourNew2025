import axios from 'axios';
import type { CalculationResult } from '../client/src/types';

// Kiểm tra xem API key có tồn tại không
const hasValidApiKey = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 20;
};

// Các prompt mẫu
const TOUR_INTRO_PROMPT = `Bạn là trợ lý tư vấn du lịch của AsahiJapanTours. 
Hãy giới thiệu ngắn gọn về Nhật Bản như một điểm đến du lịch hấp dẫn.
Nhắc đến các điểm du lịch nổi tiếng, ẩm thực và nên đến thời điểm nào trong năm.
Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện và chuyên nghiệp.`;

const PRICE_EXPLANATION_PROMPT = (calculationData: CalculationResult) => {
  return `Dưới đây là chi tiết về báo giá tour:
  
Tour: ${calculationData.tourDetails.name}, ${calculationData.tourDetails.location}
Thời gian: ${calculationData.calculationDetails.startDate} đến ${calculationData.calculationDetails.endDate}
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
  
Hãy giải thích ngắn gọn cho khách hàng hiểu về cấu trúc giá này.
Đề xuất liệu giá này có phù hợp hay không, và tại sao.
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và chuyên nghiệp.`;
};

export type AiRequestType = 'tour_intro' | 'price_explanation' | 'custom_question';

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
      message: `Chào mừng bạn đến với AsahiJapanTours! 

Nhật Bản là một điểm đến tuyệt vời với sự kết hợp hài hòa giữa truyền thống và hiện đại. Từ những đền chùa cổ kính ở Kyoto, núi Phú Sĩ hùng vĩ, đến sự nhộn nhịp của Tokyo.

Ẩm thực Nhật đa dạng với sushi, ramen, tempura. Thời điểm lý tưởng để thăm Nhật là mùa xuân (hoa anh đào - tháng 3-4) và mùa thu (lá đỏ - tháng 10-11).

Hãy liên hệ với chúng tôi để được tư vấn chi tiết!`,
    };
  } else if (request.type === 'price_explanation' && request.calculationData) {
    return {
      success: true,
      message: `Cảm ơn bạn đã quan tâm đến báo giá tour của chúng tôi!

Giá này đã bao gồm đầy đủ các chi phí: tour cơ bản, phương tiện di chuyển, chi phí tài xế, khách sạn, ăn uống và hướng dẫn viên. Thuế và phí dịch vụ cũng đã được tính vào tổng giá.

Đây là mức giá cạnh tranh cho một trải nghiệm du lịch chất lượng tại Nhật Bản, đặc biệt với số lượng người tham gia và thời gian bạn chọn.

Vui lòng liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về chi tiết giá hoặc muốn điều chỉnh dịch vụ.`,
    };
  } else {
    return {
      success: true,
      message: `Cảm ơn bạn đã liên hệ với AsahiJapanTours! 

Để được tư vấn chi tiết và chính xác về câu hỏi của bạn, vui lòng liên hệ trực tiếp với đội ngũ tư vấn của chúng tôi qua email: asahivietlifejapantours@gmail.com hoặc asahivietlife@outlook.com.

Chúng tôi sẽ phản hồi trong thời gian sớm nhất có thể!`,
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
      prompt = `Bạn là trợ lý tư vấn du lịch của AsahiJapanTours.
      Hãy trả lời câu hỏi này của khách hàng một cách chuyên nghiệp, thân thiện:
      "${request.message}"
      
      Luôn trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp và hữu ích.
      Nếu bạn không biết hoặc không chắc chắn, hãy khuyên khách liên hệ với AsahiJapanTours qua email hoặc điện thoại.`;
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
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
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