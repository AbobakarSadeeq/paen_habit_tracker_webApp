import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ContributionCalendarComponent } from "../../shared/components/contribute-calendar/contribution-calendar/contribution-calendar.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, ContributionCalendarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent {

  allContributionCountsAndWithTheirDatesData: { [key: string]: number } = {};

  ngOnInit(): void {

     this.allContributionCountsAndWithTheirDatesData = {
      '2025-01-01': 1,
      '2025-01-02': 2,
      '2025-01-03': 3,
      '2025-01-04': 4,
      '2025-01-05': 5,
      '2025-01-06': 6,
      '2025-05-06': 2,
      '2025-01-08': 8,
      '2025-01-09': 9,
      '2025-05-10': 10
    };


  }

}
