import nodemailer from 'nodemailer';

// Interface for Email Requests
interface EmailRequest {
  name?: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

// Email config - khai báo cố định
const EMAIL_CONFIG = {
  user: 'asahivietlifejapantours@gmail.com',
  senderName: 'AsahiJapanTours',
  password: 'xdppaohryuhknygk', // App password
  host: 'smtp.gmail.com',
  port: 465,
  secure: true
};

// Create a transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: EMAIL_CONFIG.secure, // use SSL
  auth: {
    user: EMAIL_CONFIG.user,
    pass: EMAIL_CONFIG.password
  },
  debug: true // Bật debug output để xem lỗi chi tiết
});

// Log cấu hình email để kiểm tra (chỉ hiển thị email để dễ debug)
console.log("Email configuration:", { 
  user: EMAIL_CONFIG.user, 
  passLength: EMAIL_CONFIG.password.length,
  configured: true
});

export const sendEmail = async (request: EmailRequest): Promise<{ success: boolean; message: string }> => {
  const { name, email, phone, subject, message } = request;

  try {
    // Cấu hình email gửi đi với thông tin liên hệ của khách hàng
    const mailOptions = {
      from: `${EMAIL_CONFIG.senderName} <${EMAIL_CONFIG.user}>`,
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