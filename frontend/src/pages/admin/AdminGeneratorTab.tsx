import { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Sparkles, FileCode, FileCode2, CheckCircle2, Download, Globe, Check, Rocket } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { TOPICS, type SkillLevel, LEVEL_COLORS, LEVEL_LABELS } from '@/types';
import { normalizeDifficulty } from '@/lib/difficulty';
import type { GeneratedQuestion } from './admin.types';
import { templatesApi, type Template as BackendTemplate } from '@/lib/api';

interface AdminGeneratorTabProps {
  onPublishQuestion?: (q: GeneratedQuestion) => void | Promise<void>;
  onPublishAllQuestions?: (qs: GeneratedQuestion[]) => void | Promise<void>;
  onNavigateToProblems?: () => void | Promise<void>;
}

export function AdminGeneratorTab({
  onPublishQuestion,
  onPublishAllQuestions,
  onNavigateToProblems,
}: AdminGeneratorTabProps) {
  const [genTopic, setGenTopic] = useState<string>('Array');
  const [genCount, setGenCount] = useState<number>(4);
  const [genMode, setGenMode] = useState<'variant_input_output' | 'new_problem'>('variant_input_output');
  const [genTemplate, setGenTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch templates from backend
  const [backendTemplates, setBackendTemplates] = useState<BackendTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    templatesApi.list()
      .then((tpls) => {
        if (!cancelled) {
          setBackendTemplates(tpls);
          if (tpls.length > 0) {
            setGenTemplate(String(tpls[0].id));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTemplatesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const templateOptions = templatesLoading || !genTopic
      ? []
      : backendTemplates
          .filter((t) => (t.topic?.name ?? 'Khác') === genTopic)
          .map((t) => {
            const levelLabel = LEVEL_LABELS[t.level as SkillLevel] ?? t.level;
            return {
              label: `${t.name} (${levelLabel})`,
              value: String(t.id),
            };
          });
  const [generatedExam, setGeneratedExam] = useState<GeneratedQuestion[] | null>(null);

  // Track published question IDs locally
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [publishBannerMsg, setPublishBannerMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setPublishBannerMsg(null);
    setErrorMsg(null);
    setPublishedIds(new Set());
    const generatedProblems: GeneratedQuestion[] = [];
    try {
      const templateId = Number(genTemplate);

      for (let i = 0; i < genCount; i++) {
        const problem = await templatesApi.generate(templateId, genMode === 'new_problem');
        const diff: SkillLevel = normalizeDifficulty(problem.level, 'intermediate');
        generatedProblems.push({
          id: String(problem.id),
          title: problem.statement.length > 80 ? problem.statement.substring(0, 80) + '...' : problem.statement,
          topic: problem.topic,
          difficulty: diff,
          starterCode: '',
          description: problem.statement,
          testCases: (problem.samples ?? []).map(s => ({ input: s.input, output: s.expectedOutput })),
          isPublic: false,
        });
      }

      setGeneratedExam(generatedProblems);
    } catch (err) {
      // Không hiện bài giả: chỉ giữ những bài đã thực sự được lưu trên backend
      const reason = err instanceof Error ? err.message : 'Lỗi không xác định';
      setGeneratedExam(generatedProblems.length > 0 ? generatedProblems : null);
      setErrorMsg(
        `Sinh bài thất bại (${generatedProblems.length}/${genCount} bài thành công). Lý do: ${reason}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishSingle = async (q: GeneratedQuestion) => {
    setErrorMsg(null);
    try {
      await onPublishQuestion?.(q);
      setPublishedIds((prev) => new Set(prev).add(q.id));
      setPublishBannerMsg(`🎉 Đã công khai bài "${q.title}" vào danh sách bài học của sinh viên!`);
    } catch (err) {
      setPublishBannerMsg(null);
      setErrorMsg(err instanceof Error ? err.message : 'Xuất bản thất bại.');
    }
  };

  const handleGoToProblems = () => {
    onNavigateToProblems?.();
  };

  const handlePublishAll = async () => {
    if (!generatedExam) return;
    setErrorMsg(null);
    try {
      await onPublishAllQuestions?.(generatedExam);
      setPublishedIds(new Set(generatedExam.map((q) => q.id)));
      setPublishBannerMsg(`🚀 Đã xuất bản thành công toàn bộ ${generatedExam.length} bài tập mới lên hệ thống cho người dùng học!`);
    } catch (err) {
      setPublishBannerMsg(null);
      setErrorMsg(err instanceof Error ? err.message : 'Xuất bản thất bại.');
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Generate Đề & Quản lý Xuất bản Bài tập</h1>
          <p className="admin-page-sub">
            Cấu hình tham số để AI sinh bộ đề bài tập ngẫu nhiên. Bấm <strong>"Public bài này"</strong> hoặc <strong>"Public toàn bộ"</strong> để công khai bài cho sinh viên học.
          </p>
        </div>
      </div>

      {publishBannerMsg && (
        <div
          style={{
            background: 'rgba(120, 211, 158, 0.12)',
            border: '1px solid rgba(120, 211, 158, 0.35)',
            color: '#78d39e',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} />
          {publishBannerMsg}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {errorMsg}
        </div>
      )}

      <div className="admin-generator-layout">
        {/* Panel điều khiển tham số Generator */}
        <div className="admin-card-box">
          <h3 className="admin-card-title">
            <Sliders size={18} /> Thiết Lập Tiêu Chí Sinh Đề
          </h3>

          <div className="profile-form">
            <div className="auth-field">
              <span className="auth-label" style={{ marginBottom: '6px' }}>Chủ đề chính</span>
              <SearchableSelect
                options={TOPICS.map((t) => ({ label: t, value: t }))}
                value={genTopic}
                onChange={(val) => setGenTopic(val)}
                showSearch={true}
              />
            </div>

            {genTopic && (
              <div className="auth-field">
                <span className="auth-label" style={{ marginBottom: '6px' }}>Bài mẫu tham chiếu (Template)</span>
                {templateOptions.length === 0 ? (
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#1e293b', color: '#7d8599', fontSize: '13px' }}>
                    Chưa có template. Vui lòng thêm template trước.
                  </div>
                ) : (
                  <SearchableSelect
                    options={templateOptions}
                    value={genTemplate}
                    onChange={(val) => setGenTemplate(val)}
                    showSearch={true}
                  />
                )}
              </div>
            )}

            <div className="auth-field">
              <span className="auth-label" style={{ marginBottom: '6px' }}>
                Phương thức sinh đề AI (Generation Mode)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                <div
                  onClick={() => setGenMode('variant_input_output')}
                  className={`gen-mode-card ${genMode === 'variant_input_output' ? 'active-blue' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <FileCode2 size={16} style={{ color: genMode === 'variant_input_output' ? '#5e8dfa' : '#7d8599' }} />
                    <strong className="gen-mode-title-blue">Biến thể theo Bài Mẫu</strong>
                  </div>
                  <p className="gen-mode-desc">Giữ nguyên bài toán gốc từ Template, AI chỉ cập nhật & đổi mới dữ liệu Input/Output mẫu.</p>
                </div>

                <div
                  onClick={() => setGenMode('new_problem')}
                  className={`gen-mode-card ${genMode === 'new_problem' ? 'active-purple' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <RefreshCw size={16} style={{ color: genMode === 'new_problem' ? '#a995ff' : '#7d8599' }} />
                    <strong className="gen-mode-title-purple">Tạo Đề Mới Hoàn Toàn</strong>
                  </div>
                  <p className="gen-mode-desc">Dựa theo chủ đề Template, AI sáng tác bài toán, yêu cầu và thuật toán mới hoàn toàn.</p>
                </div>
              </div>
            </div>

            <label className="auth-field">
              <span className="auth-label">Tổng số bài tập ({genCount} bài)</span>
              <input
                type="range"
                min={1}
                max={10}
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                style={{ accentColor: '#5e8dfa' }}
              />
            </label>



            <button
              className="assessment-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              onClick={handleGenerateExam}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="spin" /> Đang tổng hợp bài...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate bộ đề ngay
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel kết quả preview bộ đề được generate */}
        <div className="admin-card-box">
          <h3 className="admin-card-title" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={18} /> Preview & Quản Lý Xuất Bản
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {generatedExam && (
                <button
                  className="assessment-primary"
                  onClick={handlePublishAll}
                  style={{ fontSize: '12px', padding: '5px 12px', gap: '6px' }}
                  title="Công khai tất cả các bài này vào kho bài tập của học viên"
                >
                  <Rocket size={14} /> Public toàn bộ ({generatedExam.length} bài)
                </button>
              )}
              <button
                className="assessment-primary"
                onClick={handleGoToProblems}
                style={{ fontSize: '12px', padding: '5px 12px', gap: '6px', background: '#0f172a', borderColor: '#334155' }}
                title="Đến trang quản lý đề bài"
              >
                <FileCode size={14} /> Quản lý đề
              </button>
            </div>
          </h3>

          {generatedExam ? (
            <div className="admin-gen-results">
              <div className="gen-results-header">
                <span className="gen-exam-tag">
                  <CheckCircle2 size={14} /> Bộ đề {genTopic} ({generatedExam.length} bài)
                </span>
                <button className="history-view-btn">
                  <Download size={14} /> Xuất file JSON
                </button>
              </div>

              <div className="gen-question-list">
                {generatedExam.map((q) => {
                  const isPub = publishedIds.has(q.id);
                  return (
                    <div className="gen-question-item" key={q.id} style={{ borderColor: isPub ? '#78d39e44' : undefined }}>
                      <div className="gen-q-head" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{q.title}</strong>
                          <span
                            className="practice-difficulty"
                            style={{
                              color: LEVEL_COLORS[q.difficulty] || '#5e8dfa',
                              borderColor: `${LEVEL_COLORS[q.difficulty] || '#5e8dfa'}44`,
                              background: `${LEVEL_COLORS[q.difficulty] || '#5e8dfa'}18`,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 600,
                            }}
                          >
                            {LEVEL_LABELS[q.difficulty] || q.difficulty}
                          </span>
                        </div>

                        {/* Public action button */}
                        {isPub ? (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: '#78d39e18',
                              color: '#78d39e',
                              border: '1px solid #78d39e44',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={12} /> Đã Public cho HSSV
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="assessment-primary"
                            onClick={() => handlePublishSingle(q)}
                            style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
                            title="Đăng công khai bài này cho người dùng học"
                          >
                            <Globe size={12} /> Public bài này
                          </button>
                        )}
                      </div>
                      <pre className="gen-code-preview">
                        <code>{q.starterCode}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="admin-empty-preview">
              <Sparkles size={40} strokeWidth={1.2} style={{ color: '#3a4d7a', marginBottom: '12px' }} />
              <p style={{ color: '#7d8599', fontSize: '14px', margin: 0 }}>
                Nhấn nút <strong>Generate bộ đề ngay</strong> để xem danh sách bài tập được sinh ngẫu nhiên theo tiêu chí và công khai lên hệ thống.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
