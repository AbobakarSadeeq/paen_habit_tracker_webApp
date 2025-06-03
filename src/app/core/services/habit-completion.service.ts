import { Injectable } from '@angular/core';
import { HabitCompletionRepositoryService } from '../../data/habit-completion-repository.service';
import { HabitCompletionMapper } from '../mapping/habit-completion.mapper';
import { HabitCompletionViewModel } from '../../presentation/view-models/habit-completion.view-model';
import { HabitCompletion } from '../models/entities/habit-completion';

@Injectable({
  providedIn: 'root'
})
export class HabitCompletionService {

  constructor(private _habitCompletionRepository: HabitCompletionRepositoryService) { }

  async getDataForMainContributionGridAsync(startDate: string, endDate: string): Promise<{ [key: string]: number }> {
    // get habit_completion data from db from start of that year till that year last day.
    let habitCompletionList = await this._habitCompletionRepository.getHabitCompletionsByStartAndEndDatesFromDbAsync(startDate, endDate);
    // how much time habits_completion done on each day start it from startDate till values is completed.
    let grouped = this._groupBySameDateWithCountsOfHabitCompletion(habitCompletionList);
    return grouped;
  }

  private _groupBySameDateWithCountsOfHabitCompletion(habitCompletionList: HabitCompletion[]): { [key: string]: number } {
    return habitCompletionList.reduce((acc: Record<string, number>, item: any) => {
      acc[item.doneDate] = (acc[item.doneDate] || 0) + 1;
      return acc;
    }, {});
  }

  async getDataForSingleHabitContributionGridByHabitIdAndSelectedYearAsync(habitId: number, yearSelected: string): Promise<{ [key: string]: number }> {
    const habitCompletionList = await this._habitCompletionRepository.getSelectedHabitContributionDataFromDbByHabitIdAndSelectedYearAsync(habitId, yearSelected);
    return habitCompletionList;
  }

  async getAllHabitsCompleteionForExportingJsonFileAsync(assignPrimaryIdInOrderWiseToHabit: any): Promise<Record<string, any[]>> {
    const habitCompletionList = await this._habitCompletionRepository.getAllHabitsCompleteionForExportingJsonFileFromDbAsync(assignPrimaryIdInOrderWiseToHabit);
    return habitCompletionList;
  }

  async bulkSaveHabitsCompletionAsync(bulkHabitsCompletion: any[]): Promise<void> {
    await this._habitCompletionRepository.bulkSaveHabitsCompletionsOnDbAsync(bulkHabitsCompletion);
  }

  async addHabitCompletionAsync(habitFKeyId: number): Promise<void> {
    await this._habitCompletionRepository.addHabitCompletionOnDbAsync(habitFKeyId);
  }

  async deleteHabitCompletionOfTodayDayAsync(habitFKeyId: number): Promise<void> {
    await this._habitCompletionRepository.deleteHabitCompletionByHabitFkAndTodayDateIdFromDbAsync(habitFKeyId);
  }

  async deleteAllSingleHabitCompletionsbyHabitIdAsync(habitFKeyId: number): Promise<void> {
    await this._habitCompletionRepository.deleteAllSingleHabitCompletionByHabitIdFkFromDbAsync(habitFKeyId);
  }

  async getHabitCompletionListOfTodayDateAsync(): Promise<HabitCompletionViewModel[]> {
    const habitCompletionEntity = await this._habitCompletionRepository.getHabitCompletionListFromDbOfTodayDateAsync();
    const habitCompletionViewModel = HabitCompletionMapper.ToListHabitCompletionViewModel(habitCompletionEntity);
    return habitCompletionViewModel;
  }

  async getSelectedHabitStreak(habitId: number): Promise<object> {
    return await this._habitCompletionRepository.getSingleHabitStreakHabitCompletionFromDbAsync(habitId);
  }

  async resetHabitCompletionAsync(): Promise<void> {
    await this._habitCompletionRepository.resetHabitCompletionTableFromDbAsync();
  }

  async getSelectedMonthAndHabitIdAllCompletionsAsync(startDate: string, endDate: string, habitId: number): Promise<HabitCompletionViewModel[]> {
    let habitCompletionsOfSelectedMonth = await this._habitCompletionRepository.getSingleHabitCompletionsOfSelectedMonthFromDbAsync(startDate, endDate);
    let mappedToViewModelList = HabitCompletionMapper.ToListHabitCompletionViewModel(habitCompletionsOfSelectedMonth).filter(a => a.habitId == habitId);
    return mappedToViewModelList;
  }

  async getCountOfSelectedHabitAllCompletionsAsync(habitId: number): Promise<number> {
    return await this._habitCompletionRepository.getCountOfSingleHabitTotalAllHabitCompletionFromDbAsync(habitId);
  }

  async getAllCountOfSelectedHabitCompletionsOfSelectedYearOnlyAsync(habitId: number, selectedYear: number): Promise<number> {
    // below variable is big data but scoped.

    let allCompletionsOfSelectedHabit = await this._habitCompletionRepository.getHabitCompletionListByHabitFkIdFromDbAsync(habitId);
    let count = 0;
    // apply business logic but here fast way too much
    allCompletionsOfSelectedHabit.forEach(singleHabitCompletion => {
      let getYearFromDoneDate = singleHabitCompletion.doneDate[0] + singleHabitCompletion.doneDate[1] + singleHabitCompletion.doneDate[2] + singleHabitCompletion.doneDate[3];
      if (parseInt(getYearFromDoneDate) == selectedYear) {
        count++;
      }
    });
    return count;
  }

  // highest streak count algorithm below
  async longestStreakOfSelectedHabitAsync(habitId: number): Promise<number> {
    const allCompletionsOfSelectedHabit = await this._habitCompletionRepository.getHabitCompletionListByHabitFkIdFromDbAsync(habitId);
    let longestStreak = 0;
    let streakStart = 0;
    if (allCompletionsOfSelectedHabit.length) {
      let startStreakDate = new Date(parseInt(allCompletionsOfSelectedHabit[0].doneDate.slice(0, 4)),
        parseInt(allCompletionsOfSelectedHabit[0].doneDate.slice(5, 7)) - 1,
        parseInt(allCompletionsOfSelectedHabit[0].doneDate.slice(8, 10)));

      for (let singleHabitCompletion of allCompletionsOfSelectedHabit) {
        const year = parseInt(singleHabitCompletion.doneDate.slice(0, 4));
        const month = parseInt(singleHabitCompletion.doneDate.slice(5, 7)) - 1; // Month is 0-based
        const day = parseInt(singleHabitCompletion.doneDate.slice(8, 10));
        const doneDateHabit = new Date(year, month, day);
        const isDateMatched = this._isSameDate(doneDateHabit, startStreakDate);
        if (isDateMatched) {
          streakStart++
        } else {
          if (longestStreak < streakStart) {
            longestStreak = streakStart;
          }
          streakStart = 0;
        }
        const difference = this._getDaysDifference(doneDateHabit, startStreakDate);
        if (difference > 0) {
          startStreakDate.setDate(startStreakDate.getDate() + difference + 1); // add next day + the difference
          streakStart++; // not matched then again start the counting of streak from start.
          continue;
        }
        startStreakDate.setDate(startStreakDate.getDate() + 1); // add 1 day
      }

      // if one element or not get a chance that else is not executed for to assign data to longest then assign streak.
      if (streakStart > longestStreak && streakStart > 0)
        longestStreak = streakStart;

    }


    return longestStreak;
  }

  private _isSameDate(doneDate: Date, startStreakDate: Date): boolean {
    return (
      doneDate.getFullYear() === startStreakDate.getFullYear() &&
      doneDate.getMonth() === startStreakDate.getMonth() &&
      doneDate.getDate() === startStreakDate.getDate()
    );
  }

  private _getDaysDifference(doneDate: Date, startStreakDate: Date): number {
    const d1 = new Date(doneDate);
    const d2 = new Date(startStreakDate);

    // Get the difference in milliseconds
    const diffInMilliseconds = Math.abs(d2.getTime() - d1.getTime());

    // Convert milliseconds to days (milliseconds in a day = 86400000)
    const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);

    return diffInDays;
  }


}
