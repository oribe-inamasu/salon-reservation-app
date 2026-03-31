import { ServiceCourse, OptionService } from "./settings";

/**
 * 来店・予約の合計金額を算出する共通ロジック
 * 
 * @param courseId 選択されたコースのID
 * @param selectedOptions 選択されたオプションの配列 ({ optionId: string })
 * @param adjustmentPrice 調整額（文字列または数値）
 * @param serviceCourses すべてのサービスコース
 * @param optionServices すべてのオプションサービス
 * @returns 合計金額（数値）
 */
export function calculateTotalPrice(
  courseId: string,
  selectedOptions: { optionId: string }[],
  adjustmentPrice: string | number,
  serviceCourses: ServiceCourse[],
  optionServices: OptionService[]
): number {
  const course = serviceCourses.find(c => c.id === courseId);
  const basePrice = course ? course.price : 0;

  const optionsPrice = selectedOptions.reduce((sum, opt) => {
    const option = optionServices.find(o => o.id === opt.optionId);
    return sum + (option ? option.price : 0);
  }, 0);

  const adjustment = typeof adjustmentPrice === "string" ? parseInt(adjustmentPrice) || 0 : adjustmentPrice;
  
  return Math.max(0, basePrice + optionsPrice + adjustment);
}
