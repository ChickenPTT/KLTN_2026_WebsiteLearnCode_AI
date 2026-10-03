/**
 * Trang thai lam bai cua sinh vien theo problemId (tu lich su nop bai /api/history/me).
 * - 'passed': co it nhat 1 lan nop dat; 'failed': da nop nhung chua lan nao dat.
 * Chua dang nhap hoac goi API loi -> map rong (coi nhu chua lam).
 */
import { useEffect, useState } from 'react';
import { historyApi } from '@/lib/problemsApi';
import { useAuth } from '@/hooks/useAuth.tsx';

export type SubmissionStatus = 'passed' | 'failed';

const EMPTY: ReadonlyMap<string, SubmissionStatus> = new Map();

export function useSubmissionStatus(): ReadonlyMap<string, SubmissionStatus> {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [statusMap, setStatusMap] = useState<ReadonlyMap<string, SubmissionStatus>>(EMPTY);

  useEffect(() => {
    if (!userId) {
      setStatusMap(EMPTY);
      return;
    }
    let cancelled = false;
    historyApi
      .mine()
      .then((items) => {
        if (cancelled) return;
        const map = new Map<string, SubmissionStatus>();
        items.forEach((h) => {
          const key = String(h.problemId);
          if (h.passed) map.set(key, 'passed');
          else if (!map.has(key)) map.set(key, 'failed');
        });
        setStatusMap(map);
      })
      .catch(() => {
        if (!cancelled) setStatusMap(EMPTY);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return statusMap;
}
