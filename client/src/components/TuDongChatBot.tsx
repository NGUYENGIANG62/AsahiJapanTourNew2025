import { useEffect } from 'react';

declare global {
  interface Window {
    tudong_chatbox: any;
    TuDongChat: any;
  }
}

export function TuDongChatBot() {
  useEffect(() => {
    // Kiểm tra script đã tồn tại chưa
    if (document.querySelector('script[src="https://app.tudongchat.com/js/chatbox.js"]')) {
      console.log('TuDongChat script already exists');
      return;
    }

    // Tạo script element để nhúng TuDongChat
    const script = document.createElement('script');
    script.src = 'https://app.tudongchat.com/js/chatbox.js';
    script.async = true;
    script.onload = () => {
      // Khởi tạo chatbot sau khi script đã tải
      console.log('TuDongChat script loaded');
      setTimeout(() => {
        if (window.TuDongChat) {
          try {
            console.log('Initializing TuDongChat');
            const tudong_chatbox = new window.TuDongChat('5b-SAU2ae3LWEJCPRQ1');
            window.tudong_chatbox = tudong_chatbox;
            tudong_chatbox.initial();
            console.log('TuDongChat initialized successfully');
          } catch (error) {
            console.error('Error initializing TuDongChat:', error);
          }
        } else {
          console.error('TuDongChat not available on window object');
        }
      }, 1000); // Đợi 1 giây để đảm bảo script đã tải xong
    };
    
    document.body.appendChild(script);
    
    // Cleanup khi component unmount
    return () => {
      const scriptElement = document.querySelector('script[src="https://app.tudongchat.com/js/chatbox.js"]');
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  // Component này không render bất kỳ UI nào vì chatbot được nhúng trực tiếp vào body
  return null;
}