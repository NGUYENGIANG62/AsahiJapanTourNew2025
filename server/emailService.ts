// Interface for Email Requests
interface EmailRequest {
  name?: string;
  email: string;
  subject: string;
  message: string;
}

// This will store tour inquiries when they can't be sent via email
let tourInquiries: EmailRequest[] = [];

export const sendEmail = async (request: EmailRequest): Promise<{ success: boolean; message: string }> => {
  const { name, email, subject, message } = request;

  try {
    // Log the email request
    console.log('Tour inquiry received:');
    console.log(`From: ${name || 'Anonymous'} (${email})`);
    console.log(`Subject: ${subject}`);
    console.log('Message:', message);
    
    // Store the inquiry in memory
    tourInquiries.push({
      name,
      email,
      subject,
      message
    });
    
    // For future enhancement: save to database
    
    return { 
      success: true, 
      message: 'Tour inquiry successfully recorded. Please contact AsahiVietLife directly for faster response.' 
    };
  } catch (error) {
    console.error('Error processing tour inquiry:', error);
    return { 
      success: false, 
      message: `Unable to process your request. Please contact AsahiVietLife directly at AsahiVietLife@outlook.com.`
    };
  }
};

// Get all inquiries (for admin panel)
export const getAllInquiries = (): EmailRequest[] => {
  return tourInquiries;
};

// Note for future implementation:
// To properly implement email functionality, we would need to use OAuth2 authentication with Outlook
// or switch to a different email provider that supports basic authentication
// For now, tour inquiries will be stored in memory and displayed in logs