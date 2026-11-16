/**
 * Ôn luyện ghép thẻ có thể chạy trên 1 bộ ("12") hoặc gộp nhiều bộ ("12,15,20").
 * Danh sách id được truyền qua cùng tham số `set` trên URL, ngăn bởi dấu phẩy.
 */

/** "12" -> [12]; "12,15,20" -> [12,15,20]; bỏ giá trị không hợp lệ và trùng lặp. */
export function parseDeckIds(setId: string | undefined | null): number[] {
  if (!setId) return [];
  const ids = setId
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  return Array.from(new Set(ids));
}

/** true khi tham số `set` chứa từ 2 bộ trở lên. */
export function isMultiDeck(setId: string | undefined | null): boolean {
  return parseDeckIds(setId).length > 1;
}
