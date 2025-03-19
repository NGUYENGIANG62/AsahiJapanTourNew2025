// Script để nhúng TuDongChat chatbot
(function() {
  // Đợi cho DOM sẵn sàng
  function init() {
    try {
      // Tạo script element
      const script = document.createElement('script');
      script.src = 'https://app.tudongchat.com/js/chatbox.js';
      script.async = true;
      script.onerror = function() {
        console.error('Failed to load TuDongChat script');
      };
      
      script.onload = function() {
        console.log('TuDongChat script loaded');
        // Đợi một khoảng thời gian ngắn để đảm bảo script được xử lý
        setTimeout(function() {
          try {
            if (typeof TuDongChat !== 'undefined') {
              console.log('Initializing TuDongChat');
              // Khởi tạo chatbot với ID của bạn
              window.tudong_chatbox = new TuDongChat('5b-SAU2ae3LWEJCPRQ1');
              window.tudong_chatbox.initial();
              console.log('TuDongChat initialized successfully');
            } else {
              console.error('TuDongChat not defined after script load');
            }
          } catch (e) {
            console.error('Error initializing TuDongChat:', e);
          }
        }, 1500);
      };
      
      // Thêm script vào body
      document.body.appendChild(script);
    } catch (e) {
      console.error('Error in TuDongChat initialization:', e);
    }
  }
  
  // Kiểm tra nếu document đã sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init(); // Nếu đã sẵn sàng thì khởi tạo ngay
  }
})();