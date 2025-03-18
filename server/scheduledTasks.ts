import { syncDataFromSheets } from './googleSheetsService';
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
    
    try {
      await syncDataFromSheets(storage);
      await storage.updateLastSyncTimestamp();
      console.log('Scheduled sync: Automatic sync completed successfully');
    } catch (syncError) {
      console.error('Scheduled sync: Error during Google Sheets sync:', syncError);
      console.log('Scheduled sync: Sẽ tiếp tục sử dụng dữ liệu cục bộ');
      
      // Vẫn cập nhật timestamp để không sync liên tục khi gặp lỗi
      await storage.updateLastSyncTimestamp();
    }
    
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