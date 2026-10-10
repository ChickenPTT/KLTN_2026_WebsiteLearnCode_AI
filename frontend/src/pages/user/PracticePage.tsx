import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lightbulb,
  Play,
  Send,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trophy,
  X,
  XCircle,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Shuffle,
} from 'lucide-react';
import type { PracticeProblem, AuthMode } from '@/types';
import { Header } from '@/layout/Header';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { usePublishedProblems } from '@/hooks/usePublishedProblems';
import {
  judgeApi,
  problemsApi,
  STARTER_CODE,
  toPracticeProblem,
  type AiFeedback,
  type CodeLanguage,
  type TestCaseResult,
} from '@/lib/problemsApi';

interface PracticePageProps {
  onBack: () => void;
  initialProblemId?: string;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#f43f5e',
};

type RunState = 'idle' | 'running' | 'passed' | 'failed';

interface SubmitResult {
  passed: boolean;
  label: string;
  results: TestCaseResult[];
  runtime: string;
  memory: string;
}

/**
 * Nhan hien thi cho 1 test case. Judge0 tra "Accepted" khi chuong trinh chay xong ke ca khi in sai,
 * viec so dap an do backend lam (truong passed) -> sai ma status van Accepted thi la Wrong Answer.
 */
function caseLabel(r: TestCaseResult): string {
  if (r.passed) return 'Accepted';
  if (!r.status || r.status === 'Accepted') return 'Wrong Answer';
  return r.status;
}

function maxRuntime(results: TestCaseResult[]): string {
  const times = results.map((r) => Number(r.time)).filter((t) => Number.isFinite(t) && t > 0);
  return times.length ? `${Math.max(...times).toFixed(3)} s` : '—';
}

function maxMemory(results: TestCaseResult[]): string {
  const mems = results.map((r) => r.memory ?? 0).filter((m) => m > 0);
  return mems.length ? `${(Math.max(...mems) / 1024).toFixed(1)} MB` : '—';
}

const ERROR_TYPE_LABELS: Record<string, string> = {
  logic: 'Lỗi logic',
  edge_case: 'Trường hợp biên',
  runtime: 'Lỗi runtime',
  compile: 'Lỗi biên dịch',
  performance: 'Hiệu năng',
  none: 'Không có lỗi',
};

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');

function PracticePage({
  onBack,
  initialProblemId,
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
}: PracticePageProps) {
  const navigate = useNavigate();
  // Danh sach bai public (cache dung chung) — cho nut "Bài ngẫu nhiên" / "Bài tiếp theo"
  const { problems: publishedProblems } = usePublishedProblems();

  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [language, setLanguage] = useState<CodeLanguage>('java');
  const [code, setCode] = useState<string>(STARTER_CODE.java);
  const [runState, setRunState] = useState<RunState>('idle');
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(true);

  // Split resizer state (percentage of full width for problem panel)
  const [problemWidth, setProblemWidth] = useState<number>(45);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Full-screen / Expanded code view mode
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showTopProblem, setShowTopProblem] = useState<boolean>(true);

  // Popup states
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // Dynamic Monaco Editor theme for Light/Dark mode
  const [editorTheme, setEditorTheme] = useState<'vs' | 'vs-dark'>(() =>
    document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light'
      ? 'vs'
      : 'vs-dark'
  );

  useEffect(() => {
    const updateTheme = () => {
      const isLight =
        document.body.classList.contains('light-mode') ||
        document.documentElement.getAttribute('data-theme') === 'light';
      setEditorTheme(isLight ? 'vs' : 'vs-dark');
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  // Draggable handle event listener
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availableWidth = rect.width;
      if (availableWidth <= 0) return;

      const mouseXInAvailable = e.clientX - rect.left;
      let pct = (mouseXInAvailable / availableWidth) * 100;
      if (pct < 15) pct = 15;
      if (pct > 80) pct = 80;
      setProblemWidth(pct);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Tai de bai tu backend (trang duoc mount lai moi khi doi problemId tren URL)
  useEffect(() => {
    let cancelled = false;
    setProblem(null);
    setLoadError(null);
    problemsApi
      .get(initialProblemId ?? '')
      .then((p) => {
        if (!cancelled) setProblem(toPracticeProblem(p));
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [initialProblemId]);

  const resetResults = () => {
    setRunState('idle');
    setResults([]);
    setRunError(null);
    setAiFeedback(null);
    setAiError(null);
    setSubmitResult(null);
  };

  const goToProblem = (id: string) => navigate(`/practice/${encodeURIComponent(id)}`);

  const handleLanguageChange = (newLang: CodeLanguage): void => {
    // Chi thay code khi sinh vien chua sua gi — khong xoa bai dang lam do
    const untouched = code.trim() === STARTER_CODE[language].trim() || code.trim() === '';
    if (!untouched && !window.confirm('Đổi ngôn ngữ sẽ thay code hiện tại bằng code mẫu. Tiếp tục?')) return;
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang]);
    resetResults();
  };

  const handleRun = async (): Promise<void> => {
    if (!problem) return;
    resetResults();
    setRunState('running');
    try {
      const res = await judgeApi.run(problem.id, code, language);
      setResults(res.testResults);
      setRunState(res.passed ? 'passed' : 'failed');
    } catch (e) {
      setRunError(errorMessage(e));
      setRunState('idle');
    }
  };

  const handleSubmitConfirmed = async (): Promise<void> => {
    if (!problem) return;
    setShowSubmitConfirm(false);
    resetResults();
    setRunState('running');
    try {
      const res = await judgeApi.submit(problem.id, code, language);
      setResults(res.testResults);
      setAiFeedback(res.aiFeedback);
      setAiError(res.aiError ?? null);
      setRunState(res.passed ? 'passed' : 'failed');
      const firstFail = res.testResults.find((r) => !r.passed);
      setSubmitResult({
        passed: res.passed,
        label: firstFail ? caseLabel(firstFail) : 'Accepted',
        results: res.testResults,
        runtime: maxRuntime(res.testResults),
        memory: maxMemory(res.testResults),
      });
    } catch (e) {
      setRunError(errorMessage(e));
      setRunState('idle');
    }
  };

  const handleEditorMount = (editor: unknown): void => {
    const ed = editor as {
      onKeyDown: (cb: (e: { keyCode: number; browserEvent: KeyboardEvent }) => void) => void;
    };
    ed.onKeyDown((e) => {
      const ctrl = e.browserEvent.ctrlKey || e.browserEvent.metaKey;
      if (ctrl && (e.browserEvent.keyCode === 67 || e.browserEvent.keyCode === 86 || e.browserEvent.keyCode === 88)) {
        e.browserEvent.preventDefault();
        e.browserEvent.stopPropagation();
      }
    });
  };

  const handleNextRandomProblem = () => {
    const pool = publishedProblems.filter((p) => p.id !== problem?.id);
    if (pool.length === 0) return;
    goToProblem(pool[Math.floor(Math.random() * pool.length)].id);
  };

  const handleNextProblem = () => {
    setSubmitResult(null);
    if (publishedProblems.length === 0) return;
    const idx = publishedProblems.findIndex((p) => p.id === problem?.id);
    const next = publishedProblems[(idx + 1) % publishedProblems.length];
    if (next.id !== problem?.id) goToProblem(next.id);
  };

  if (!problem) {
    return (
      <div className="practice-shell">
        <Header
          hideNav
          onGoLanding={onGoLanding}
          onGoAuth={onGoAuth}
          onGoTopics={onGoTopics}
          onGoProfile={onGoProfile}
          onGoProgress={onGoProgress}
          onGoHistory={onGoHistory}
          onGoAdmin={onGoAdmin}
          onGoSettings={onGoSettings}
          onLoggedOut={onLoggedOut}
        />
        <div className="empty-problems-state" style={{ marginTop: 80 }}>
          {loadError ? (
            <>
              <XCircle size={40} strokeWidth={1.2} />
              <h3>Không mở được bài tập</h3>
              <p>{loadError}</p>
              <button className="assessment-ghost" onClick={onBack}>
                <ArrowLeft size={14} /> Quay lại danh sách bài
              </button>
            </>
          ) : (
            <>
              <Clock size={40} strokeWidth={1.2} className="spin" />
              <h3>Đang tải đề bài...</h3>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="practice-shell">
      {/* ── Standard Application Header ── */}
      <Header
        hideNav
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <div
        className={`practice-layout ${isExpanded ? 'is-expanded' : ''}`}
        ref={containerRef}
        style={{
          display: 'flex',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        {/* Left: problem description (hidden in expanded mode) */}
        {!isExpanded && (
          <section
            className="problem-panel"
            style={{ width: `${problemWidth}%`, flexShrink: 0 }}
          >
            <button className="practice-content-back-btn" onClick={onBack}>
              <ArrowLeft size={15} /> Quay lại danh sách bài
            </button>

            <div className="problem-header">
              <h2 className="problem-title">{problem.title}</h2>
              <div className="problem-tags">
                <span className="practice-topic-tag">{problem.topic}</span>
                <span className="practice-difficulty" style={{ color: DIFFICULTY_COLORS[problem.difficulty] }}>
                  {problem.difficulty}
                </span>
              </div>
            </div>
            <p className="problem-description" style={{ whiteSpace: 'pre-wrap' }}>{problem.description}</p>

            {problem.examples.length > 0 && (
              <div className="problem-examples">
                {problem.examples.map((ex, i) => (
                  <div className="problem-example" key={i}>
                    <div className="example-label">Ví dụ {i + 1}:</div>
                    <div className="example-line"><span className="example-key">Input:</span> <pre style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>{ex.input}</pre></div>
                    <div className="example-line"><span className="example-key">Output:</span> <pre style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>{ex.output}</pre></div>
                    {ex.explanation && (
                      <div className="example-line"><span className="example-key">Giải thích:</span> {ex.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="problem-constraints">
              <div className="constraints-label"><ShieldAlert size={14} /> Lưu ý:</div>
              <ul>
                {problem.constraints.map((c, i) => (<li key={i}>{c}</li>))}
                <li>Đọc dữ liệu từ input chuẩn (stdin) và in kết quả ra màn hình (stdout).</li>
                <li>Với Java, lớp chứa hàm main phải tên là <code>Main</code>.</li>
              </ul>
            </div>
          </section>
        )}

        {/* Resizer Handle between problem panel and editor panel */}
        {!isExpanded && (
          <div
            className={`resize-handle ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            title="Kéo để điều chỉnh độ rộng giao diện"
          />
        )}

        {/* Right: editor + results */}
        <section className="editor-panel" style={{ flex: 1, minWidth: 0 }}>
          {showWarning && (
            <div className="paste-warning">
              <ShieldAlert size={16} />
              <span>Copy-paste đã bị vô hiệu hóa. Bạn phải tự viết code — đây là cách tốt nhất để học.</span>
              <button onClick={() => setShowWarning(false)}><X size={15} /></button>
            </div>
          )}

          {/* Expanded mode top problem collapsible banner */}
          {isExpanded && showTopProblem && (
            <div className="top-problem-banner">
              <div className="top-problem-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="practice-content-back-btn" style={{ margin: 0 }} onClick={onBack}>
                    <ArrowLeft size={14} /> Quay lại
                  </button>
                  <h3 className="top-problem-title">{problem.title}</h3>
                  <span className="practice-topic-tag">{problem.topic}</span>
                  <span className="practice-difficulty" style={{ color: DIFFICULTY_COLORS[problem.difficulty] }}>
                    {problem.difficulty}
                  </span>
                </div>
                <button
                  className="practice-icon-btn"
                  onClick={() => setShowTopProblem(false)}
                  title="Ẩn đề bài"
                >
                  <ChevronUp size={14} /> Ẩn đề bài
                </button>
              </div>
              <p className="top-problem-desc" style={{ whiteSpace: 'pre-wrap' }}>{problem.description}</p>
              <div className="top-problem-examples">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="top-problem-example">
                    <span className="example-key">Ví dụ {i + 1}:</span> Input: <code>{ex.input}</code> | Output: <code>{ex.output}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="editor-toolbar">
            <div className="practice-toolbar-left">
              {/* Language Selector Dropdown */}
              <div className="editor-lang-select-wrap">
                <Terminal size={14} className="lang-icon" />
                <select
                  className="editor-lang-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as CodeLanguage)}
                  disabled={runState === 'running'}
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
              </div>

              {/* Toggle Top Problem in Expanded Mode */}
              {isExpanded && !showTopProblem && (
                <button
                  className="practice-icon-btn"
                  onClick={() => setShowTopProblem(true)}
                  title="Hiển thị đề bài"
                >
                  <ChevronDown size={14} /> Xem đề bài
                </button>
              )}

              {/* Expand / Minimize Code view toggle */}
              <button
                className={`practice-icon-btn ${isExpanded ? 'active' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Thu nhỏ giao diện code' : 'Mở rộng giao diện code toàn màn hình'}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isExpanded ? 'Thu nhỏ' : 'Mở rộng code'}</span>
              </button>
            </div>

            <div className="editor-actions">
              <button
                type="button"
                className="practice-random-btn"
                onClick={handleNextRandomProblem}
                disabled={runState === 'running' || publishedProblems.length < 2}
                title="Đổi sang bài ngẫu nhiên khác"
              >
                <Shuffle size={14} /> Bài ngẫu nhiên
              </button>
              <button className="practice-run" onClick={handleRun} disabled={runState === 'running'}>
                <Play size={14} /> {runState === 'running' ? 'Đang chạy...' : 'Chạy thử'}
              </button>
              <button
                className="practice-submit"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={runState === 'running'}
              >
                <Send size={14} /> Nộp bài
              </button>
            </div>
          </div>

          <div className="monaco-wrap">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              onMount={handleEditorMount}
              theme={editorTheme}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 14 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="results-panel">
            <div className="results-panel-header">
              {runState === 'idle' && <><Terminal size={15} /> <span>Sẵn sàng chạy code ({language === 'java' ? 'Java' : 'Python'})</span></>}
              {runState === 'running' && <><Clock size={15} className="spin" /> <span>Đang chấm bài... (có thể mất vài giây)</span></>}
              {runState === 'passed' && <><CheckCircle2 size={15} className="text-green" /> <span>Tất cả test case đã qua!</span></>}
              {runState === 'failed' && <><XCircle size={15} className="text-red" /> <span>Một số test case chưa qua</span></>}
            </div>
            {runError && (
              <div className="test-case is-fail" style={{ marginTop: 8 }}>
                <div className="test-case-head">
                  <XCircle size={14} /> <span>{runError}</span>
                </div>
              </div>
            )}
            {results.length > 0 && (
              <div className="test-results">
                {results.map((r, i) => (
                  <div className={`test-case ${r.passed ? 'is-pass' : 'is-fail'}`} key={i}>
                    <div className="test-case-head">
                      {r.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span>Test case {i + 1}</span>
                      <span className={`test-case-status ${r.passed ? 'pass' : 'fail'}`}>
                        {caseLabel(r)}
                      </span>
                    </div>
                    <div className="test-case-body">
                      <div><span className="test-key">Input:</span> <pre style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>{r.input}</pre></div>
                      <div><span className="test-key">Expected:</span> {r.expectedOutput}</div>
                      <div><span className="test-key">Output:</span> {r.actualOutput || <em>(không có output)</em>}</div>
                      {r.errorOutput && (
                        <pre style={{ whiteSpace: 'pre-wrap', color: '#f08a8a', margin: '6px 0 0', fontSize: 12 }}>
                          {r.errorOutput}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {aiFeedback && (
              <div className="ai-hint">
                <div className="ai-hint-head">
                  <Lightbulb size={15} /> Nhận xét từ AI
                  {aiFeedback.errorType && (
                    <span className="test-case-status fail" style={{ marginLeft: 8 }}>
                      {ERROR_TYPE_LABELS[aiFeedback.errorType] ?? aiFeedback.errorType}
                    </span>
                  )}
                  {aiFeedback.severity && aiFeedback.severity !== 'none' && (
                    <span className="test-case-status fail" style={{ marginLeft: 4 }}>
                      {aiFeedback.severity === 'major' ? 'Nghiêm trọng' : 'Nhẹ'}
                    </span>
                  )}
                </div>
                {aiFeedback.explanation && <p>{aiFeedback.explanation}</p>}
                {aiFeedback.hint && (
                  <p style={{ marginTop: 6 }}><strong>Gợi ý:</strong> {aiFeedback.hint}</p>
                )}
                {aiFeedback.suspectedLines?.length > 0 && (
                  <p style={{ marginTop: 6 }}>
                    <strong>Dòng cần xem lại:</strong> {aiFeedback.suspectedLines.join(', ')}
                  </p>
                )}
              </div>
            )}
            {aiError && (
              <div className="ai-hint">
                <div className="ai-hint-head"><Lightbulb size={15} /> Nhận xét từ AI</div>
                <p>{aiError}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Popup xác nhận nộp bài ── */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Xác nhận nộp bài?"
        message={`Bạn sắp nộp bài "${problem.title}" bằng ngôn ngữ ${language === 'java' ? 'Java' : 'Python'}. Hệ thống sẽ chạy tất cả test case ẩn để chấm điểm.`}
        confirmLabel="Nộp bài"
        cancelLabel="Xem lại code"
        variant="primary"
        onConfirm={handleSubmitConfirmed}
        onCancel={() => setShowSubmitConfirm(false)}
      />

      {/* ── Modal kết quả nộp bài ── */}
      {submitResult && (
        <div className="dialog-overlay" onClick={() => setSubmitResult(null)}>
          <div className="submit-result-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-close" onClick={() => setSubmitResult(null)}>
              <X size={18} />
            </button>

            <div className={`submit-result-icon ${submitResult.passed ? 'pass' : 'fail'}`}>
              {submitResult.passed ? <Trophy size={32} strokeWidth={1.4} /> : <XCircle size={32} strokeWidth={1.4} />}
            </div>

            <h2 className="submit-result-title">
              {submitResult.passed ? 'Chúc mừng! Accepted 🎉' : submitResult.label}
            </h2>
            <p className="submit-result-sub">
              {submitResult.passed
                ? 'Tất cả test case đã qua. Bài giải của bạn được chấp nhận!'
                : 'Một số test case chưa qua. Xem nhận xét của AI bên dưới khung code và thử lại nhé.'}
            </p>

            <div className="submit-result-stats">
              <div className="submit-stat">
                <Clock size={16} />
                <div>
                  <span>Runtime</span>
                  <strong>{submitResult.runtime}</strong>
                </div>
              </div>
              <div className="submit-stat">
                <Sparkles size={16} />
                <div>
                  <span>Memory</span>
                  <strong>{submitResult.memory}</strong>
                </div>
              </div>
              <div className="submit-stat">
                <CheckCircle2 size={16} />
                <div>
                  <span>Test cases</span>
                  <strong>
                    {submitResult.results.filter((r) => r.passed).length}/{submitResult.results.length}
                  </strong>
                </div>
              </div>
            </div>

            <div className="submit-result-actions">
              <button
                className="assessment-ghost"
                onClick={() => setSubmitResult(null)}
              >
                Xem lại code
              </button>
              <button
                className="assessment-primary"
                onClick={handleNextProblem}
                disabled={publishedProblems.length < 2}
              >
                Bài tiếp theo <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PracticePage;
