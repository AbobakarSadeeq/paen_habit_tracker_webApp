import { Injectable } from '@angular/core';
import { HabitCompletionRepositoryService } from '../../data/habit-completion-repository.service';
import { HabitCompletionMapper } from '../mapping/habit-completion.mapper';
import { HabitCompletionViewModel } from '../../presentation/view-models/habit-completion.view-model';
import { HabitCompletion } from '../models/entities/habit-completion';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitCompletionService {

  constructor(private _habitCompletionRepository: HabitCompletionRepositoryService) { }

  async abc(): Promise<void> {
  // await this._habitCompletionRepository.addHabitCompletionOnDbAsync(22);
   //   var aa = await firstValueFrom(this._habitCompletionRepository.getSingleOfHabitCompletionStreakFromDbAsync(22));
     // console.log(aa);
    //var aa = {};
  //  aa = this._habitCompletionRepository._computingStreaks([

      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-11' },
      // { 'habitId': 22, 'doneDate': '2025-05-10' },
      // { 'habitId': 22, 'doneDate': '2025-05-09' },
      // { 'habitId': 22, 'doneDate': '2025-05-08' },

      // { 'habitId': 22, 'doneDate': '2025-05-14' },
      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-10' },
      // { 'habitId': 22, 'doneDate': '2025-05-09' },
      // { 'habitId': 22, 'doneDate': '2025-05-08' },

      // { 'habitId': 22, 'doneDate': '2025-05-14' },
      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-12' },
      // { 'habitId': 22, 'doneDate': '2025-05-09' },
      // { 'habitId': 22, 'doneDate': '2025-05-08' },

      // { 'habitId': 22, 'doneDate': '2025-05-05' },
      // { 'habitId': 22, 'doneDate': '2025-05-04' },
      // { 'habitId': 22, 'doneDate': '2025-05-03' },
      // { 'habitId': 22, 'doneDate': '2025-05-02' },
      // { 'habitId': 22, 'doneDate': '2025-05-01' },

      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-12' },
      // { 'habitId': 22, 'doneDate': '2025-05-11' },
      // { 'habitId': 22, 'doneDate': '2025-05-10' },
      // { 'habitId': 22, 'doneDate': '2025-05-09' },

      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-12' },
      // { 'habitId': 22, 'doneDate': '2025-05-10' },
      // { 'habitId': 22, 'doneDate': '2025-05-09' },
      // { 'habitId': 22, 'doneDate': '2025-05-08' },

      // { 'habitId': 22, 'doneDate': '2025-05-14' },
      // { 'habitId': 22, 'doneDate': '2025-05-12' },
      // { 'habitId': 22, 'doneDate': '2025-05-10' },
      // { 'habitId': 22, 'doneDate': '2025-05-09' },
      // { 'habitId': 22, 'doneDate': '2025-05-08' },

      // { 'habitId': 22, 'doneDate': '2025-05-14' },
      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-12' },
      // { 'habitId': 22, 'doneDate': '2025-05-11' },
      // { 'habitId': 22, 'doneDate': '2025-05-10' },

      // { 'habitId': 22, 'doneDate': '2025-05-14' },
      // { 'habitId': 22, 'doneDate': '2025-05-06' },
      // { 'habitId': 22, 'doneDate': '2025-05-05' },
      // { 'habitId': 22, 'doneDate': '2025-05-04' },
      // { 'habitId': 22, 'doneDate': '2025-05-03' },

      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-06' },
      // { 'habitId': 22, 'doneDate': '2025-05-05' },
      // { 'habitId': 22, 'doneDate': '2025-05-04' },
      // { 'habitId': 22, 'doneDate': '2025-05-03' },

      // { 'habitId': 22, 'doneDate': '2025-05-14' },
      // { 'habitId': 22, 'doneDate': '2025-05-13' },
      // { 'habitId': 22, 'doneDate': '2025-05-05' },
      // { 'habitId': 22, 'doneDate': '2025-05-04' },
      // { 'habitId': 22, 'doneDate': '2025-05-03' },

  //  ], aa);
  //  console.log(aa);


    console.log('yess abob');
    //  console.log(aa);


    // todo tomorrow
    // make the HabitCompletion entity (done)
    // clean code
    // convert isoDateTime to localTime (only on habit_completion)
    // storing of habitId on habitCompletion is on string but i want to store it in number (done)
    // convert that streak code into promise


  }

  async getDataForMainContributionGridAsync(startDate: string, endDate: string): Promise<{ [key: string]: number }> {
    await this.abc();
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

  async addHabitCompletionAsync(habitFKeyId: number): Promise<void> {
    await this._habitCompletionRepository.addHabitCompletionOnDbAsync(habitFKeyId);
  }

  async deleteHabitCompletionAsync(habitFKeyId: number): Promise<void> {
    await this._habitCompletionRepository.deleteHabitCompletionByHabitFkIdFromDbAsync(habitFKeyId);
  }

  async getHabitCompletionListOfTodayDateAsync(): Promise<HabitCompletionViewModel[]> {
    const habitCompletionEntity = await this._habitCompletionRepository.getHabitCompletionListFromDbOfTodayDateAsync();
    const habitCompletionViewModel = HabitCompletionMapper.ToListHabitCompletionViewModel(habitCompletionEntity);
    return habitCompletionViewModel;
  }


}
