/**
 * Tu luu code dang lam vao localStorage (dung chung cho trang Luyen tap va Thi dau).
 * - Luu ngay moi lan go; moi de + moi ngon ngu mot ban rieng.
 * - localStorage -> dong tab / tat trinh duyet van con code (chi tren may dang dung).
 * - Lam theo cong tac "Tu dong luu ban nhap ma nguon" trong Cai dat (key 'app_auto_save').
 */
import type { CodeLanguage } from '@/lib/problemsApi';

/** Cong tac trong trang Cai dat — mac dinh bat */
export function isAutoSaveEnabled(): boolean {
  try {
    return localStorage.getItem('app_auto_save') !== 'false';
  } catch {
    return true;
  }
}

/** Khoa trang Luyen tap: gan voi nguoi dung -> 2 tai khoan dung chung may khong thay bai cua nhau */
export function practiceCodeKey(userId: string | number | null | undefined, problemId: string | number, lang: CodeLanguage) {
  return `practice_code_${userId ?? 'guest'}_${problemId}_${lang}`;
}

/** Khoa trang Thi dau: gan voi tung luot thi */
export function contestCodeKey(attemptId: number, problemId: number, lang: CodeLanguage) {
  return `contest_code_${attemptId}_${problemId}_${lang}`;
}

export function loadCode(key: string): string | null {
  if (!isAutoSaveEnabled()) return null;
  try {
    // sessionStorage: ban nhap cu cua trang Thi dau truoc khi doi sang localStorage
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveCode(key: string, value: string): void {
  if (!isAutoSaveEnabled()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // het dung luong / bi chan -> bo qua, khong lam hong trang
  }
}
