import { parse, isValid, differenceInYears } from "date-fns";

/**
 * 生年月日文字列を標準フォーマット (YYYY-MM-DD) に正規化します。
 * 8桁数字 (YYYYMMDD) または ハイフン区切り (YYYY-MM-DD) を受け入れます。
 * 
 * @param dateStr 生年月日文字列
 * @returns 正規化された文字列 (YYYY-MM-DD) または null
 */
export function normalizeBirthDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  const trimmed = dateStr.trim();
  
  // 既に YYYY-MM-DD 形式の場合
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // 8桁数字 (YYYYMMDD) の場合
  if (/^\d{8}$/.test(trimmed)) {
    const y = trimmed.substring(0, 4);
    const m = trimmed.substring(4, 6);
    const d = trimmed.substring(6, 8);
    return `${y}-${m}-${d}`;
  }

  // その他の形式 (YYYY/MM/DD など) を試行
  const formats = ["yyyy/MM/dd", "yyyy-MM-dd", "yyyyMMdd"];
  for (const fmt of formats) {
    const parsed = parse(trimmed, fmt, new Date());
    if (isValid(parsed)) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  return trimmed; // 変換不能な場合はそのまま返す（バリデーション用）
}

/**
 * 生年月日を元に指定された基準日時点での年齢を計算します。
 * 
 * @param birthDateStr 生年月日文字列 (YYYY-MM-DD または YYYYMMDD)
 * @param referenceDate 基準日（デフォルトは現在）
 * @returns 年齢 (数値) または null
 */
export function calculateAge(birthDateStr: string | null | undefined, referenceDate: Date = new Date()): number | null {
  if (!birthDateStr) return null;

  const normalized = normalizeBirthDate(birthDateStr);
  if (!normalized) return null;

  const birthDate = parse(normalized, "yyyy-MM-dd", new Date());
  if (!isValid(birthDate)) return null;

  return differenceInYears(referenceDate, birthDate);
}
