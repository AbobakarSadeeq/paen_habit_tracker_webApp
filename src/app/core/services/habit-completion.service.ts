import { Injectable } from '@angular/core';
import { HabitCompletionRepositoryService } from '../../data/habit-completion-repository.service';

@Injectable({
  providedIn: 'root'
})
export class HabitCompletionService {

  constructor(private _habitCompletionRepository: HabitCompletionRepositoryService) { }



  async getDataForMainContributionGridAsync(startDate: string, endDate: string): Promise<{ [key: string]: number }> {

    // get habit_completion data from db from start of that year till that year last day.
    let habitCompletion = await this._habitCompletionRepository.getHabitCompletionsFromDbAsync(startDate, endDate);

    // how much time habits_completion done on each day start it from startDate till values is completed.
    let grouped = this._groupBySameDateWithCountsOfHabitCompletion(habitCompletion);
    return grouped;

  }

  private _groupBySameDateWithCountsOfHabitCompletion(habitCompletion: any): { [key: string]: number } {
    return habitCompletion.reduce((acc: Record<string, number>, item: any) => {
      acc[item.doneDate] = (acc[item.doneDate] || 0) + 1;
      return acc;
    }, {});
  }


}
