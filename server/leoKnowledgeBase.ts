/**
 * Mô-đun này cung cấp các hàm để truy vấn cơ sở kiến thức Leo từ Google Sheets.
 * Nó sử dụng các sheet riêng biệt cho FAQ, thông tin tour, và kiến thức địa phương.
 */

import { getSheetData } from './googleSheetsService';
import { sheets_v4 } from 'googleapis';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { User } from '@shared/schema';

// Định nghĩa cấu trúc dữ liệu
interface FAQ {
  question: string;
  short_answer: string;
  detailed_answer: string;
  keywords: string;
}

interface TourInfo {
  tour_name: string;
  duration: string;
  highlights: string;
  cultural_features: string;
  best_time: string;
  local_tips: string;
  category: string;
  price_range: string;
}

interface LocalInsight {
  region: string;
  unique_experience: string;
  local_restaurant: string;
  seasonal_festival: string;
  travel_tip: string;
  best_time: string;
  target_traveler: string;
}

// Tên của các sheet trong Google Sheets
const FAQ_SHEET = 'FAQ';
const TOURS_SHEET = 'Tours';
const LOCAL_INSIGHTS_SHEET = 'LocalInsights';

// Cache để giảm số lượng yêu cầu API
let faqCache: FAQ[] | null = null;
let toursCache: TourInfo[] | null = null;
let localInsightsCache: LocalInsight[] | null = null;
let lastCacheTime: Date | null = null;

// Thời gian hết hạn cache (15 phút)
const CACHE_EXPIRATION = 15 * 60 * 1000;

/**
 * Làm mới cache nếu cần
 */
async function refreshCacheIfNeeded(user?: User | null): Promise<void> {
  const now = new Date();
  if (!lastCacheTime || now.getTime() - lastCacheTime.getTime() > CACHE_EXPIRATION) {
    try {
      // Tải dữ liệu từ các sheet
      faqCache = await getSheetData(FAQ_SHEET, user) as FAQ[];
      toursCache = await getSheetData(TOURS_SHEET, user) as TourInfo[];
      localInsightsCache = await getSheetData(LOCAL_INSIGHTS_SHEET, user) as LocalInsight[];
      lastCacheTime = now;
      console.log('Leo knowledge base cache refreshed');
    } catch (error) {
      console.error('Error refreshing Leo knowledge base cache:', error);
      // Nếu không thể cập nhật cache, vẫn giữ cache cũ (nếu có)
    }
  }
}

/**
 * Tìm kiếm FAQ dựa trên từ khóa
 */
export async function searchFAQ(query: string, user?: User | null): Promise<FAQ[]> {
  await refreshCacheIfNeeded(user);
  
  if (!faqCache || faqCache.length === 0) {
    return [];
  }
  
  // Chuyển đổi query thành lowercase để tìm kiếm không phân biệt hoa thường
  const lowerQuery = query.toLowerCase();
  
  // Tạo một bản sao của mảng FAQ để sắp xếp
  const results = [...faqCache]
    // Lọc câu hỏi liên quan đến truy vấn
    .filter(faq => {
      const question = faq.question.toLowerCase();
      const keywords = faq.keywords.toLowerCase();
      
      return question.includes(lowerQuery) || 
             keywords.split(',').some(keyword => lowerQuery.includes(keyword.trim())) ||
             lowerQuery.split(' ').some(word => keywords.includes(word));
    })
    // Sắp xếp theo độ phù hợp
    .sort((a, b) => {
      // Ưu tiên kết quả có query trong câu hỏi
      const aQuestionMatch = a.question.toLowerCase().includes(lowerQuery) ? 1 : 0;
      const bQuestionMatch = b.question.toLowerCase().includes(lowerQuery) ? 1 : 0;
      
      if (aQuestionMatch !== bQuestionMatch) {
        return bQuestionMatch - aQuestionMatch;
      }
      
      // Nếu cả hai đều có/không có query trong câu hỏi, kiểm tra từ khóa
      const aKeywords = a.keywords.toLowerCase().split(',').map(k => k.trim());
      const bKeywords = b.keywords.toLowerCase().split(',').map(k => k.trim());
      
      const aKeywordMatches = aKeywords.filter(k => lowerQuery.includes(k)).length;
      const bKeywordMatches = bKeywords.filter(k => lowerQuery.includes(k)).length;
      
      return bKeywordMatches - aKeywordMatches;
    });
  
  return results;
}

/**
 * Tìm kiếm tour theo tiêu chí
 */
export async function searchTours(criteria: string, user?: User | null): Promise<TourInfo[]> {
  await refreshCacheIfNeeded(user);
  
  if (!toursCache || toursCache.length === 0) {
    return [];
  }
  
  const lowerCriteria = criteria.toLowerCase();
  
  // Tạo một bản sao của mảng tour để sắp xếp
  const results = [...toursCache]
    // Lọc tour phù hợp với tiêu chí
    .filter(tour => {
      const tourName = tour.tour_name.toLowerCase();
      const highlights = tour.highlights.toLowerCase();
      const categories = tour.category.toLowerCase();
      
      return tourName.includes(lowerCriteria) || 
             highlights.includes(lowerCriteria) || 
             categories.split(',').some(cat => cat.trim() === lowerCriteria);
    })
    // Sắp xếp theo độ phù hợp
    .sort((a, b) => {
      // Ưu tiên kết quả có criteria trong tên tour
      const aTourMatch = a.tour_name.toLowerCase().includes(lowerCriteria) ? 2 : 0;
      const bTourMatch = b.tour_name.toLowerCase().includes(lowerCriteria) ? 2 : 0;
      
      if (aTourMatch !== bTourMatch) {
        return bTourMatch - aTourMatch;
      }
      
      // Kiểm tra trong highlights
      const aHighlightMatch = a.highlights.toLowerCase().includes(lowerCriteria) ? 1 : 0;
      const bHighlightMatch = b.highlights.toLowerCase().includes(lowerCriteria) ? 1 : 0;
      
      return bHighlightMatch - aHighlightMatch;
    });
  
  return results;
}

/**
 * Tìm kiếm thông tin địa phương
 */
export async function searchLocalInsights(region: string, user?: User | null): Promise<LocalInsight[]> {
  await refreshCacheIfNeeded(user);
  
  if (!localInsightsCache || localInsightsCache.length === 0) {
    return [];
  }
  
  const lowerRegion = region.toLowerCase();
  
  // Tạo một bản sao của mảng insights để sắp xếp
  return [...localInsightsCache]
    // Lọc insights theo vùng
    .filter(insight => {
      const insightRegion = insight.region.toLowerCase();
      return insightRegion.includes(lowerRegion);
    });
}

/**
 * Tìm kiếm tổng hợp từ tất cả các nguồn
 */
export async function comprehensiveSearch(query: string, user?: User | null): Promise<{
  faqs: FAQ[],
  tours: TourInfo[],
  localInsights: LocalInsight[]
}> {
  // Tìm kiếm song song từ tất cả các nguồn
  const [faqs, tours, localInsights] = await Promise.all([
    searchFAQ(query, user),
    searchTours(query, user),
    searchLocalInsights(query, user)
  ]);
  
  return {
    faqs: faqs.slice(0, 3), // Giới hạn 3 kết quả hàng đầu
    tours: tours.slice(0, 3),
    localInsights: localInsights.slice(0, 3)
  };
}

/**
 * Làm mới cache
 */
export async function refreshKnowledgeBase(user?: User | null): Promise<boolean> {
  try {
    faqCache = await getSheetData(FAQ_SHEET, user) as FAQ[];
    toursCache = await getSheetData(TOURS_SHEET, user) as TourInfo[];
    localInsightsCache = await getSheetData(LOCAL_INSIGHTS_SHEET, user) as LocalInsight[];
    lastCacheTime = new Date();
    console.log('Leo knowledge base refreshed manually');
    return true;
  } catch (error) {
    console.error('Error refreshing Leo knowledge base:', error);
    return false;
  }
}

/**
 * Kiểm tra xem cơ sở kiến thức có sẵn không
 */
export async function isKnowledgeBaseAvailable(user?: User | null): Promise<boolean> {
  try {
    await refreshCacheIfNeeded(user);
    return Boolean(faqCache && toursCache && localInsightsCache);
  } catch (error) {
    console.error('Error checking knowledge base availability:', error);
    return false;
  }
}

/**
 * Lấy API cho Google Sheet cơ sở kiến thức Leo
 */
export async function getLeoKnowledgeBaseApi(): Promise<{ sheetsApi: sheets_v4.Sheets, spreadsheetId: string }> {
  try {
    // Lấy URL từ biến môi trường
    const spreadsheetUrl = process.env.LEO_KNOWLEDGE_BASE_URL || process.env.GOOGLE_SPREADSHEET_URL;
    if (!spreadsheetUrl) {
      throw new Error('URL Google Sheet cho cơ sở kiến thức Leo không được định nghĩa');
    }
    
    // Lấy ID từ URL
    const spreadsheetId = getSpreadsheetIdFromUrl(spreadsheetUrl);
    if (!spreadsheetId) {
      throw new Error('Không thể trích xuất ID spreadsheet từ URL');
    }
    
    // Xác thực Google API
    const auth = await authenticateForLeoKnowledgeBase();
    
    // Tạo API
    const sheetsApi = google.sheets({ version: 'v4', auth });
    
    return { sheetsApi, spreadsheetId };
  } catch (error) {
    console.error('Error getting Leo knowledge base API:', error);
    throw error;
  }
}

/**
 * Xác thực với Google API cho cơ sở kiến thức Leo
 */
async function authenticateForLeoKnowledgeBase(): Promise<JWT> {
  // Kiểm tra các thông tin xác thực từ biến môi trường
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  
  if (!email || !key) {
    throw new Error('Thiếu thông tin xác thực Service Account');
  }
  
  // Tạo JWT client
  try {
    const client = new JWT({
      email,
      key: key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    // Xác thực
    await client.authorize();
    
    return client;
  } catch (error) {
    console.error('Error authenticating with Google API:', error);
    throw error;
  }
}

/**
 * Lấy ID spreadsheet từ URL
 */
function getSpreadsheetIdFromUrl(url: string): string | null {
  const pattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Hàm để kiểm tra xem sheet đã tồn tại trong Google Sheet chưa
 */
async function sheetExists(sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sheetName: string): Promise<boolean> {
  try {
    const response = await sheetsApi.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });
    
    const sheets = response.data.sheets || [];
    return sheets.some(sheet => sheet.properties?.title === sheetName);
  } catch (error) {
    console.error(`Error checking if sheet ${sheetName} exists:`, error);
    return false;
  }
}

/**
 * Hàm để tạo sheet mới nếu chưa tồn tại
 */
async function createSheetIfNotExists(sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sheetName: string): Promise<void> {
  const exists = await sheetExists(sheetsApi, spreadsheetId, sheetName);
  
  if (!exists) {
    try {
      await sheetsApi.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
      
      console.log(`Created new sheet: ${sheetName}`);
    } catch (error) {
      console.error(`Error creating sheet ${sheetName}:`, error);
      throw error;
    }
  }
}

/**
 * Hàm để đọc dữ liệu từ file CSV
 */
function readCsvFile(filePath: string): string[][] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Phân tích nội dung CSV
    const lines = content.split('\n');
    return lines.map(line => {
      // Xử lý trường hợp có dấu phẩy trong trường dữ liệu được bọc trong dấu nháy kép
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      // Thêm trường cuối cùng
      fields.push(currentField);
      
      return fields;
    });
  } catch (error) {
    console.error(`Error reading CSV file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Hàm để tải dữ liệu CSV lên Google Sheet
 */
async function uploadCsvToSheet(sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sheetName: string, csvData: string[][]): Promise<void> {
  try {
    // Xóa dữ liệu hiện tại (nếu có)
    await sheetsApi.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z`,
    });
    
    // Tải dữ liệu mới
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: csvData,
      },
    });
    
    console.log(`Uploaded data to ${sheetName} successfully`);
  } catch (error) {
    console.error(`Error uploading data to ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Hàm chính để tải dữ liệu mẫu lên Google Sheet cơ sở kiến thức Leo
 */
export async function uploadSampleDataToLeoKnowledgeBase(): Promise<boolean> {
  try {
    // Lấy Google Sheets API và spreadsheet ID
    const { sheetsApi, spreadsheetId } = await getLeoKnowledgeBaseApi();
    
    // Tạo các sheet nếu chưa tồn tại
    await createSheetIfNotExists(sheetsApi, spreadsheetId, FAQ_SHEET);
    await createSheetIfNotExists(sheetsApi, spreadsheetId, TOURS_SHEET);
    await createSheetIfNotExists(sheetsApi, spreadsheetId, LOCAL_INSIGHTS_SHEET);
    
    // Đường dẫn đến các file CSV mẫu
    const faqCsvPath = path.join(process.cwd(), 'tourbot_template', 'template_faq.csv');
    const toursCsvPath = path.join(process.cwd(), 'tourbot_template', 'template_tours.csv');
    const insightsCsvPath = path.join(process.cwd(), 'tourbot_template', 'template_local_insights.csv');
    
    // Đọc dữ liệu từ các file CSV
    const faqData = readCsvFile(faqCsvPath);
    const toursData = readCsvFile(toursCsvPath);
    const insightsData = readCsvFile(insightsCsvPath);
    
    // Tải dữ liệu lên Google Sheet
    await uploadCsvToSheet(sheetsApi, spreadsheetId, FAQ_SHEET, faqData);
    await uploadCsvToSheet(sheetsApi, spreadsheetId, TOURS_SHEET, toursData);
    await uploadCsvToSheet(sheetsApi, spreadsheetId, LOCAL_INSIGHTS_SHEET, insightsData);
    
    console.log('Sample data uploaded to Leo knowledge base successfully');
    return true;
  } catch (error) {
    console.error('Error uploading sample data to Leo knowledge base:', error);
    return false;
  }
}