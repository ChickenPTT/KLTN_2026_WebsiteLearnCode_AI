import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Clock,
  Play,
  Send,
  SkipForward,
  Flag,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  Lock,
  MinusCircle,
} from 'lucide-react';
import {
  contestApi,
  formatClock,
  serverOffsetMs,
  type AttemptView,
  type SlotStatus,
} from '@/lib/contestApi';
import { STARTER_CODE, type CodeLanguage, type TestCaseResult } from '@/lib/problemsApi';
import { Card } from './components/Primitives';

interface ContestPageProps {
  attemptId: number;
  onBack: () => void;
}

const SLOT_STYLE: Record<SlotStatus, { label: string; className: string }> = {
  LOCKED: { label: 'Chưa mở', className: 'bg-slate-100 text-slate-400 ring-slate-200' },
  OPEN: { label: 'Đang làm', className: 'bg-violet-600 text-white ring-violet-600' },
  SOLVED: { label: 'Đúng', className: 'bg-emerald-500 text-white ring-emerald-500' },
  SKIPPED: { label: 'Bỏ qua', className: 'bg-amber-100 text-amber-700 ring-amber-300' },
  UNSOLVED: { label: 'Chưa xong', className: 'bg-red-100 text-red-600 ring-red-200' },
};

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function codeKey(attemptId: number, problemId: number, lang: CodeLanguage) {
  return `contest_code_${attemptId}_${problemId}_${lang}`;
}

function loadCode(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveCode(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function ContestPage({ attemptId, onBack }: ContestPageProps) {
  const [attempt, setAttempt] = useState<AttemptView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const [remaining, setRemaining] = useState(0);

  const [language, setLanguage] = useState<CodeLanguage>('java');
  const [code, setCode] = useState<string>(STARTER_CODE.java);
  const [busy, setBusy] = useState<'run' | 'submit' | 'skip' | 'finish' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);

  const [editorTheme] = useState<'vs' | 'vs-dark'>(() =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'vs' : 'vs-dark',
  );

  const applyAttempt = useCallback((a: AttemptView) => {
    offsetRef.current = serverOffsetMs(a.serverNow);
    setAttempt(a);
  }, []);

  const reload = useCallback(async () => {
    try {
      applyAttempt(await contestApi.attempt(attemptId));
      setLoadError(null);
    } catch (e) {
      setLoadError(errorText(e, 'Không tải được lượt thi.'));
    }
  }, [attemptId, applyAttempt]);

  useEffect(() => {
    reload();
  }, [reload]);

  const current = attempt?.current ?? null;
  const inProgress = attempt?.status === 'IN_PROGRESS';

  // Đổi bài -> nạp code đã lưu tạm (nếu có) hoặc code mẫu
  useEffect(() => {
    if (!current) return;
    setResults(null);
    setActionError(null);
    setCode(loadCode(codeKey(attemptId, current.problemId, language)) ?? STARTER_CODE[language]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.problemId]);

  // Đếm ngược theo giờ server; hết giờ -> tải lại để backend chốt lượt
  useEffect(() => {
    if (!attempt || !inProgress) return;
    const deadline = new Date(attempt.deadlineAt).getTime();
    const tick = () => {
      const left = Math.max(0, Math.floor((deadline - (Date.now() + offsetRef.current)) / 1000));
      setRemaining(left);
      if (left === 0) reload();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [attempt, inProgress, reload]);

  const handleCodeChange = (val: string | undefined) => {
    const v = val ?? '';
    setCode(v);
    if (current) saveCode(codeKey(attemptId, current.problemId, language), v);
  };

  const handleLanguageChange = (lang: CodeLanguage) => {
    if (lang === language) return;
    setLanguage(lang);
    if (current) setCode(loadCode(codeKey(attemptId, current.problemId, lang)) ?? STARTER_CODE[lang]);
  };

  const doRun = async () => {
    if (!attempt) return;
    setBusy('run');
    setActionError(null);
    setVerdict(null);
    try {
      const res = await contestApi.run(attempt.id, code, language);
      setResults(res.testResults);
      setVerdict({ ok: res.passed, text: res.passed ? 'Đúng với test mẫu.' : 'Chưa đúng với test mẫu.' });
    } catch (e) {
      setActionError(errorText(e, 'Không chạy thử được.'));
    } finally {
      setBusy(null);
    }
  };

  const doSubmit = async () => {
    if (!attempt) return;
    setBusy('submit');
    setActionError(null);
    try {
      const res = await contestApi.submit(attempt.id, code, language);
      setVerdict({
        ok: res.passed,
        text: res.passed
          ? 'Chính xác! Chuyển sang bài tiếp theo.'
          : `Chưa đúng: qua ${res.passedCount}/${res.totalCount} test. Bạn có thể sửa và nộp lại.`,
      });
      setResults(res.passed ? null : res.testResults);
      applyAttempt(res.attempt);
    } catch (e) {
      setActionError(errorText(e, 'Không nộp được bài.'));
      reload();
    } finally {
      setBusy(null);
    }
  };

  const doSkip = async () => {
    if (!attempt) return;
    if (!window.confirm('Bỏ qua bài này? Bài bỏ qua tính là sai và không quay lại được.')) return;
    setBusy('skip');
    setActionError(null);
    setVerdict(null);
    try {
      applyAttempt(await contestApi.skip(attempt.id));
    } catch (e) {
      setActionError(errorText(e, 'Không bỏ qua được.'));
    } finally {
      setBusy(null);
    }
  };

  const doFinish = async () => {
    if (!attempt) return;
    if (!window.confirm('Kết thúc lượt thi ngay? Các bài chưa làm xong sẽ tính là sai.')) return;
    setBusy('finish');
    setActionError(null);
    try {
      applyAttempt(await contestApi.finish(attempt.id));
    } catch (e) {
      setActionError(errorText(e, 'Không kết thúc được lượt thi.'));
    } finally {
      setBusy(null);
    }
  };

  // ── Render ──
  if (loadError) {
    return (
      <div className="page-shell league-page grid min-h-screen place-items-center px-4">
        <Card className="max-w-md px-6 py-10 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-3 text-sm text-slate-600">{loadError}</p>
          <button onClick={onBack} className="mt-5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
            Về trang Đấu hạng
          </button>
        </Card>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="page-shell league-page grid min-h-screen place-items-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const total = attempt.problems.length;
  const lowTime = inProgress && remaining <= 300;

  const slotBar = (
    <div className="flex items-center gap-2">
      {attempt.problems.map((s) => (
        <span
          key={s.position}
          title={SLOT_STYLE[s.status].label}
          className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ring-1 ring-inset ${SLOT_STYLE[s.status].className}`}
        >
          {s.status === 'SOLVED' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : s.status === 'LOCKED' ? (
            <Lock className="h-3.5 w-3.5" />
          ) : s.status === 'SKIPPED' || s.status === 'UNSOLVED' ? (
            <MinusCircle className="h-4 w-4" />
          ) : (
            s.position + 1
          )}
        </span>
      ))}
    </div>
  );

  // Lượt đã kết thúc -> tổng kết
  if (!inProgress) {
    return (
      <div className="page-shell league-page min-h-screen">
        <main className="mx-auto max-w-2xl px-4 py-12">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-[#2a1a5e] via-[#3b1d8a] to-[#5b2a9e] px-6 py-8 text-center text-white">
              <Trophy className="mx-auto h-10 w-10 text-amber-300" />
              <p className="mt-3 text-sm text-violet-200">{attempt.seasonName} · Lượt {attempt.attemptNo}/{attempt.maxAttempts}</p>
              <h1 className="mt-1 text-2xl font-extrabold">Lượt thi đã kết thúc</h1>
            </div>
            <div className="grid grid-cols-2 gap-4 px-6 py-6">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-400">Bài làm đúng</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {attempt.solvedCount}/{total}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-400">Thời gian làm bài</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{formatClock(attempt.totalTimeSeconds)}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Kết quả từng bài</p>
              <ul className="space-y-2">
                {attempt.problems.map((s) => (
                  <li key={s.position} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">Bài {s.position + 1}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{s.submitCount} lần nộp</span>
                      {s.status === 'SOLVED' && <span className="font-mono text-slate-600">{formatClock(s.timeSeconds)}</span>}
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${SLOT_STYLE[s.status].className}`}>
                        {SLOT_STYLE[s.status].label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-slate-100 px-6 py-5 text-center">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Về trang Đấu hạng
              </button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell league-page flex h-screen flex-col">
      {/* Thanh trên: quay lại · tiến độ · đồng hồ */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            title="Rời trang (lượt thi vẫn tiếp tục tính giờ)"
          >
            <ArrowLeft className="h-4 w-4" /> Đấu hạng
          </button>
          <span className="hidden text-sm text-slate-400 sm:inline">
            {attempt.seasonName} · Lượt {attempt.attemptNo}/{attempt.maxAttempts}
          </span>
        </div>
        {slotBar}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${
              lowTime ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-700'
            }`}
          >
            <Clock className="h-4 w-4" /> {formatClock(remaining)}
          </span>
          <button
            onClick={doFinish}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <Flag className="h-4 w-4" /> Kết thúc lượt
          </button>
        </div>
      </header>

      {!current ? (
        <div className="grid flex-1 place-items-center text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 lg:grid-cols-2">
          {/* Đề bài */}
          <section className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Bài {current.position + 1}/{total}
              {current.topic ? ` · ${current.topic}` : ''}
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{current.title}</h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{current.statement}</p>

            {current.samples.length > 0 && (
              <div className="mt-6 space-y-3">
                {current.samples.map((s, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="mb-2 font-semibold text-slate-700">Ví dụ {i + 1}</p>
                    <p className="text-xs text-slate-400">Input</p>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-slate-800">{s.input}</pre>
                    <p className="mt-3 text-xs text-slate-400">Output</p>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-slate-800">{s.expectedOutput}</pre>
                  </div>
                ))}
              </div>
            )}
            <ul className="mt-6 list-disc space-y-1 pl-5 text-xs text-slate-500">
              <li>Đọc dữ liệu từ stdin và in kết quả ra stdout.</li>
              <li>Với Java, lớp chứa hàm main phải tên là <code>Main</code>.</li>
              <li>"Chạy thử" chỉ dùng test mẫu và không tính lần nộp.</li>
            </ul>
          </section>

          {/* Khung code + kết quả */}
          <section className="flex min-h-0 flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as CodeLanguage)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700"
              >
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={doSkip}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                >
                  {busy === 'skip' ? <Loader2 className="h-4 w-4 animate-spin" /> : <SkipForward className="h-4 w-4" />} Bỏ qua
                </button>
                <button
                  onClick={doRun}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {busy === 'run' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Chạy thử
                </button>
                <button
                  onClick={doSubmit}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Nộp bài
                </button>
              </div>
            </div>

            <div className="min-h-[240px] flex-1">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme={editorTheme}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  tabSize: 4,
                  automaticLayout: true,
                }}
              />
            </div>

            {(verdict || actionError || results) && (
              <div className="max-h-[38%] overflow-y-auto border-t border-slate-200 bg-white px-4 py-3 text-sm">
                {actionError && <p className="font-medium text-red-500">{actionError}</p>}
                {verdict && (
                  <p className={`flex items-center gap-1.5 font-semibold ${verdict.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                    {verdict.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {verdict.text}
                  </p>
                )}
                {results && (
                  <ul className="mt-2 space-y-2">
                    {results.map((r, i) => (
                      <li key={i} className="rounded-lg border border-slate-200 p-2.5">
                        <p className={`text-xs font-semibold ${r.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                          Test {i + 1}: {r.passed ? 'Đạt' : r.status || 'Sai'}
                          {r.input == null && ' (test ẩn)'}
                        </p>
                        {r.input != null && !r.passed && (
                          <div className="mt-1 grid gap-1 font-mono text-xs text-slate-600">
                            <span>Input: {r.input}</span>
                            <span>Mong đợi: {r.expectedOutput}</span>
                            <span>Nhận được: {r.actualOutput || '(trống)'}</span>
                          </div>
                        )}
                        {r.errorOutput && (
                          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-red-500">{r.errorOutput}</pre>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
