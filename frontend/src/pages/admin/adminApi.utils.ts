import { ApiError, BackendUnavailableError } from '@/lib/api';

/** Chuyen loi goi API thanh thong bao tieng Viet hien cho giang vien / admin */
export function apiErrorMessage(err: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.'): string {
  if (err instanceof BackendUnavailableError) return 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.';
  if (err instanceof ApiError) {
    // 403 tu Spring Security thuong khong co body -> message mac dinh "Lỗi máy chủ (403)."
    if (err.status === 403 && (!err.message || err.message.startsWith('Lỗi máy chủ'))) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
