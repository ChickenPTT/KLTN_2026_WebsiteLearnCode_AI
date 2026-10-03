import { useEffect, useRef, useState } from 'react';
import { FlaskConical, X, CheckCircle2, XCircle, RefreshCw, Globe } from 'lucide-react';
import { problemsApi, titleFromStatement, type AdminProblem, type TestCaseResult, type VerifyResult } from '@/lib/problemsApi';
import { apiErrorMessage } from './adminApi.utils';

interface AdminVerifyModalProps {
  problem: AdminProblem;
  onClose: () => void;
  /** Bao ket qua kiem tra ve tab cha (de hien trang thai "Đạt / Lỗi" trong danh sach) */
  onResult?: (problemId: number, result: VerifyResult) => void;
  /** Co thi hien nut "Xuất bản" khi tat ca test case dat (chi voi bai nhap) */
  onPublish?: (problem: AdminProblem) => Promise<void> | void;
}

/**
 * Judge0 tra "Accepted" ca khi output sai (chi nghia la chuong trinh chay xong) — backend moi set `passed`.
 * passed -> "Accepted"; status rong/"Accepted" ma khong dat -> "Wrong Answer"; con lai giu status Judge0.
 */
function judgeStatusLabel(r: TestCaseResult): string {
  if (r.passed) return 'Accepted';
  if (!r.status || r.status === 'Accepted') return 'Wrong Answer';
  return r.status;
}

/** "Kiểm tra" = chay loi giai mau cua template voi toan bo test case tren Judge0 */
export function AdminVerifyModal({ problem, onClose, onResult, onPublish }: AdminVerifyModalProps) {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runKey, setRunKey] = useState(0);
  const [publishing, setPublishing] = useState(false);

  // onResult co the doi moi lan render cua cha -> giu trong ref de khong chay lai verify
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setResult(null);
    problemsApi
      .verify(problem.id)
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        onResultRef.current?.(problem.id, res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [problem.id, runKey]);

  const passedCount = result ? result.results.filter((r) => r.passed).length : 0;
  const canPublish = Boolean(onPublish) && problem.status === 'DRAFT' && result?.allPassed === true;

  const handlePublish = async () => {
    if (!onPublish) return;
    setPublishing(true);
    try {
      await onPublish(problem);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" style={{ maxWidth: '680px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(169, 149, 255, 0.15)', color: '#a995ff', padding: '10px', borderRadius: '10px' }}>
              <FlaskConical size={22} />
            </div>
            <div>
              <h3 className="dialog-title admin-modal-title" style={{ margin: 0, fontSize: '18px' }}>
                Kiểm tra bộ test case
              </h3>
              <span className="admin-modal-sub">Chạy lời giải mẫu của template với toàn bộ test case (Judge0)</span>
            </div>
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="sandbox-modal-card">
          <div className="sandbox-card-title">
            Bài #{problem.id}: {titleFromStatement(problem.statement, problem.id)}
          </div>

          {loading && (
            <div className="sandbox-card-desc" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={14} className="spin" /> Đang chạy {problem.testCases.length} test case trên Judge0...
            </div>
          )}

          {error && (
            <div className="sandbox-card-desc" style={{ color: '#f08a8a' }}>
              {error}
            </div>
          )}

          {result && (
            <div className="sandbox-results-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  className="sandbox-status-passed"
                  style={result.allPassed ? undefined : { color: '#f08a8a' }}
                >
                  {result.allPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {' '}
                  {passedCount}/{result.results.length} TEST CASE ĐẠT
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '45vh', overflowY: 'auto' }}>
                {result.results.length === 0 && (
                  <div className="sandbox-code-preview">Bài này chưa có test case nào.</div>
                )}
                {result.results.map((r, i) => (
                  <div className="sandbox-code-preview" key={i} style={{ whiteSpace: 'pre-wrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: r.passed ? '#78d39e' : '#f08a8a' }}>
                        Test {i + 1}: {r.passed ? 'Đạt' : 'Không đạt'}
                      </strong>
                      <span className="sandbox-metrics">
                        {judgeStatusLabel(r)}
                        {r.time ? ` | ${r.time}s` : ''}
                        {r.memory != null ? ` | ${r.memory} KB` : ''}
                      </span>
                    </div>
                    <div><strong>Input:</strong> {r.input}</div>
                    <div><strong>Expected:</strong> {r.expectedOutput}</div>
                    <div className={r.passed ? 'sandbox-output-text' : undefined}>
                      <strong>Actual:</strong> {r.actualOutput}
                    </div>
                    {r.errorOutput && (
                      <div style={{ color: '#f08a8a' }}>
                        <strong>Lỗi:</strong>
                        <pre style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', fontSize: '12px' }}>{r.errorOutput}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button className="dialog-cancel" onClick={onClose}>
            Đóng
          </button>
          <button className="dialog-cancel" onClick={() => setRunKey((k) => k + 1)} disabled={loading}>
            <RefreshCw size={14} /> Chạy lại
          </button>
          {canPublish && (
            <button
              className="dialog-confirm"
              style={{ background: '#4b78f5' }}
              onClick={handlePublish}
              disabled={publishing}
            >
              <Globe size={15} /> {publishing ? 'Đang xuất bản...' : 'Xuất bản'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
