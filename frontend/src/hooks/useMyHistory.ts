/**
 * Lich su nop bai cua user dang dang nhap (/api/history/me), moi nhat truoc.
 * Chua dang nhap -> danh sach rong, khong goi API.
 */
import { useCallback, useEffect, useState } from 'react';
import { BackendUnavailableError, historyApi, type BackendHistoryItem } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth.tsx';

export function useMyHistory() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [history, setHistory] = useState<BackendHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    historyApi
      .myHistory()
      .then((items) => {
        if (!cancelled) setHistory(items);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof BackendUnavailableError
            ? 'Không kết nối được máy chủ.'
            : e instanceof Error
              ? e.message
              : 'Không tải được lịch sử nộp bài.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { history, loading, error, reload };
}
