/**
 * Danh sach bai da xuat ban (public) — tai 1 lan, cache o module scope de cac trang
 * (Topics, TopicDetail, Practice random/next) dung chung, khong goi API lap lai.
 */
import { useCallback, useEffect, useState } from 'react';
import { problemsApi, toPracticeProblem } from '@/lib/problemsApi';
import type { PracticeProblem } from '@/types';

let cache: PracticeProblem[] | null = null;
let inFlight: Promise<PracticeProblem[]> | null = null;

/** Tai danh sach bai public (dung cache neu da co; force = tai lai tu backend) */
export function loadPublishedProblems(force = false): Promise<PracticeProblem[]> {
  if (cache && !force) return Promise.resolve(cache);
  if (inFlight && !force) return inFlight;
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

export function usePublishedProblems() {
  const [problems, setProblems] = useState<PracticeProblem[]>(() => cache ?? []);
  const [loading, setLoading] = useState<boolean>(() => cache === null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const force = version > 0;
    if (force || cache === null) {
      setLoading(true);
      setError(null);
    }
    loadPublishedProblems(force)
      .then((list) => {
        if (cancelled) return;
        setProblems(list);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
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
