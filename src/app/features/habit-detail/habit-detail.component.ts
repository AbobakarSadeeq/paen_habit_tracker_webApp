import { Component, Inject } from '@angular/core';
import { HabitCompletionService } from '../../core/services/habit-completion.service';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitService } from '../../core/services/habit.service';
import { ContributionCalendarComponent } from "../../shared/components/contribute-calendar/contribution-calendar/contribution-calendar.component";
import { CommonModule } from '@angular/common';
import { DataSharingService } from '../../shared/services/data-sharing.service';
import { HabitDoneDaysCalenderComponent } from './habit-done-days-calender/habit-done-days-calender.component';
import { HabitCompletionViewModel } from '../../presentation/view-models/habit-completion.view-model';

@Component({
  selector: 'app-habit-detail',
  imports: [RouterModule, ContributionCalendarComponent, CommonModule, HabitDoneDaysCalenderComponent],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.css'
})
export class HabitDetailComponent {

  selectedHabitId!: number;

  selectedYear: number = 0;

  // contribution grid properties
  allContributionCountsAndWithTheirDatesData: { [key: string]: number } = {};

  showSpinner = false;

  selectedStartDate!: string;
  selectedStartEnd!: string;

  // habit detail value
  habitDetailViewModel: HabitViewModel = {
    Id: 0,
    name: '',
    color: '',
    description: '',
    imageUrl: '',
    createdAt: '',
    isHabitDoneToday: false
  };

  onlyDatesOfCompletionForCalender: { day: number; month: number; year: number }[] = [];

  // below are statis holders
  completedSelectedHabitTimesThisCurrentWeek: number = 0;
  averageWeeklyCompletion: number = 0;
  completedSelectedHabitTimesThisMonth: number = 0;
  completedSelectedHabitMonthlyConsistency: number = 0;
  selectedYearHabitCompletionsDoneCount: number = 0;
  longestStreakOfThisHabit: number = 0;
  selectedHabitStreak: any = {};
  totalEntireHabitCompletionsDoneCountOfSelectedHabit: number = 0;

  constructor(private _habitCompletionService: HabitCompletionService, private _habitService: HabitService, @Inject(ActivatedRoute) private _routeActivate: ActivatedRoute, private _dataSharing: DataSharingService) { }

  async ngOnInit(): Promise<void> {
    await this._initializeHabitsDetailCompletionsAsync();
  }

  async _initializeHabitsDetailCompletionsAsync(): Promise<void> {
    this._dataSharing.showSpinnerSubject.next(true);

    this.assignDatesToStartAndEndDates(new Date());

    let habitId: number = parseInt(this._routeActivate.snapshot.params['Id']);
    this.selectedHabitId = habitId;

    this.habitDetailViewModel = await this._habitService.getHabitByIdAsync(habitId);

    this.selectedYear = new Date().getFullYear();
    this.allContributionCountsAndWithTheirDatesData = await this._habitCompletionService.getDataForSingleHabitContributionGridByHabitIdAndSelectedYearAsync(habitId, this.selectedYear.toString());


    await this.getAllThoseUiStatesThatCanAchieveThroughSingleMonth();
    await this.getCountOfSelectedHabitCompletionsAsync();
    await this.getCountOfSelectedHabitAllCompletionOfSelectedYearAsync();
    await this.getHighestStreakCountOfSelectedHabitAsync();
    await this.getCurrentStreakCountOfSelectedHabitAsync();
    this._dataSharing.showSpinnerSubject.next(false);
  }

  // assign dates to selected date from start variable and end variable

  assignDatesToStartAndEndDates(date: Date): void {
    const startFromDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endFromDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.selectedStartDate = startFromDate.toLocaleDateString('sv-SE');
    this.selectedStartEnd = endFromDate.toLocaleDateString('sv-SE');
  }

  // get the ui states that can get through or calculate single month statis like (times done on this month), (times done on this week) etc...

  async getAllThoseUiStatesThatCanAchieveThroughSingleMonth(): Promise<void> {
    const selectedMonthAndHabitAllCompletions = await this._getSelectedMonthAndHabitAllCompletionsAsync();
    this.completedSelectedHabitTimesThisCurrentWeek = this._completedSelectedHabitTimesThisCurrentWeek(selectedMonthAndHabitAllCompletions);
    this.averageWeeklyCompletion = this._averageWeeklyCompletion(selectedMonthAndHabitAllCompletions);
    this.completedSelectedHabitTimesThisMonth = this._monthlyCompletionTimes(selectedMonthAndHabitAllCompletions);
    this.onlyDatesOfCompletionForCalender = this._singleMonthAllCompletionDates(selectedMonthAndHabitAllCompletions);
  }

  // get all completions of selected month

  async _getSelectedMonthAndHabitAllCompletionsAsync(): Promise<HabitCompletionViewModel[]> {
    const selectedMonthHabitsCompletionsList = await this._habitCompletionService
      .getSelectedMonthAndHabitIdAllCompletionsAsync(this.selectedStartDate, this.selectedStartEnd, this.selectedHabitId);
    return selectedMonthHabitsCompletionsList;
  }

  // completed Selected Habit Times This current Week

  _completedSelectedHabitTimesThisCurrentWeek(selectedMonthCompletions: HabitCompletionViewModel[]): number {
    let selectedHabitDoneOnThisWeekTimes = 0;
    const date = new Date();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday and week start from sunday
    const daysPassedWithoutIncludeToday = (dayOfWeek + 6) % 7; // Convert Sunday (0) to 6, Monday to 0, etc.
    const thisWeekPastDays = daysPassedWithoutIncludeToday + 1;  // Include today

    let listOfPassedDatesOfThisWeek: string[] = [];
    for (let passedDays = 0; thisWeekPastDays > passedDays; passedDays++) {
      let dateCopy = new Date(date);
      dateCopy.setDate(dateCopy.getDate() - passedDays);
      listOfPassedDatesOfThisWeek.push(dateCopy.toLocaleDateString('sv-SE'));
    }

    for (let startIndexReverseOnDataArr = selectedMonthCompletions.length - 1; startIndexReverseOnDataArr >= 0; startIndexReverseOnDataArr--) {
      let index = listOfPassedDatesOfThisWeek.findIndex(singleDate => singleDate == selectedMonthCompletions[startIndexReverseOnDataArr].doneDate);
      if (index == -1) {
        break;
      }

      selectedHabitDoneOnThisWeekTimes++;
    }

    return selectedHabitDoneOnThisWeekTimes;
  }

  // average Weekly Completion of entire month

  _averageWeeklyCompletion(selectedMonthCompletions: HabitCompletionViewModel[]): number {
    if (!selectedMonthCompletions.length) return 0;

    // Get the year and month from the first completion
    const sampleDate = new Date(selectedMonthCompletions[0].doneDate);
    const year = sampleDate.getFullYear();
    const month = sampleDate.getMonth();

    // Get total days in that month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calculate number of weeks in the month (considering partial weeks)
    const numberOfWeeks = Math.ceil(daysInMonth / 7);

    // Average per week
    return selectedMonthCompletions.length / numberOfWeeks;
  }

  // entire monthly habit completion

  _monthlyCompletionTimes(selectedMonthCompletions: HabitCompletionViewModel[]): number {
    return selectedMonthCompletions.length;
  }

  // get days for calender

  _singleMonthAllCompletionDates(selectedMonthCompletions: HabitCompletionViewModel[]): { day: number; month: number; year: number }[] {
    let dates: { day: number; month: number; year: number }[] = [];
    selectedMonthCompletions.forEach(singleCompletion => {
      let date = singleCompletion.doneDate.split('-');
      // month - 1 because on habit-done-days-calender month start from 0 index janurary
      dates.push({ day: parseInt(date[2]), month: parseInt(date[1]) - 1, year: parseInt(date[0]) })
    });

    return dates;

  }

  // get all habit completion count of single selected habit

  async getCountOfSelectedHabitCompletionsAsync(): Promise<void> {
    this.totalEntireHabitCompletionsDoneCountOfSelectedHabit = await this._habitCompletionService.getCountOfSelectedHabitAllCompletionsAsync(this.selectedHabitId);
  }

  // get count of selected year all completions of selected habit

  async getCountOfSelectedHabitAllCompletionOfSelectedYearAsync(): Promise<void> {
    this.selectedYearHabitCompletionsDoneCount = await this._habitCompletionService.getAllCountOfSelectedHabitCompletionsOfSelectedYearOnlyAsync(this.selectedHabitId, this.selectedYear);
  }

  // get highest streak count of selected habit

  async getHighestStreakCountOfSelectedHabitAsync(): Promise<void> {
    this.longestStreakOfThisHabit = await this._habitCompletionService.longestStreakOfSelectedHabitAsync(this.selectedHabitId);
  }

  // get current streak count of selected habit

  async getCurrentStreakCountOfSelectedHabitAsync(): Promise<void> {
    this.selectedHabitStreak = await this._habitCompletionService.getSelectedHabitStreak(this.selectedHabitId);
  }

  // month changed in calender handler

  async changeStatisByChangeInCalenderMonth(changeDate: Date): Promise<void> {
    this.assignDatesToStartAndEndDates(changeDate);
    await this.getAllThoseUiStatesThatCanAchieveThroughSingleMonth();

    if (changeDate.getFullYear() != this.selectedYear) {
      this.selectedYear = changeDate.getFullYear();
      this.allContributionCountsAndWithTheirDatesData = await this._habitCompletionService.
        getDataForSingleHabitContributionGridByHabitIdAndSelectedYearAsync(this.selectedHabitId, this.selectedYear.toString());

      await this.getCountOfSelectedHabitAllCompletionOfSelectedYearAsync();
    }
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
  }

}
