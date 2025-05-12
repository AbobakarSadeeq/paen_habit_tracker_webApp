import { Injectable } from '@angular/core';
import { HabitViewModel } from '../../presentation/view-models/habit.view-model';
import { HabitMapper } from '../mapping/habit.mapper';
import { HabitRepositoryService } from '../../data/habit-repository.service';
import { Habit } from '../models/entities/habit';

@Injectable({
  providedIn: 'root'
})
export class HabitServiceService {

  constructor(private _habitRepository: HabitRepositoryService) { }

  async storeHabitAsync(addHabitViewModel: HabitViewModel): Promise<HabitViewModel> {
    try {
      const habitEntity = HabitMapper.ToHabitEntity(addHabitViewModel);
      const savedEntity = await this._habitRepository.saveHabitOnDbAsync(habitEntity);
      return HabitMapper.ToHabitViewModel(savedEntity);
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  }

  async getAllHabitsAsync(): Promise<HabitViewModel[]> {
    try {
      let entityList = await this._habitRepository.getAllHabitsFromDbAsync();
      return HabitMapper.ToListHabitViewModel(entityList);
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

  async updateHabitsAsync(updateHabitViewModel:HabitViewModel): Promise<void> {
    try {
      const habitEntity = HabitMapper.ToHabitEntity(updateHabitViewModel);
      await this._habitRepository.updateHabitOnDbAsync(habitEntity);
    } catch (error) {
      console.error('Error update habit:', error);
      throw error;
    }
  }

}
