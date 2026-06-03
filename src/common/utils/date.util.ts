/**
 * 日期格式化工具
 *
 * 提供常用的日期处理方法
 */
export class DateUtil {
  /**
   * 转为 ISO 字符串
   */
  static toISO(date: Date): string {
    return date.toISOString();
  }

  /**
   * 转为本地化字符串
   */
  static toLocale(date: Date, locale = 'zh-CN'): string {
    return date.toLocaleString(locale);
  }

  /**
   * 检查时间戳是否在指定窗口内
   * @param timestamp - 时间戳（毫秒）
   * @param windowMs - 窗口大小（毫秒）
   */
  static isWithinWindow(timestamp: number, windowMs: number): boolean {
    const now = Date.now();
    return now - timestamp <= windowMs && timestamp <= now;
  }
}
