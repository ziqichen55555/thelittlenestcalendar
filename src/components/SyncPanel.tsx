import { useRef } from 'react';
import { Booking } from '../types';
import { exportBookings, downloadBookings, readBookingsFromFile } from '../utils/cloudSync';

interface SyncPanelProps {
  bookings: Booking[];
  onImport: (bookings: Booking[]) => void;
}

const SyncPanel = ({ bookings, onImport }: SyncPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadBookings(bookings);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const importedBookings = await readBookingsFromFile(file);
      if (importedBookings) {
        if (confirm(`確定要導入 ${importedBookings.length} 個預訂嗎？這將替換現有數據。`)) {
          onImport(importedBookings);
        }
      } else {
        alert('導入失敗，請檢查文件格式');
      }
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyLink = () => {
    try {
      const json = exportBookings(bookings);
      // 检查数据大小，如果太大则提示使用导出文件
      if (json.length > 50000) {
        alert('數據太大，無法使用鏈接同步。請使用「導出數據」功能，然後在另一設備上「導入數據」。');
        return;
      }
      
      const base64 = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}?data=${base64}`;
      
      navigator.clipboard.writeText(url).then(() => {
        alert('鏈接已複製到剪貼板！\n\n在其他設備上打開這個鏈接即可同步數據。');
      }).catch(() => {
        // 备用方案
        try {
          const textarea = document.createElement('textarea');
          textarea.value = url;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('鏈接已複製到剪貼板！\n\n在其他設備上打開這個鏈接即可同步數據。');
        } catch (err) {
          alert('複製失敗，請手動複製以下鏈接：\n\n' + url);
        }
      });
    } catch (error) {
      console.error('生成同步鏈接失敗:', error);
      alert('生成同步鏈接失敗，請使用「導出數據」功能。');
    }
  };

  return (
    <div className="sync-panel">
      <h3>數據同步</h3>
      <div className="sync-actions">
        <button onClick={handleExport} className="btn btn-small">
          📥 導出數據
        </button>
        <button onClick={handleImportClick} className="btn btn-small">
          📤 導入數據
        </button>
        <button onClick={handleCopyLink} className="btn btn-small">
          🔗 複製同步鏈接
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <p className="sync-hint">
        在其他設備上：<br />
        1. 點擊「複製同步鏈接」<br />
        2. 在手機上打開該鏈接即可自動同步
      </p>
    </div>
  );
};

export default SyncPanel;

