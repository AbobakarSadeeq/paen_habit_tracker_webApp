import { Injectable } from '@angular/core';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitMapper } from '../mapping/habit.mapper';
import { HabitRepositoryService } from '../../data/habit-repository.service';
import { HabitCompletionRepositoryService } from '../../data/habit-completion-repository.service';

@Injectable({
  providedIn: 'root'
})
export class HabitServiceService {

  constructor(private _habitRepository: HabitRepositoryService, private _habitCompletionRepository: HabitCompletionRepositoryService) { }

  async storeHabitAsync(addHabitViewModel: HabitViewModel): Promise<HabitViewModel> {
    try {
      const habitEntity = HabitMapper.ToHabitEntity(addHabitViewModel);
      const savedEntity = await this._habitRepository.saveHabitOnDbAsync(habitEntity);
      const isHabitDoneToday = false; // by default whenever user add new habit then it will not be not done on added habit time.
      return HabitMapper.ToHabitViewModel(savedEntity, isHabitDoneToday);
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  }

  async getAllHabitsAsync(): Promise<HabitViewModel[]> {
    try {
      let habitList = await this._habitRepository.getAllHabitsFromDbAsync();
      let viewModelHabitList = HabitMapper.ToListHabitViewModel(habitList, false);
      var habitCompletedListToday = await this._habitCompletionRepository.getHabitCompletionListFromDbOfTodayDateAsync();
      for (let singleHabitCompletion of habitCompletedListToday) {
        let findIndex:number= viewModelHabitList.findIndex(singleHabit => singleHabit.Id == singleHabitCompletion.habitId);
        if (findIndex != -1)
          viewModelHabitList[findIndex].isHabitDoneToday = true;
      }
      console.log(viewModelHabitList);
      return viewModelHabitList;
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  }

  async deleteHabitAsync(habitId: number): Promise<void> {
    try {
      await this._habitRepository.deleteHabitByIdFromDbAsync(habitId);
    } catch (error) {
      console.error('Error delete habit:', error);
      throw error;
    }
  }

  async updateHabitsAsync(updateHabitViewModel: HabitViewModel): Promise<void> {
    try {
      const habitEntity = HabitMapper.ToHabitEntity(updateHabitViewModel);
      await this._habitRepository.updateHabitOnDbAsync(habitEntity);
    } catch (error) {
      console.error('Error update habit:', error);
      throw error;
    }
  }

}
