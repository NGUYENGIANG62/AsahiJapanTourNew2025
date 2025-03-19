import { useEffect } from 'react';

declare global {
  interface Window {
    tudong_chatbox: any;
    TuDongChat: any;
  }
}

export function TuDongChatBot() {
  useEffect(() => {
    // Tạo script element để nhúng TuDongChat
    const script = document.createElement('script');
    script.src = 'https://app.tudongchat.com/js/chatbox.js';
    script.async = true;
    script.onload = () => {
      // Khởi tạo chatbot sau khi script đã tải
      if (window.TuDongChat) {
        const tudong_chatbox = new window.TuDongChat('5b-SAU2ae3LWEJCPRQ1');
        window.tudong_chatbox = tudong_chatbox;
        tudong_chatbox.initial();
      }
    };
    
    document.body.appendChild(script);
    
    // Cleanup khi component unmount
    return () => {
      document.body.removeChild(script);
      delete window.tudong_chatbox;
    };
  }, []);

  // Component này không render bất kỳ UI nào vì chatbot được nhúng trực tiếp vào body
  return null;
}