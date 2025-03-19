import React from 'react';
import { Helmet } from 'react-helmet';

export function TuDongChatScript() {
  return (
    <Helmet>
      <script src="https://app.tudongchat.com/js/chatbox.js"></script>
      <script>
        {`
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              if (typeof TuDongChat !== 'undefined') {
                const tudong_chatbox = new TuDongChat('5b-SAU2ae3LWEJCPRQ1');
                tudong_chatbox.initial();
              } else {
                console.error('TuDongChat not loaded');
              }
            }, 1000);
          });
        `}
      </script>
    </Helmet>
  );
}