import { Component, Inject } from '@angular/core';
import { HabitCompletionService } from '../../core/services/habit-completion.service';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitService } from '../../core/services/habit.service';
import { ContributionCalendarComponent } from "../../shared/components/contribute-calendar/contribution-calendar/contribution-calendar.component";
import { CommonModule } from '@angular/common';
import { DataSharingService } from '../../shared/services/data-sharing.service';

@Component({
  selector: 'app-habit-detail',
  imports: [RouterModule, ContributionCalendarComponent, CommonModule],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.css'
})
export class HabitDetailComponent {

  // contribution grid properties
  selectedHabitStreak: any = {}
  selectedYearContributionGrid: number = 0;
  allContributionCountsAndWithTheirDatesData: { [key: string]: number } = {};

  showSpinner = false;

  // habit detail value
  habitDetailViewModel: HabitViewModel = {
    Id: 0,
    name: '',
    color: '',
    createdAt: '',
    isHabitDoneToday: false
  };



  constructor(private _habitCompletionService: HabitCompletionService,
    private _habitService: HabitService,
    @Inject(ActivatedRoute) private _routeActivate: ActivatedRoute,
    private _dataSharing: DataSharingService) { }

  async ngOnInit(): Promise<void> {
    this._dataSharing.showSpinnerSubject.next(true);
    let habitId: number = parseInt(this._routeActivate.snapshot.params['Id']);

    this.habitDetailViewModel = await this._habitService.getHabitByIdAsync(habitId);
    this.selectedHabitStreak = await this._habitCompletionService.getSelectedHabitStreak(habitId);

    this.selectedYearContributionGrid = new Date().getFullYear();
    this.allContributionCountsAndWithTheirDatesData = await this._habitCompletionService.getDataForSingleHabitContributionGridByHabitIdAndSelectedYearAsync(habitId, this.selectedYearContributionGrid.toString());
    this._dataSharing.showSpinnerSubject.next(false);
  }

}
