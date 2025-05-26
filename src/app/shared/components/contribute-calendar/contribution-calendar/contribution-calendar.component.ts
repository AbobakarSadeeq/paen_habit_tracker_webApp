import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-contribution-calendar',
  imports: [CommonModule],
  templateUrl: './contribution-calendar.component.html',
  styleUrl: './contribution-calendar.component.css'
})


export class ContributionCalendarComponent {
  weeks: any[][] = [];
  monthLabels: { name: string; column: number }[] = [];
  @Input() contributionCountsWithItsDates: { [key: string]: number } = {};
  @Input() selectedYear: number = 0;
  @Input() contributeColors: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedYear'] || changes['contributionCountsWithItsDates']) {
      this.generateContributionGridForYear(this.selectedYear, this.contributionCountsWithItsDates);
    }
  }

  generateContributionGridForYear(year: number, contributionCountsWithItsDates: { [key: string]: number }): void {
    const startDate = new Date(`${year.toString()}-01-01`);
    const endDate = new Date(`${year.toString()}-12-31`);
    const days: any[] = [];

    // start check from when month and year become same.
    //

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const onlyGettingDate = d.toLocaleDateString('sv-SE');

      if (contributionCountsWithItsDates[onlyGettingDate]) {
        const habitsDoneCurrentDayCount = contributionCountsWithItsDates[onlyGettingDate];

        days.push({
          date: onlyGettingDate,
          count: habitsDoneCurrentDayCount, // here assign how much contribution did happen on that day
          day: d.getDay(),
          month: d.getMonth()
        });

        continue;
      }

      // non contributation happens in this day
      days.push({
        date: onlyGettingDate,
        count: 0,
        day: d.getDay(),
        month: d.getMonth()
      });
    }



    this.weeks = this.chunkWeeks(days);
    this.generateMonthLabels();

  }

  chunkWeeks(days: any[]): any[][] {
    const weeks: any[][] = [];
    let week: any[] = [];

    // Pad the first week with empty days if the first day isn't Sunday
    const firstDayOfWeek = new Date(days[0].date).getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(null);
    }

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) week.push(null); // pad last week
      weeks.push(week);
    }

    return weeks;
  }

  getColor(count: number): string {
    const colors = [...this.contributeColors];
    return colors[Math.min(count, colors.length - 1)];
  }

  generateMonthLabels() {
    this.monthLabels = [];
    for (let w = 0; w < this.weeks.length; w++) {
      const firstDay = this.weeks[w].find(d => d); // skip nulls
      if (!firstDay) continue;

      const currentMonth = new Date(firstDay.date).getMonth();
      const monthName = new Date(firstDay.date).toLocaleString('default', { month: 'short' });

      if (
        w === 0 ||
        new Date(this.weeks[w - 1].find(d => d)?.date).getMonth() !== currentMonth
      ) {
        this.monthLabels.push({ name: monthName, column: w + 1 });
      }
    }
  }

}
