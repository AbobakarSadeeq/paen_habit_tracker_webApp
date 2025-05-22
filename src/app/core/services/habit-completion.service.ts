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


  async getDataForSingleHabitContributionGridByHabitIdAndSelectedYearAsync(habitId: number, yearSelected: string): Promise<{ [key: string]: number }> {
    const habitCompletionList = await this._habitCompletionRepository.getSelectedHabitContributionDataFromDbByHabitIdAndSelectedYearAsync(habitId, yearSelected);
    return habitCompletionList;
  }

  async getAllHabitsCompleteionForExportingJsonFileAsync(assignPrimaryIdInOrderWiseToHabit:any): Promise<Record<string, any[]>> {
    const habitCompletionList = await this._habitCompletionRepository.getAllHabitsCompleteionForExportingJsonFileFromDbAsync(assignPrimaryIdInOrderWiseToHabit);
    return habitCompletionList;
  }


  async bulkSaveHabitsCompletionAsync(bulkHabitsCompletion: any[]): Promise<void> {
    await this._habitCompletionRepository.bulkSaveHabitsCompletionsOnDbAsync(bulkHabitsCompletion);
  }

  private _groupBySameDateWithCountsOfHabitCompletion(habitCompletionList: HabitCompletion[]): { [key: string]: number } {
    return habitCompletionList.reduce((acc: Record<string, number>, item: any) => {
      acc[item.doneDate] = (acc[item.doneDate] || 0) + 1;
      return acc;
    }, {});
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
}
