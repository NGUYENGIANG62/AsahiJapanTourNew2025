/**
 * Script thiết lập môi trường sau khi clone từ GitHub
 * Chạy: node setup.js
 */
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Thiết lập môi trường cho AsahiJapanTours Tour Calculator');
console.log('----------------------------------------------------');
console.log('Script này sẽ tạo file .env với các biến môi trường cần thiết');

// Tạo SESSION_SECRET ngẫu nhiên
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Hỏi thông tin
const askQuestions = async () => {
  return new Promise((resolve) => {
    const config = {
      SESSION_SECRET: sessionSecret
    };

    rl.question('\nEmail Password (dùng cho việc gửi email): ', (emailPassword) => {
      config.EMAIL_PASSWORD = emailPassword || '';
      
      console.log('\n--- Thiết lập Google Sheets ---');
      console.log('Bạn có thể chọn một trong các phương pháp xác thực sau:');
      console.log('1. API Key (chỉ đọc dữ liệu)');
      console.log('2. Service Account (đọc và ghi dữ liệu)');
      console.log('3. OAuth2 (không khuyến nghị)');
      console.log('4. Cấu hình nhanh (sử dụng Google Sheets của AsahiVietLife)');
      console.log('5. Bỏ qua thiết lập Google Sheets');
      
      rl.question('\nChọn phương pháp (1-5): ', (authMethod) => {
        const method = parseInt(authMethod, 10);
        
        if (method === 1) {
          // API Key
          rl.question('\nGoogle API Key: ', (apiKey) => {
            config.GOOGLE_API_KEY = apiKey || '';
            
            rl.question('Google Spreadsheet URL: ', (googleSpreadsheetUrl) => {
              config.GOOGLE_SPREADSHEET_URL = googleSpreadsheetUrl || '';
              rl.close();
              resolve(config);
            });
          });
        } else if (method === 2) {
          // Service Account
          rl.question('\nGoogle Service Account Email: ', (serviceAccountEmail) => {
            config.GOOGLE_SERVICE_ACCOUNT_EMAIL = serviceAccountEmail || '';
            
            console.log('\nLưu ý: Private key cần được đặt trong dấu nháy kép và giữ nguyên dấu xuống dòng.');
            console.log('Ví dụ: "-----BEGIN PRIVATE KEY-----\\nABC...XYZ\\n-----END PRIVATE KEY-----\\n"');
            
            rl.question('Google Service Account Private Key: ', (privateKey) => {
              config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = privateKey || '';
              
              rl.question('Google Spreadsheet URL: ', (googleSpreadsheetUrl) => {
                config.GOOGLE_SPREADSHEET_URL = googleSpreadsheetUrl || '';
                rl.close();
                resolve(config);
              });
            });
          });
        } else if (method === 3) {
          // OAuth2
          rl.question('\nGoogle Client ID: ', (googleClientId) => {
            config.GOOGLE_CLIENT_ID = googleClientId || '';
            
            rl.question('Google Client Secret: ', (googleClientSecret) => {
              config.GOOGLE_CLIENT_SECRET = googleClientSecret || '';
              
              rl.question('Google Refresh Token: ', (googleRefreshToken) => {
                config.GOOGLE_REFRESH_TOKEN = googleRefreshToken || '';
                
                rl.question('Google Spreadsheet URL: ', (googleSpreadsheetUrl) => {
                  config.GOOGLE_SPREADSHEET_URL = googleSpreadsheetUrl || '';
                  rl.close();
                  resolve(config);
                });
              });
            });
          });
        } else if (method === 4) {
          // Cấu hình nhanh sử dụng Google Sheets của AsahiVietLife
          console.log('\nCấu hình nhanh được chọn. Sử dụng cấu hình mặc định của AsahiVietLife.');
          config.GOOGLE_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1DQ1e6k4I65O5NxmX8loJ_SKUI7aoIj3WCu5BMLUCznw/edit?usp=sharing';
          
          rl.question('\nBạn có Service Account JSON key không? (y/n): ', (hasKey) => {
            if (hasKey.toLowerCase() === 'y') {
              rl.question('Nhập đường dẫn đến file JSON của Service Account: ', (jsonPath) => {
                try {
                  const serviceAccountJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                  config.GOOGLE_SERVICE_ACCOUNT_EMAIL = serviceAccountJson.client_email;
                  config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = serviceAccountJson.private_key;
                  console.log('\nĐã cấu hình Service Account thành công!');
                  rl.close();
                  resolve(config);
                } catch (error) {
                  console.error('Lỗi khi đọc file JSON:', error);
                  console.log('Chuyển sang sử dụng API key chỉ đọc...');
                  config.GOOGLE_API_KEY = 'AIzaSyD8-gNTMNBQBV5iqq-QTEJCGvv6w-sMpTY'; // Demo API key chỉ đọc
                  rl.close();
                  resolve(config);
                }
              });
            } else {
              console.log('Sử dụng chế độ chỉ đọc với API key mặc định.');
              config.GOOGLE_API_KEY = 'AIzaSyD8-gNTMNBQBV5iqq-QTEJCGvv6w-sMpTY'; // Demo API key chỉ đọc
              rl.close();
              resolve(config);
            }
          });
        } else {
          // Bỏ qua
          console.log('\nĐã bỏ qua thiết lập Google Sheets.');
          rl.close();
          resolve(config);
        }
      });
    });
  });
};

const createEnvFile = (config) => {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent);
  console.log('\nFile .env đã được tạo thành công!');
};

const setupProject = async () => {
  try {
    // Kiểm tra xem file .env đã tồn tại chưa
    if (fs.existsSync('.env')) {
      rl.question('\nFile .env đã tồn tại. Bạn có muốn ghi đè không? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          askQuestions().then(createEnvFile);
        } else {
          console.log('Hủy thiết lập. File .env hiện tại vẫn được giữ nguyên.');
          rl.close();
        }
      });
    } else {
      const config = await askQuestions();
      createEnvFile(config);
    }
  } catch (error) {
    console.error('Lỗi:', error);
    rl.close();
  }
};

setupProject();

// Khi đóng readline
rl.on('close', () => {
  console.log('\nMôi trường đã được thiết lập. Bạn có thể chạy ứng dụng bằng lệnh:');
  console.log('npm install  (nếu chưa cài đặt các thư viện)');
  console.log('npm run dev  (để chạy ở chế độ phát triển)');
  console.log('\nChúc bạn thành công!');
  process.exit(0);
});