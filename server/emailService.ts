import nodemailer from 'nodemailer';

// Interface for Email Requests
interface EmailRequest {
  name?: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

// Create a transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER || 'asahivietlifejapantours@gmail.com',
    pass: process.env.EMAIL_PASSWORD // App password được tạo từ tài khoản Google
  },
  debug: true // Bật debug output để xem lỗi chi tiết
});

// Log cấu hình email để kiểm tra (chỉ hiển thị tên người dùng để bảo mật)
console.log("Email configuration:", { 
  user: process.env.EMAIL_USER || 'asahivietlifejapantours@gmail.com', 
  passLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
  configured: !!process.env.EMAIL_PASSWORD
});

export const sendEmail = async (request: EmailRequest): Promise<{ success: boolean; message: string }> => {
  const { name, email, phone, subject, message } = request;

  try {
    // Cấu hình email gửi đi với thông tin liên hệ của khách hàng
    const mailOptions = {
      from: process.env.EMAIL_USER || 'asahivietlifejapantours@gmail.com',
      to: 'asahivietlifejapantours@gmail.com, asahivietlife@outlook.com',
      subject: subject,
      html: `
        <h1>Yêu cầu tư vấn tour mới</h1>
        <p><strong>Từ:</strong> ${name || 'Khách hàng'} (${email})</p>
        <p><strong>Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
        <div style="white-space: pre-wrap; font-family: monospace; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="font-size: 0.9em; color: #666;">Email này được gửi từ ứng dụng máy tính tour AsahiJapanTours.</p>
      `
    };
    
    // Log thông tin email trước khi gửi
    console.log("Sending email with options:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      from: mailOptions.from
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};