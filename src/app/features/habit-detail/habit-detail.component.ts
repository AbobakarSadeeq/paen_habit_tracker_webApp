import { Component, Inject } from '@angular/core';
import { HabitCompletionService } from '../../core/services/habit-completion.service';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitService } from '../../core/services/habit.service';
import { ContributionCalendarComponent } from "../../shared/components/contribute-calendar/contribution-calendar/contribution-calendar.component";

@Component({
  selector: 'app-habit-detail',
  imports: [RouterModule, ContributionCalendarComponent],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.css'
})
export class HabitDetailComponent {

  selectedHabitStreak: any = {}
  selectedYearContributionGrid: number = 0;
  allContributionCountsAndWithTheirDatesData: { [key: string]: number } = {};

  habitDetailViewModel: HabitViewModel = {
    Id: 0,
    name: '',
    color: '',
    createdAt: '',
    isHabitDoneToday: false
  };



  constructor(private _habitCompletionService: HabitCompletionService,
    private _habitService: HabitService,
    @Inject(ActivatedRoute) private _routeActivate: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    let habitId: number = parseInt(this._routeActivate.snapshot.params['Id']);

    this.habitDetailViewModel = await this._habitService.getHabitByIdAsync(habitId);
    this.selectedHabitStreak = await this._habitCompletionService.getSelectedHabitStreak(habitId);

    this.selectedYearContributionGrid = new Date().getFullYear();
    this.allContributionCountsAndWithTheirDatesData = await this._habitCompletionService.getDataForSingleHabitContributionGridByHabitIdAndSelectedYearAsync(habitId, this.selectedYearContributionGrid.toString());
  }
}
