/**
 * Danh sach bai da xuat ban (public) — cache o module scope de cac trang
 * (Topics, TopicDetail, Practice random/next) dung chung.
 * Kieu stale-while-revalidate: hien ngay ban cache (neu co), dong thoi tai lai tu backend moi khi
 * trang mo ra, de bai vua duoc giang vien xuat ban hien len ma khong can F5.
 */
import { useCallback, useEffect, useState } from 'react';
import { problemsApi, toPracticeProblem } from '@/lib/problemsApi';
import type { PracticeProblem } from '@/types';

let cache: PracticeProblem[] | null = null;
let inFlight: Promise<PracticeProblem[]> | null = null;

/** Tai danh sach bai public (dung cache neu da co; force = tai lai tu backend) */
export function loadPublishedProblems(force = false): Promise<PracticeProblem[]> {
  if (cache && !force) return Promise.resolve(cache);
  // Dang co request chay -> dung chung (ket qua cua no da la du lieu moi)
  if (inFlight) return inFlight;
  const request: Promise<PracticeProblem[]> = problemsApi
    .listPublished()
    .then((list) => {
      const mapped = list.map(toPracticeProblem);
      cache = mapped;
      return mapped;
    })
    .finally(() => {
      if (inFlight === request) inFlight = null;
    });
  inFlight = request;
  return request;
}

/** Doc dong bo danh sach bai backend da cache (chua tai -> []) — dung de tra chu de cua bai theo id */
export function getCachedPublishedProblems(): PracticeProblem[] {
  return cache ?? [];
}

/** Xoa cache sau khi xuat ban / an / xoa bai, lan tai sau se lay du lieu moi */
export function invalidatePublishedProblems() {
  cache = null;
}

export function usePublishedProblems() {
  const [problems, setProblems] = useState<PracticeProblem[]>(() => cache ?? []);
  const [loading, setLoading] = useState<boolean>(() => cache === null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Chi hien loading khi chua co gi de hien; co cache thi hien cache va tai lai ngam
    if (version > 0 || cache === null) {
      setLoading(true);
      setError(null);
    }
    loadPublishedProblems(true)
      .then((list) => {
        if (cancelled) return;
        setProblems(list);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Tai lai ngam that bai nhung van con cache -> giu danh sach cu, khong bao loi
        if (cache !== null && version === 0) {
          setLoading(false);
          return;
        }
        setError(e instanceof Error ? e.message : 'Không tải được danh sách bài tập.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { problems, loading, error, reload };
}
