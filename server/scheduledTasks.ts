import { syncDataFromSheets } from './googleSheetsServiceFixed';
import { storage } from './storage';

// Interval in milliseconds: 12 hours = 12 * 60 * 60 * 1000
const SYNC_INTERVAL = 12 * 60 * 60 * 1000;

let syncIntervalId: NodeJS.Timeout | null = null;

/**
 * Start scheduled tasks
 */
export function startScheduledTasks() {
  // Initial sync when server starts
  syncFromSheets();
  
  // Set up regular sync every 12 hours
  syncIntervalId = setInterval(syncFromSheets, SYNC_INTERVAL);
  console.log(`Scheduled sync: Automatic Google Sheets sync scheduled every ${SYNC_INTERVAL / (60 * 60 * 1000)} hours`);
}

/**
 * Stop scheduled tasks
 */
export function stopScheduledTasks() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('Scheduled sync: Automatic Google Sheets sync stopped');
  }
}

/**
 * Perform synchronization from Google Sheets
 */
async function syncFromSheets() {
  try {
    console.log('Scheduled sync: Starting automatic sync from Google Sheets...');
    
    // 1. ĐẦU TIÊN, đồng bộ từ sheet đại lý (agency sheet)
    try {
      console.log('Scheduled sync: Đồng bộ từ sheet đại lý (Agency - AsahiLKNamA)...');
      // Sử dụng URL của đại lý NAMN (AsahiLKNamA)
      const agencySource = process.env.AGENCY_NAMN_SPREADSHEET_URL;
      if (agencySource) {
        // Giả lập người dùng đại lý để lấy dữ liệu từ sheet của họ
        const agencyUser = { 
          id: 9999, 
          username: 'AsahiLKNamA', 
          role: 'agent',
          dataSource: agencySource,
          dataSourceName: 'AsahiLKNamA Agency'
        } as any;
        
        await syncDataFromSheets(storage, agencyUser, agencySource);
        console.log('Scheduled sync: Đồng bộ từ sheet đại lý thành công');
      } else {
        console.log('Scheduled sync: Không tìm thấy URL sheet đại lý, bỏ qua đồng bộ');
      }
    } catch (agencySyncError) {
      console.error('Scheduled sync: Lỗi khi đồng bộ từ sheet đại lý:', agencySyncError);
    }
    
    // 2. SAU ĐÓ, đồng bộ từ sheet chính (main/admin sheet) để nó ghi đè lên dữ liệu từ sheet đại lý
    try {
      console.log('Scheduled sync: Đồng bộ từ sheet chính (Main/Admin)...');
      // Đảm bảo sử dụng URL sheet chính để ghi đè dữ liệu từ sheet đại lý
      const mainSheetUrl = process.env.GOOGLE_SPREADSHEET_URL;
      const adminUser = { 
        id: 1, 
        username: 'AsahiVietLifeJapanTour', 
        role: 'admin'
      } as any;
      
      // Truyền URL sheet chính trực tiếp để đảm bảo dùng đúng nguồn
      await syncDataFromSheets(storage, adminUser, mainSheetUrl);
      console.log('Scheduled sync: Đồng bộ từ sheet chính thành công');
    } catch (mainSyncError) {
      console.error('Scheduled sync: Lỗi khi đồng bộ từ sheet chính:', mainSyncError);
    }
    
    // Cập nhật thời gian đồng bộ gần nhất
    await storage.updateLastSyncTimestamp();
    
    // Cập nhật nguồn dữ liệu hiện tại là sheet chính sau khi hoàn tất
    await storage.updateSetting('current_data_source', process.env.GOOGLE_SPREADSHEET_URL || '');
    await storage.updateSetting('current_data_source_name', 'AsahiVietLifeJapanTour-Admin');
    
    console.log('Scheduled sync: Automatic sync completed successfully');
    
    // Tạo mã AVF cho tour nếu chưa có
    try {
      const toursWithUpdatedCodes = await storage.updateAllTourAVFCodes();
      console.log(`Scheduled sync: Đã cập nhật mã AVF cho ${toursWithUpdatedCodes.length} tours`);
    } catch (avfError) {
      console.error('Scheduled sync: Error updating tour AVF codes:', avfError);
    }
  } catch (error) {
    console.error('Scheduled sync: Error during automatic sync process:', error);
  }
}