import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-habit-done-days-calender',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-done-days-calender.component.html',
  styleUrls: ['./habit-done-days-calender.component.css']
})
export class HabitDoneDaysCalenderComponent {

  @Input() doneCompletionsColorOnDates: string = '';
  @Input() specialDates: { day: number, month: number, year: number }[] = [];
  @Output() triggerOfChangingMonthInHabitDetail = new EventEmitter<Date>();

  currentMonth = new Date().getMonth(); // 0-based
  currentYear = new Date().getFullYear();

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  calendarDays: ({ day: number, month: number, year: number } | null)[] = [];

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, index) => {
      if (index < firstDayOfMonth) return null;

      const day = index - firstDayOfMonth + 1;
      return {
        day,
        month: this.currentMonth,
        year: this.currentYear
      };
    });
  }

  isSpecialDate(date: { day: number, month: number, year: number } | null): boolean {
    if (!date) return false;
    return this.specialDates.some(s =>
      s.day === date.day &&
      s.month === date.month &&
      s.year === date.year
    );
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
    const date = new Date(this.currentYear, this.currentMonth);
    this.triggerOfChangingMonthInHabitDetail.emit(date);
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
    const date = new Date(this.currentYear, this.currentMonth);
    this.triggerOfChangingMonthInHabitDetail.emit(date);

  }
}
