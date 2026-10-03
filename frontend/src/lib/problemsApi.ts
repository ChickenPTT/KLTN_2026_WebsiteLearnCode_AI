/**
 * API bai tap / cham bai / sinh de — bao quanh apiFetch (tu gan Bearer token + refresh).
 * Backend luu bai dang "statement + test case stdin/stdout" nen o day co ham chuyen
 * sang PracticeProblem (kieu UI dang dung) de khong phai sua giao dien nhieu.
 */
import { apiFetch } from '@/lib/api';
import type { PracticeProblem } from '@/types';

// ─── Kieu du lieu backend ───────────────────────────────────────────────────

export type ProblemStatus = 'DRAFT' | 'PUBLISHED';
export type ProblemSource = 'MANUAL' | 'AI_GENERATED';

/** GET /api/problems, GET /api/problems/{id} — ban cho sinh vien (khong co loi giai, chi test mau) */
export interface ProblemView {
  id: number;
  statement: string;
  topic: string | null;
  level: string | null;
  languageId: number;
  status: ProblemStatus;
  sourceType: ProblemSource;
  createdAt: string;
  samples: { input: string; expectedOutput: string }[];
  testCaseCount: number;
}

export interface BackendTopic {
  id: number;
  name: string;
  colorTag: string | null;
}

export interface BackendTemplate {
  id: number;
  name: string;
  topic: BackendTopic | null;
  level: string | null;
  generatorType: 'TWO_INTEGERS' | 'INTEGER_ARRAY' | 'STRING_BASIC';
  minN: number | null;
  maxN: number | null;
  minValue: number | null;
  maxValue: number | null;
  statementPattern: string;
  referenceSolutionCode: string;
  languageId: number;
  createdAt: string;
}

/** GET /api/problems/manage, /drafts, POST /api/template/generate — ban day du cho giang vien/admin */
export interface AdminProblem {
  id: number;
  statement: string;
  languageId: number;
  topic: string | null;
  level: string | null;
  status: ProblemStatus;
  sourceType: ProblemSource;
  template: BackendTemplate | null;
  referenceSolution: string | null;
  createdAt: string;
  testCases: { id: number; input: string; expectedOutput: string }[];
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  /** Trang thai Judge0: "Accepted", "Wrong Answer", "Compilation Error", ... */
  status: string;
  time: string | null;
  memory: number | null;
  /** Loi bien dich / stderr neu co */
  errorOutput: string | null;
}

export interface AiFeedback {
  errorType: 'logic' | 'edge_case' | 'runtime' | 'compile' | 'performance' | 'none' | string;
  suspectedLines: number[];
  explanation: string;
  hint: string;
  severity: 'minor' | 'major' | 'none' | string;
}

export interface RunResponse {
  passed: boolean;
  testResults: TestCaseResult[];
}

export interface AnalyzeResponse {
  passed: boolean;
  testResults: TestCaseResult[];
  aiFeedback: AiFeedback | null;
  /** Co khi AI loi — ket qua cham van hop le */
  aiError?: string;
}

export interface VerifyResult {
  allPassed: boolean;
  results: TestCaseResult[];
}

export interface HistoryItem {
  id: number;
  problemId: number;
  topic: string | null;
  level: string | null;
  passed: boolean;
  submittedAt: string;
}

// ─── Ngon ngu (Judge0 language_id) ──────────────────────────────────────────

export type CodeLanguage = 'java' | 'python';

export const LANGUAGE_IDS: Record<CodeLanguage, number> = { java: 62, python: 71 };

export function languageFromId(id: number): CodeLanguage {
  return id === 71 ? 'python' : 'java';
}

export const LANGUAGE_LABELS: Record<number, string> = {
  50: 'C',
  54: 'C++',
  62: 'Java',
  71: 'Python',
};

/** Code khoi dau: bai cham theo stdin/stdout (Judge0), Java bat buoc class Main */
export const STARTER_CODE: Record<CodeLanguage, string> = {
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Đọc dữ liệu từ input, in kết quả ra màn hình (System.out.println)

    }
}
`,
  python: `import sys

def main():
    data = sys.stdin.read().split()
    # Đọc dữ liệu từ input, in kết quả ra màn hình (print)

main()
`,
};

// ─── Chuyen doi sang kieu UI ────────────────────────────────────────────────

/** level trong DB la chuoi tu do (Easy/EASY/de/beginner...) -> 3 muc UI */
export function toDifficulty(level: string | null | undefined): PracticeProblem['difficulty'] {
  const l = (level ?? '').trim().toLowerCase();
  if (['easy', 'de', 'dễ', 'beginner', 'basic', 'co ban', 'cơ bản'].includes(l)) return 'Easy';
  if (['hard', 'kho', 'khó', 'advanced', 'expert', 'nang cao', 'nâng cao'].includes(l)) return 'Hard';
  return 'Medium';
}

/** Tieu de = dong dau cua de bai (bo ky tu markdown), toi da 80 ky tu */
export function titleFromStatement(statement: string | null | undefined, id: number): string {
  const firstLine = (statement ?? '')
    .split('\n')
    .map((s) => s.replace(/^[#*\->\s]+|[*`]+/g, '').trim())
    .find((s) => s.length > 0);
  if (!firstLine) return `Bài tập #${id}`;
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

export function toPracticeProblem(p: ProblemView | AdminProblem): PracticeProblem {
  const samples =
    'samples' in p
      ? p.samples
      : (p.testCases ?? []).slice(0, 1).map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }));
  const lang = languageFromId(p.languageId);
  return {
    id: String(p.id),
    title: titleFromStatement(p.statement, p.id),
    topic: p.topic ?? 'Khác',
    difficulty: toDifficulty(p.level),
    description: p.statement ?? '',
    examples: samples.map((s) => ({ input: s.input, output: s.expectedOutput })),
    starterCode: STARTER_CODE[lang],
    starterCodes: { java: STARTER_CODE.java, python: STARTER_CODE.python },
    language: lang,
    constraints: [],
    isPublic: p.status === 'PUBLISHED',
    isAiGenerated: p.sourceType === 'AI_GENERATED',
    updatedAt: p.createdAt,
  };
}

/** So sanh ten chu de khong phan biet hoa thuong / khoang trang */
export function sameTopic(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  return norm(a) === norm(b);
}

// ─── Goi API ────────────────────────────────────────────────────────────────

const json = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });

export const problemsApi = {
  /** Bai da xuat ban (public) */
  listPublished: () => apiFetch<ProblemView[]>('/api/problems'),
  get: (id: string | number) => apiFetch<ProblemView>(`/api/problems/${encodeURIComponent(String(id))}`),

  // giang vien / admin
  listAll: () => apiFetch<AdminProblem[]>('/api/problems/manage'),
  listDrafts: () => apiFetch<AdminProblem[]>('/api/problems/drafts'),
  verify: (id: number | string) => apiFetch<VerifyResult>(`/api/problems/${id}/verify`, { method: 'POST' }),
  publish: (id: number | string) => apiFetch<AdminProblem>(`/api/problems/${id}/publish`, { method: 'PUT' }),
  unpublish: (id: number | string) => apiFetch<AdminProblem>(`/api/problems/${id}/unpublish`, { method: 'PUT' }),
  /** Chi ADMIN (giang vien nhan 403) */
  remove: (id: number | string) => apiFetch<void>(`/api/problems/${id}`, { method: 'DELETE' }),
};

export const judgeApi = {
  /** Chay thu voi test case mau, khong luu lich su */
  run: (problemId: string | number, sourceCode: string, language: CodeLanguage) =>
    apiFetch<RunResponse>(
      '/api/run',
      json({ problem_id: Number(problemId), source_code: sourceCode, language_id: LANGUAGE_IDS[language] }),
    ),
  /** Nop bai: cham toan bo test case + AI phan tich, co luu lich su */
  submit: (problemId: string | number, sourceCode: string, language: CodeLanguage) =>
    apiFetch<AnalyzeResponse>(
      '/api/analyze',
      json({ problem_id: Number(problemId), source_code: sourceCode, language_id: LANGUAGE_IDS[language] }),
    ),
};

export const templateApi = {
  list: () => apiFetch<BackendTemplate[]>('/api/template'),
  /** Sinh 1 bien the (DRAFT) tu template; useAiParaphrase = AI viet lai de bai */
  generate: (templateId: number, useAiParaphrase: boolean) =>
    apiFetch<AdminProblem>('/api/template/generate', json({ template_id: templateId, use_ai_paraphrase: useAiParaphrase })),
};

export const historyApi = {
  mine: () => apiFetch<HistoryItem[]>('/api/history/me'),
};
