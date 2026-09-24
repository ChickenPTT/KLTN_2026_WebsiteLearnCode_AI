import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
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
import { PRACTICE_PROBLEMS, type PracticeProblem, type AuthMode } from '@/types';
import { Brand } from '@/components/Brand';
import { Header } from '@/layout/Header';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

interface SubmitResult {
  passed: boolean;
  results: TestResult[];
  runtime: string;
  memory: string;
}

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
  const initialProblem = PRACTICE_PROBLEMS.find((p) => p.id === initialProblemId) || PRACTICE_PROBLEMS[0];
  const [problem, setProblem] = useState<PracticeProblem>(initialProblem);
  const [language, setLanguage] = useState<'java' | 'python'>('java');
  const [code, setCode] = useState<string>(
    initialProblem.starterCodes?.java || initialProblem.starterCode
  );
  const [runState, setRunState] = useState<RunState>('idle');
  const [results, setResults] = useState<TestResult[]>([]);
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

  const handleSelectProblem = (p: PracticeProblem): void => {
    setProblem(p);
    const newCode = p.starterCodes?.[language] || p.starterCode;
    setCode(newCode);
    setRunState('idle');
    setResults([]);
    setSubmitResult(null);
  };

  const handleLanguageChange = (newLang: 'java' | 'python'): void => {
    setLanguage(newLang);
    const newCode = problem.starterCodes?.[newLang] || problem.starterCode;
    setCode(newCode);
  };

  const handleRun = (): void => {
    setRunState('running');
    setTimeout(() => {
      const mockResults: TestResult[] = problem.examples.map((ex) => ({
        passed: Math.random() > 0.3,
        input: ex.input,
        expected: ex.output,
        actual: Math.random() > 0.3 ? ex.output : '[undefined]',
      }));
      setResults(mockResults);
      setRunState(mockResults.every((r) => r.passed) ? 'passed' : 'failed');
    }, 1200);
  };

  const handleSubmitConfirmed = (): void => {
    setShowSubmitConfirm(false);
    setRunState('running');
    setTimeout(() => {
      const mockResults: TestResult[] = problem.examples.map((ex) => ({
        passed: Math.random() > 0.15,
        input: ex.input,
        expected: ex.output,
        actual: Math.random() > 0.15 ? ex.output : '[wrong]',
      }));
      const allPassed = mockResults.every((r) => r.passed);
      setResults(mockResults);
      setRunState(allPassed ? 'passed' : 'failed');
      setSubmitResult({
        passed: allPassed,
        results: mockResults,
        runtime: `${Math.floor(Math.random() * 80 + 12)} ms`,
        memory: `${(Math.random() * 2 + 40).toFixed(1)} MB`,
      });
    }, 1500);
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
    const pool = PRACTICE_PROBLEMS.filter((p) => p.id !== problem.id && p.isPublic !== false);
    const picked = pool[Math.floor(Math.random() * pool.length)] || PRACTICE_PROBLEMS[0];
    setProblem(picked);
    setCode(picked.starterCodes?.[language] || picked.starterCode);
    setRunState('idle');
    setResults([]);
  };

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
            <p className="problem-description">{problem.description}</p>

            <div className="problem-examples">
              {problem.examples.map((ex, i) => (
                <div className="problem-example" key={i}>
                  <div className="example-label">Ví dụ {i + 1}:</div>
                  <div className="example-line"><span className="example-key">Input:</span> {ex.input}</div>
                  <div className="example-line"><span className="example-key">Output:</span> {ex.output}</div>
                  {ex.explanation && (
                    <div className="example-line"><span className="example-key">Giải thích:</span> {ex.explanation}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="problem-constraints">
              <div className="constraints-label"><ShieldAlert size={14} /> Ràng buộc:</div>
              <ul>
                {problem.constraints.map((c, i) => (<li key={i}>{c}</li>))}
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
              <p className="top-problem-desc">{problem.description}</p>
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
                  onChange={(e) => handleLanguageChange(e.target.value as 'java' | 'python')}
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
              {runState === 'running' && <><Clock size={15} className="spin" /> <span>Đang chấm bài...</span></>}
              {runState === 'passed' && <><CheckCircle2 size={15} className="text-green" /> <span>Tất cả test case đã qua!</span></>}
              {runState === 'failed' && <><XCircle size={15} className="text-red" /> <span>Một số test case chưa qua</span></>}
            </div>
            {results.length > 0 && (
              <div className="test-results">
                {results.map((r, i) => (
                  <div className={`test-case ${r.passed ? 'is-pass' : 'is-fail'}`} key={i}>
                    <div className="test-case-head">
                      {r.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      <span>Test case {i + 1}</span>
                      <span className={`test-case-status ${r.passed ? 'pass' : 'fail'}`}>
                        {r.passed ? 'Accepted' : 'Wrong Answer'}
                      </span>
                    </div>
                    <div className="test-case-body">
                      <div><span className="test-key">Input:</span> {r.input}</div>
                      <div><span className="test-key">Expected:</span> {r.expected}</div>
                      <div><span className="test-key">Output:</span> {r.actual}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {runState === 'failed' && (
              <div className="ai-hint">
                <div className="ai-hint-head"><Lightbulb size={15} /> Gợi ý từ AI</div>
                <p>Hãy kiểm tra các trường hợp biên (edge cases) — đầu vào rỗng, giá trị âm, hoặc mảng chỉ có một phần tử.</p>
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
              {submitResult.passed ? 'Chúc mừng! Accepted 🎉' : 'Wrong Answer'}
            </h2>
            <p className="submit-result-sub">
              {submitResult.passed
                ? 'Tất cả test case đã qua. Bài giải của bạn được chấp nhận!'
                : 'Một số test case chưa qua. Xem lại code và thử lại nhé.'}
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
                onClick={() => { setSubmitResult(null); handleSelectProblem(PRACTICE_PROBLEMS[(PRACTICE_PROBLEMS.findIndex(p => p.id === problem.id) + 1) % PRACTICE_PROBLEMS.length]); }}
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
