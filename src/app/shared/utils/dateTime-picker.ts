export class DateTimePicker {
  public static getLocalTodayDateOnly() : string {
    const date = new Date();
    return date.toLocaleDateString('sv-SE'); // 2025-01-01 format YYYY-MM-DD
  }
}
