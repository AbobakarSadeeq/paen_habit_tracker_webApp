export class DateTimePicker {
  public static getLocalTodayDateOnly() : string {
    const date = new Date();
    return date.toLocaleDateString('sv-SE');
  }
}
