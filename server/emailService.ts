import nodemailer from 'nodemailer';

// Interface for Email Requests
interface EmailRequest {
  name?: string;
  email: string;
  subject: string;
  message: string;
}

// Create a transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER || 'hoangtucuoirong@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'rsto qnza iavp xeop' // App password
  },
  debug: true // Show debug output
});

export const sendEmail = async (request: EmailRequest): Promise<{ success: boolean; message: string }> => {
  const { name, email, subject, message } = request;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'hoangtucuoirong@gmail.com',
      to: 'hoangtucuoirong@gmail.com, asahivietlife@outlook.com',
      subject: subject,
      html: `
        <h1>New Tour Request</h1>
        <p><strong>From:</strong> ${name || 'Anonymous'} (${email})</p>
        <div style="white-space: pre-wrap; font-family: monospace; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p>This email was sent from the AsahiJapanTours calculator.</p>
      `
    };

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