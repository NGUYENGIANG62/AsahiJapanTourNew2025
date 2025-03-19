document.addEventListener("DOMContentLoaded", function() {
  // Tạo script element để nhúng TuDongChat
  const script = document.createElement('script');
  script.src = 'https://app.tudongchat.com/js/chatbox.js';
  script.async = true;
  script.onload = function() {
    // Khởi tạo chatbot sau khi script đã tải
    console.log('TuDongChat script loaded');
    setTimeout(function() {
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
});