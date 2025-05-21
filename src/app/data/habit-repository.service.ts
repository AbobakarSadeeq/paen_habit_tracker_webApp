import { Injectable } from '@angular/core';
import { Habit } from '../core/models/entities/habit';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitRepositoryService {

  constructor(private _dbContext: NgxIndexedDBService) { }

  async saveHabitOnDbAsync(habitEntity: Habit): Promise<Habit> {
    const storeData: any = await firstValueFrom(this._dbContext.add('habits', {
      name: habitEntity.name,
      color: habitEntity.color,
      createdAt: habitEntity.createdAt
    }));
    let result: Habit = {
      Id: storeData.Id,
      name: storeData.name,
      color: storeData.color,
      createdAt: storeData.createdAt,
    }
    return result;
  }

  async getAllHabitsFromDbAsync(): Promise<Habit[]> {
    const habits = await firstValueFrom(this._dbContext.getAll<Habit>('habits'));
    return habits;
  }

  async bulkSaveHabitsOnDbAsync(habitList: any[]): Promise<number[]> {
    return await firstValueFrom(this._dbContext.bulkAdd('habits', habitList));
  }

  async getHabitFromDbByIdAsync(habitId: number): Promise<Habit> {
    const habits = await firstValueFrom(this._dbContext.getByID<Habit>('habits', habitId));
    return habits;
  }

  async deleteHabitByIdFromDbAsync(deleteId: number): Promise<void> {
    await firstValueFrom(this._dbContext.deleteByKey('habits', deleteId));
  }

  async updateHabitOnDbAsync(updateHabit: Habit): Promise<void> {
    firstValueFrom(this._dbContext.update('habits', updateHabit));
  }

  async resetHabitTableFromDbAsync(): Promise<void> {
    await firstValueFrom(this._dbContext.clear('habits'));
  }

}
